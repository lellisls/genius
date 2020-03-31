export default function createEventListener(canvas) {
  let state = {
    observers: []
  };

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

  function regionClicked(region) {
    if (region === null) {
      return;
    }

    const command = {
      type: "regionClicked",
      region
    };

    notifyAll(command);
  }

  function regionReleased(region) {
    const command = {
      type: "regionReleased",
      region
    };

    notifyAll(command);
  }

  function sizeUpdated() {
    const command = {
      type: "sizeUpdated",
      width: document.body.clientWidth,
      height: document.body.clientHeight
    };

    notifyAll(command);
  }

  canvas.addEventListener(
    "mousedown",
    evt => regionClicked(evt.region),
    false
  );

  canvas.addEventListener(
    "mouseup",
    evt => regionReleased(evt.region),
    false
  );

  window.onresize = evt => sizeUpdated();

  return {
    subscribe,
    unsubscribeAll
  };
}
