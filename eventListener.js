export default function createEventListener(canvas) {
  let state = {
    observers: [],
    buttons: new Map()
  };

  const context = canvas.getContext("2d");

  function subscribe(observerFunction) {
    state.observers.push(observerFunction);
  }

  function unsubscribeAll() {
    state.observers = [];
  }

  function notifyAll(command) {
    console.log("EventListener: ", command);
    for (const observerFunction of state.observers) {
      observerFunction(command);
    }
  }

  function regionClicked(clickX, clickY) {
    for (let [region, button] of state.buttons.entries()) {
      if (context.isPointInPath(button, clickX, clickY)) {
        const command = {
          type: "regionClicked",
          data: { region }
        };
        notifyAll(command);
        break;
      }
    }
  }

  function regionReleased() {
    const command = {
      type: "regionReleased",
      data: {}
    };

    notifyAll(command);
  }

  function sizeUpdated() {
    const command = {
      type: "sizeUpdated",
      data: {
        width: document.body.clientWidth,
        height: document.body.clientHeight
      }
    };

    notifyAll(command);
  }

  function eventHandler(command) {
    const acceptedCommands = {
      buttonsUpdated: ({ buttons }) => {
        state.buttons = buttons;
      }
    };

    const commandFunction = acceptedCommands[command.type];

    if (commandFunction) {
      console.log(`EventListener received: ${command.type}`);
      commandFunction(command.data);
    }
  }

  canvas.addEventListener(
    "mousedown",
    evt => regionClicked(evt.clientX, evt.clientY),
    false
  );

  canvas.addEventListener("mouseup", evt => regionReleased(), false);

  window.onresize = evt => sizeUpdated();

  return {
    subscribe,
    unsubscribeAll,
    eventHandler
  };
}
