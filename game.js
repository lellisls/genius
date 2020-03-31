export default function createGame() {
  function startScreenCommand() {
    return {
      type: "render",
      data: {
        screen: "bigTextScreen",
        text: "GENIUS",
        buttonText: "Start!",
        buttonAction: "startGame"
      }
    };
  }

  function lostGameScreenCommand() {
    return {
      type: "render",
      data: {
        screen: "bigTextScreen",
        text: `You lost at level ${state.level}`,
        buttonText: "Start!",
        buttonAction: "startGame"
      }
    };
  }

  function wonGameScreenCommand() {
    return {
      type: "render",
      data: {
        screen: "bigTextScreen",
        text: `You won at level ${state.level}`,
        buttonText: "Next!",
        buttonAction: "nextLevel"
      }
    };
  }

  function boardScreenCommand() {
    return {
      type: "render",
      data: {
        screen: "boardScreen",
        buttonText: "Restart!",
        buttonAction: "startScreen",
        boardState: state.boardState,
        level: state.level
      }
    };
  }

  function audioSetupCommand() {
    return {
      type: "audioSetup",
      data: {}
    };
  }

  function audioBeepCommand() {
    return {
      type: "audioBeep",
      data: {
        zone: state.boardState
      }
    };
  }

  let state = {
    iterator: 0,
    level: 1,
    answerIterator: 0,
    playing: false,
    gameContext: [],
    observers: []
  };

  function subscribe(observerFunction) {
    state.observers.push(observerFunction);
  }

  function unsubscribeAll() {
    state.observers = [];
  }

  function notifyAll(command) {
    console.log("Game: ", command);
    for (const observerFunction of state.observers) {
      observerFunction(command);
    }
  }

  function initialize() {
    notifyAll(startScreenCommand());
    state.playing = false;
  }

  function getMaxIterations() {
    return 2 * (state.level + 2) + 1;
  }

  function iterate() {
    if (!state.playing) {
      return;
    }

    state.boardState =
      state.iterator % 2 ? Math.round(Math.random() * 10000) % 4 : -1;

    notifyAll(boardScreenCommand());
    if (state.boardState >= 0) {
      notifyAll(audioBeepCommand());
      state.gameContext.push(state.boardState);
    }

    state.iterator++;
    if (state.iterator < getMaxIterations()) {
      setTimeout(() => iterate(), 500);
    }
  }

  function clearLevel() {
    state.iterator = 0;
    state.boardState = -1;
    state.gameContext = [];
    state.answerIterator = 0;
    state.playing = true;
    iterate();
  }

  function nextLevel() {
    state.level++;
    clearLevel();
  }

  function startGame() {
    console.log("RESTART!");
    notifyAll(audioSetupCommand());

    state.level = 1;
    clearLevel();
  }

  function zoneClicked(clickedRegion) {
    if (state.iterator != getMaxIterations()) {
      return;
    }

    state.boardState = Number(clickedRegion);
    notifyAll(boardScreenCommand());
    notifyAll(audioBeepCommand());

    if (state.gameContext[state.answerIterator] !== state.boardState) {
      notifyAll(lostGameScreenCommand());
      console.log(
        `${state.gameContext[state.answerIterator]} !== ${state.boardState}`
      );
      console.log(state.answerIterator);
      console.log(state.gameContext);
      state.answerIterator = state.gameContext.length;
      return;
    }

    state.answerIterator++;
    if (state.answerIterator == state.gameContext.length) {
      notifyAll(wonGameScreenCommand());
      return;
    }
  }

  function startScreen() {
    state.playing = false;
    notifyAll(startScreenCommand());
  }

  function regionClicked({ region }) {
    if (region === null) {
      return;
    }

    const acceptedRegions = {
      startGame,
      startScreen,
      nextLevel,
      zone0: () => zoneClicked(0),
      zone1: () => zoneClicked(1),
      zone2: () => zoneClicked(2),
      zone3: () => zoneClicked(3)
    };

    const regionFunction = acceptedRegions[region];

    if (regionFunction) {
      console.log(`Region ${region} was clicked!`);
      regionFunction();
    }
  }

  function regionReleased() {
    if (state.answerIterator < state.gameContext.length) {
      if (state.iterator != getMaxIterations()) {
        return;
      }
      state.boardState = -1;
      notifyAll(boardScreenCommand());
    }
  }

  function eventHandler(command) {
    const acceptedCommands = {
      regionClicked,
      regionReleased
    };

    const commandFunction = acceptedCommands[command.type];

    if (commandFunction) {
      console.log(`Game received: ${command.type}`);
      commandFunction(command.data);
    }
  }

  return {
    initialize,
    subscribe,
    unsubscribeAll,
    eventHandler
  };
}
