const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const hud = document.getElementById("hud");
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
document.getElementById("up").onclick = () => moveKey("ArrowUp");
document.getElementById("down").onclick = () => moveKey("ArrowDown");
document.getElementById("left").onclick = () => moveKey("ArrowLeft");
document.getElementById("right").onclick = () => moveKey("ArrowRight");

function moveKey(k){ keys[k] = true; setTimeout(()=>keys[k]=false,100); }

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
    ctx.strokeStyle = "#777";
    ctx.lineWidth = 2;
    if (this.walls.top) drawLine(x, y, x + cellSize, y);
    if (this.walls.right) drawLine(x + cellSize, y, x + cellSize, y + cellSize);
    if (this.walls.bottom) drawLine(x, y + cellSize, x + cellSize, y + cellSize);
    if (this.walls.left) drawLine(x, y, x, y + cellSize);
  }
}
function drawLine(x1,y1,x2,y2){
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

function generateMaze(){
  maze=[];
  for(let y=0;y<rows;y++){
    let row=[];
    for(let x=0;x<cols;x++) row.push(new Cell(x,y));
    maze.push(row);
  }
  let stack=[], current=maze[0][0]; current.visited=true;
  while(true){
    let n=neighbors(current);
    if(n.length>0){
      let next=n[Math.floor(Math.random()*n.length)];
      stack.push(current);
      removeWalls(current,next);
      next.visited=true;
      current=next;
    } else if(stack.length>0) current=stack.pop();
    else break;
  }
}
function neighbors(c){
  let {x,y}=c,n=[];
  if(y>0 && !maze[y-1][x].visited) n.push(maze[y-1][x]);
  if(x<cols-1 && !maze[y][x+1].visited) n.push(maze[y][x+1]);
  if(y<rows-1 && !maze[y+1][x].visited) n.push(maze[y+1][x]);
  if(x>0 && !maze[y][x-1].visited) n.push(maze[y][x-1]);
  return n;
}
function removeWalls(a,b){
  let dx=b.x-a.x, dy=b.y-a.y;
  if(dx===1){ a.walls.right=false; b.walls.left=false; }
  if(dx===-1){ a.walls.left=false; b.walls.right=false; }
  if(dy===1){ a.walls.bottom=false; b.walls.top=false; }
  if(dy===-1){ a.walls.top=false; b.walls.bottom=false; }
}

class Player {
  constructor(){
    this.col=0; this.row=0;
    this.size=cellSize/3;
  }
  move(){
    let cell=maze[this.row][this.col];
    if(keys["ArrowUp"] && !cell.walls.top){
      this.row=Math.max(0,this.row-1);
    }
    if(keys["ArrowDown"] && !cell.walls.bottom){
      this.row=Math.min(rows-1,this.row+1);
    }
    if(keys["ArrowLeft"] && !cell.walls.left){
      this.col=Math.max(0,this.col-1);
    }
    if(keys["ArrowRight"] && !cell.walls.right){
      this.col=Math.min(cols-1,this.col+1);
    }
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle="gold";
    ctx.arc(this.col*cellSize+cellSize/2,this.row*cellSize+cellSize/2,this.size,0,Math.PI*2);
    ctx.fill();
  }
}

function init(){
  cellSize=Math.min(canvas.width/cols, canvas.height/rows);
  generateMaze();
  player=new Player();
  exit={col:cols-1,row:rows-1};
}

function gameLoop(){
  ctx.fillStyle="#111"; ctx.fillRect(0,0,canvas.width,canvas.height);

  for(let row of maze) for(let c of row) c.draw();

  // exit
  ctx.beginPath();
  ctx.fillStyle="lime";
  ctx.arc(exit.col*cellSize+cellSize/2, exit.row*cellSize+cellSize/2, cellSize/3, 0, Math.PI*2);
  ctx.fill();

  player.move();
  player.draw();

  if(player.col===exit.col && player.row===exit.row){
    hud.innerText="YOU ESCAPED 🎉";
  } else {
    hud.innerText="Find the exit!";
  }

  requestAnimationFrame(gameLoop);
}

init();
gameLoop();
