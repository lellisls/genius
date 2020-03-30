const colors_on = ["#00FF00", "#FF0000", "#0000FF", "#FFFF00"];
const colors_off = ["#007700", "#770000", "#000077", "#777700"];
const frequencies = [130.812775, 146.832367, 164.813782, 174.614105];
let centerX;
let centerY;
let radius;
let canvas;

let state = -1;
let audioContext = null;
let iterator = 0;
let level = 1;
let answerIterator = 0;
let playing = false;

let gameContext = [];

function updateSize() {
  canvas.height = document.body.clientHeight;
  canvas.width = document.body.clientWidth;

  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  radius = (Math.min(canvas.width, canvas.height) / 2) * 0.7;
}

function redraw() {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.beginPath();
  context.shadowBlur = 10;
  context.shadowColor = "black";
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fill();

  for (let step = 0; step < 2; ++step) {
    for (let i = 0; i < 4; i++) {
      if (state === i && !step) {
        continue;
      }

      context.beginPath();
      context.fillStyle = state === i ? colors_on[i] : colors_off[i];
      context.shadowBlur = state === i ? 10 : 0;
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
  drawRestartButton("Restart!", "restart2");
}

function drawRestartButton(text, id) {
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
  context.fillText(
    text,
    canvas.width - rectWidth / 2 - 10,
    canvas.height - rectHeight / 2 - 10
  );
}

function drawBigText(text) {
  console.log(text);
  playing = false;

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#333";
  context.shadowBlur = 0;
  context.font = "60px Verdana";
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
}

function beep(vol, freq, duration) {
  v = audioContext.createOscillator();
  u = audioContext.createGain();
  v.connect(u);
  v.frequency.value = freq;
  v.type = "square";
  u.connect(audioContext.destination);
  u.gain.value = vol * 0.01;
  v.start(audioContext.currentTime);
  v.stop(audioContext.currentTime + duration * 0.001);
}

window.onresize = () => {
  updateSize();
  redraw();
};

const getMaxIterations = () => 2 * (level + 2) + 1;

function iterate() {
  if (!playing) {
    return;
  }

  state = iterator % 2 ? Math.round(Math.random() * 10000) % 4 : -1;

  redraw();
  if (state >= 0) {
    beep(20, frequencies[state], 100);
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
  audioContext = new AudioContext();
  level = 1;
  clearLevel();
}

function buttonClicked(clickedRegion) {
  if (iterator != getMaxIterations()) {
    return;
  }

  state = Number(clickedRegion);
  redraw();
  beep(20, frequencies[state], 100);

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
    redraw();
  }
}

window.onload = () => {
  canvas = document.getElementById("canvas");
  canvas.addEventListener("mousedown", evt => regionClicked(evt.region), false);
  canvas.addEventListener("mouseup", evt => regionReleased(evt.region), false);
  updateSize();
  startPage();
};
