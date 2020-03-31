export default function createPresentation(canvas) {
  const colors_on = ["#00FF00", "#FF0000", "#0000FF", "#FFFF00"];
  const colors_off = ["#007700", "#770000", "#000077", "#777700"];

  const context = canvas.getContext("2d");

  let state = {
    boardDimensions: {
      centerX: 0.0,
      centerY: 0.0,
      radius: 1.0
    },
    currentScreenData: null
  };

  function recalculateSize(width, height) {
    canvas.height = height;
    canvas.width = width;
    state.boardDimensions.centerX = width / 2;
    state.boardDimensions.centerY = height / 2;
    state.boardDimensions.radius = (Math.min(width, height) / 2) * 0.7;
    render(state.currentScreenData);
  }

  function clearScreen() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawGameBoard(boardState, level) {
    const { centerX, centerY, radius } = state.boardDimensions;
    clearScreen();
    context.beginPath();
    context.shadowBlur = 10;
    context.shadowColor = "black";
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fill();

    for (let step = 0; step < 2; ++step) {
      for (let i = 0; i < 4; i++) {
        if (boardState === i && !step) {
          continue;
        }

        context.beginPath();
        context.fillStyle = boardState === i ? colors_on[i] : colors_off[i];
        context.shadowBlur = boardState === i ? 10 : 0;
        context.shadowColor = colors_on[i];

        context.lineWidth = 5;
        context.arc(
          centerX,
          centerY,
          radius,
          0.5 * Math.PI * i,
          0.5 * Math.PI * (i + 1),
          false
        );
        context.lineTo(centerX, centerY);
        context.closePath();
        context.fill();
        context.addHitRegion({ id: i });
      }
    }
    drawButton("Restart!", "restart2");
    drawUpperCornerText(`Level: ${level}`);
  }

  function drawButton(text, id) {
    const context = canvas.getContext("2d");

    context.fillStyle = "#DDDDEE";
    context.shadowBlur = 10;
    context.shadowColor = "black";

    let rectWidth = 100;
    let rectHeight = 40;
    context.beginPath();
    context.rect(
      canvas.width - rectWidth - 10,
      canvas.height - rectHeight - 10,
      rectWidth,
      rectHeight
    );
    context.fill();
    context.addHitRegion({ id });

    context.fillStyle = "#333";
    context.shadowBlur = 0;
    context.font = "20px Verdana";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillText(
      text,
      canvas.width - rectWidth / 2 - 10,
      canvas.height - rectHeight / 2 - 10
    );
  }

  function drawUpperCornerText(text) {
    const context = canvas.getContext("2d");

    context.fillStyle = "#333";
    context.shadowBlur = 0;
    context.font = "28px Verdana";
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.fillText(text, 20, 30);
  }

  function drawBigText(text) {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#333";
    context.shadowBlur = 0;
    context.font = "60px Verdana";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  function render(screenData) {
    if (!screenData) {
      return;
    }

    const screenRenders = {
      bigTextScreen: () => {
        drawBigText(screenData.text);
        drawButton(screenData.buttonText, screenData.buttonAction);
      },
      boardScreen: () => {
        drawGameBoard(screenData.boardState, screenData.level);
      }
    };

    const renderFunction = screenRenders[screenData.screen];

    if (renderFunction) {
      console.log(`Render screen: ${screenData.screen}`);
      state.currentScreenData = screenData;
      renderFunction(screenData);
    }
  }

  function eventHandler(command) {
    const acceptedCommands = {
      sizeUpdated: ({ width, height }) => {
        recalculateSize(width, height);
      },
      render
    };

    const commandFunction = acceptedCommands[command.type];

    if (commandFunction) {
      console.log(`Presentation received: ${command.type}`);
      commandFunction(command.data);
    }
  }

  return {
    eventHandler,
    recalculateSize
  };
}
