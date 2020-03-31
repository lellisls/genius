export default function createGame() {
  let startScreenCommand = {
    type: "render",
    data: {
      screen: "bigTextScreen",
      text: "GENIUS",
      buttonText: "Start!",
      buttonAction: "startGame"
    }
  };

  let lostGameScreenCommand = {
    type: "render",
    data: {
      screen: "bigTextScreen",
      text: "You lost",
      buttonText: "Start!",
      buttonAction: "startGame"
    }
  };

  let wonGameScreenCommand = {
    type: "render",
    data: {
      screen: "bigTextScreen",
      text: "You won",
      buttonText: "Next!",
      buttonAction: "nextLevel"
    }
  };

  let boardScreenCommand = {
    type: "render",
    data: {
      screen: "bigTextScreen",
      text: "You lost",
      buttonText: "Restart!",
      buttonAction: "startGame"
    }
  };

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
    notifyAll(startScreenCommand);
    state.playing = false;
  }

  function getMaxIterations() {
    return 2 * (level + 2) + 1;
  }

  function iterate() {
    if (!playing) {
      return;
    }

    state = iterator % 2 ? Math.round(Math.random() * 10000) % 4 : -1;

    presentation.drawGameBoard();
    if (state >= 0) {
      audio.beep(20, frequencies[state], 100);
      gameContext.push(state);
    }

    iterator++;
    if (iterator < getMaxIterations()) {
      setTimeout(() => iterate(), 500);
    }
  }

  function clearLevel() {
    iterator = 0;
    state = -1;
    gameContext = [];
    answerIterator = 0;
    playing = true;
    iterate();
  }

  function nextLevel() {
    level++;
    clearLevel();
  }

  function restart() {
    console.log("RESTART!");
    audio.setup();
    level = 1;
    clearLevel();
  }

  function buttonClicked(clickedRegion) {
    if (iterator != getMaxIterations()) {
      return;
    }

    state = Number(clickedRegion);
    presentation.drawGameBoard();
    audio.beep(20, frequencies[state], 100);

    if (gameContext[answerIterator] !== state) {
      drawBigText(`You lost at level ${level}!`);
      drawRestartButton("Restart!", "restart");
      console.log(`${gameContext[answerIterator]} !== ${state}`);
      console.log(answerIterator);
      console.log(gameContext);
      answerIterator = gameContext.length;
      return;
    }

    answerIterator++;
    if (answerIterator == gameContext.length) {
      drawBigText(`You won level ${level}!`);
      drawRestartButton("Next!", "next");
      return;
    }
  }

  function startPage() {
    drawBigText("GENIUS");
    drawRestartButton("Start!", "restart");
  }

  function regionClicked(clickedRegion) {
    if (clickedRegion === null) {
      return;
    }

    console.log(`Region ${clickedRegion} was clicked!`);

    if (clickedRegion === "restart") {
      restart();
      return;
    }

    if (clickedRegion === "restart2") {
      startPage();
      return;
    }
    if (clickedRegion === "next") {
      nextLevel();
      return;
    }

    if (Number(clickedRegion) >= 0) buttonClicked(clickedRegion);
  }

  function regionReleased(clickedRegion) {
    if (answerIterator < gameContext.length) {
      if (iterator != getMaxIterations()) {
        return;
      }
      state = -1;
      presentation.drawGameBoard();
    }
  }

  function eventHandler(command) {}

  return {
    initialize,
    subscribe,
    unsubscribeAll,
    eventHandler
  };
}
