const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const hud = document.getElementById("hud");
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
document.getElementById("up").onclick = () => keys["ArrowUp"] = true;
document.getElementById("down").onclick = () => keys["ArrowDown"] = true;
document.getElementById("left").onclick = () => keys["ArrowLeft"] = true;
document.getElementById("right").onclick = () => keys["ArrowRight"] = true;

let rows = 12, cols = 16;
let cellSize = Math.min(canvas.width / cols, canvas.height / rows);
let maze, player, exit;

class Cell {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.walls = { top: true, right: true, bottom: true, left: true };
    this.visited = false;
  }
  draw() {
    const x = this.x * cellSize;
    const y = this.y * cellSize;
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    if (this.walls.top) drawLine(x, y, x + cellSize, y);
    if (this.walls.right) drawLine(x + cellSize, y, x + cellSize, y + cellSize);
    if (this.walls.bottom) drawLine(x, y + cellSize, x + cellSize, y + cellSize);
    if (this.walls.left) drawLine(x, y, x, y + cellSize);
  }
}
function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function generateMaze() {
  maze = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) row.push(new Cell(x, y));
    maze.push(row);
  }
  let stack = [], current = maze[0][0];
  current.visited = true;
  while (true) {
    let n = neighbors(current);
    if (n.length > 0) {
      let next = n[Math.floor(Math.random()*n.length)];
      stack.push(current);
      removeWalls(current, next);
      next.visited = true;
      current = next;
    } else if (stack.length > 0) current = stack.pop();
    else break;
  }
}
function neighbors(cell) {
  let {x, y} = cell, n = [];
  if (y > 0 && !maze[y-1][x].visited) n.push(maze[y-1][x]);
  if (x < cols-1 && !maze[y][x+1].visited) n.push(maze[y][x+1]);
  if (y < rows-1 && !maze[y+1][x].visited) n.push(maze[y+1][x]);
  if (x > 0 && !maze[y][x-1].visited) n.push(maze[y][x-1]);
  return n;
}
function removeWalls(a, b) {
  let dx = b.x - a.x, dy = b.y - a.y;
  if (dx === 1) { a.walls.right = false; b.walls.left = false; }
  if (dx === -1) { a.walls.left = false; b.walls.right = false; }
  if (dy === 1) { a.walls.bottom = false; b.walls.top = false; }
  if (dy === -1) { a.walls.top = false; b.walls.bottom = false; }
}

class Player {
  constructor() {
    this.x = cellSize/2;
    this.y = cellSize/2;
    this.size = cellSize/4;
    this.speed = 3;
  }
  move() {
    let newX = this.x, newY = this.y;
    if (keys["ArrowUp"]) newY -= this.speed;
    if (keys["ArrowDown"]) newY += this.speed;
    if (keys["ArrowLeft"]) newX -= this.speed;
    if (keys["ArrowRight"]) newX += this.speed;

    if (!hitsWall(this.x, this.y, newX, newY)) {
      this.x = newX;
      this.y = newY;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = "gold";
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
  }
}

function hitsWall(x, y, newX, newY) {
  let col = Math.floor(x / cellSize), row = Math.floor(y / cellSize);
  if (col < 0 || row < 0 || col >= cols || row >= rows) return true;
  let cell = maze[row][col];

  // inside cell → check wall collisions
  if (newY < row*cellSize && cell.walls.top) return true;
  if (newY > (row+1)*cellSize && cell.walls.bottom) return true;
  if (newX < col*cellSize && cell.walls.left) return true;
  if (newX > (col+1)*cellSize && cell.walls.right) return true;
  return false;
}

function init() {
  cellSize = Math.min(canvas.width / cols, canvas.height / rows);
  generateMaze();
  player = new Player();
  exit = {x: cols-0.5, y: rows-0.5};
}

function gameLoop() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for (let row of maze) for (let c of row) c.draw();
  ctx.beginPath();
  ctx.fillStyle = "lime";
  ctx.arc(exit.x*cellSize, exit.y*cellSize, cellSize/3, 0, Math.PI*2);
  ctx.fill();

  player.move();
  player.draw();

  let dx = player.x - exit.x*cellSize, dy = player.y - exit.y*cellSize;
  if (Math.sqrt(dx*dx+dy*dy) < cellSize/2) {
    hud.innerText = "YOU ESCAPED 🎉";
  } else {
    hud.innerText = "Find the exit!";
  }

  requestAnimationFrame(gameLoop);
}

init();
gameLoop();
