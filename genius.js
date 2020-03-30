const colors_on = ["#00FF00", "#FF0000", "#0000FF", "#FFFF00"];
const colors_off = ["#007700", "#770000", "#000077", "#777700"];

let centerX;
let centerY;
let radius;
let canvas;

let state = -1;

let iterator = 0;
let maxIterations = 3;

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
    }
  }
}

window.onresize = () => {
  updateSize();
  redraw();
};

function iterate() {
  state = iterator % 2 ? Math.round(Math.random() * 10000) % 4 : -1;
  redraw();
  iterator++;
  if (iterator != 2 * maxIterations + 1) {
    setTimeout(() => iterate(), 1000);
  }
}

window.onload = () => {
  canvas = document.getElementById("canvas");

  updateSize();
  redraw();

  iterate();
};
