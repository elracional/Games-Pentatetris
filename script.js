$(document).ready(function(){
  $('#newGame').modal(
    {'dismissible': false});
  $('#newGame').modal('open');
  $("#newGameBtn").focus() 
  });

	
    


  
  
let pause = true;

const canvas = document.querySelector('.tetris');
const context = canvas.getContext('2d');

const nextCanvas = document.querySelector('.next');
const nextContext = nextCanvas.getContext('2d');

context.scale(20, 20);
nextContext.scale(30, 30);

const arena = createMatrix(12, 20);
const nextArena = createMatrix(6, 6);

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
  level: 1,
  dropInterval: 1000,
  DROP_SLOW: 100,
  next: null,
};

let dropCounter = 0;
let DROP_FAST = 50;

function BorrarLinea(){
  let rowCount = 1;
  outer: for(y=arena.length - 1; y > 0; y--){
    for(x=0; x < arena[y].length; x++){
      if(arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;

    player.score += rowCount * 100;
    rowCount *= 2;
    let scoreStr = player.score.toString();
    if(scoreStr.length > 3){
      let num = Number(scoreStr.slice(0, scoreStr.length - 3));
      player.level = num + 1;
      player.dropInterval = 1000 - (num * 50);
      player.DROP_SLOW = 1000 - (num * 50);
    }
  }
}

function chocar(arena, player){
  const [m, o] = [player.matrix, player.pos];
  for(y=0; y<m.length; y++){
    for(x=0; x < m[y].length; x++){
      if(m[y][x] !== 0 && ( arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h){
  const matrix = [];
  while(h--){
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function Pieza(type){
  if (type === 'I'){
    return [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ];
  } else if (type === 'F'){
    return [
      [0, 2, 2],
      [2, 2, 0],
      [0, 2, 0]
    ];
  } else if (type === 'N'){
    return [
      [0, 0, 3, 0],
      [0, 3, 3, 0],
      [0, 3, 0, 0],
      [0, 3, 0, 0]
    ];
  } else if (type === 'P'){
    return [
      [0, 0, 4],
      [0, 4, 4],
      [0, 4, 4]
    ];
  } else if (type === 'U'){
    return [
      [5, 0, 5],
      [5, 5, 5],
      [0, 0, 0]
    ];
    } else if (type === 'T'){
      return [
        [0, 0, 0],
        [6, 6, 6],
        [0, 6, 0]
      ];
  } else if (type === 'V'){
    return [
      [7, 0, 0],
      [7, 0, 0],
      [7, 7, 7]
    ];
  }else if (type === 'W'){
    return [
      [8, 0, 0],
      [8, 8, 0],
      [0, 8, 8]

    ];
  }
  else if (type === 'X'){
    return [
      [0, 9, 0],
      [9, 9, 9],
      [0, 9, 0]

    ];
  }
  else if (type === 'A'){
    return [
      [10, 10, 0],
      [0, 10, 0],
      [10, 0, 10]

    ];
  }

}

function drawNext(){
  nextContext.fillStyle = '#000';
  nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height); 

  drawMatrix(nextArena, {x: 0, y:0}, nextContext);
  drawMatrix(player.next, {x: 1, y: 1}, nextContext);
}

function draw(){
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0}, context);
  drawMatrix(player.matrix, player.pos, context);
}

function drawMatrix(mat, offset, cont){
  mat.forEach((row, y) => {
    row.forEach((value, x) =>{
      if(value !== 0){
        cont.fillStyle = colors[value];
        cont.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function unir(arena, player){
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0){
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function caida(){
  player.pos.y++;
  if(chocar(arena, player)){
    player.pos.y--;
    unir(arena, player);
    gameReset();
    BorrarLinea();
    updateScore();
  }
  dropCounter = 0;
}

function Mover(dir){
  player.pos.x += dir;
  if(chocar(arena, player)){
    player.pos.x -= dir;
  }
}

function gameReset(){
  const pieces = 'IFNPUTVWXA';
  if(player.next === null){
    player.matrix = Pieza(pieces[pieces.length * Math.random() | 0]);
    player.next = Pieza(pieces[pieces.length * Math.random() | 0]);
  } else {
    player.matrix = player.next;
    player.next = Pieza(pieces[pieces.length * Math.random() | 0]);
  }
  drawNext();
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if(chocar(arena, player)){
    pauseGame();
    document.removeEventListener('keydown', keyListener);
    document.removeEventListener('keyup', keyListener);
    clearPlayer();
  }
}

function clearPlayer(){
  player.dropInterval = 1000;
    player.DROP_SLOW = 1000;
    player.score = 0;
    player.level = 1;
    arena.forEach(row => row.fill(0));
    updateScore();
}

function Rotar(dir){
  const pos = player.pos.x
  let offset = 1;
  rotate(player.matrix, dir);

  while(chocar(arena, player)){
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if(offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir){
  for(y=0; y < matrix.length; y++){
    for(x=0; x < y; x++){
      [ matrix[x][y], matrix[y][x], ] = [ matrix[y][x], matrix[x][y], ];
    }
  }
  if(dir > 0){
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

let lastTime = 0;
function update(time = 0){
  $('#pause').off();
  if(!pause){
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if(dropCounter > player.dropInterval) {
      caida();
    }
    draw();
    requestAnimationFrame(update);
    } else {
      draw();
    }
}

function updateScore(){
  document.querySelector('.score').innerHTML = `<p><b><u>Score:</u> ${player.score}</b></p>`;
  document.querySelector('.level').innerHTML = `<p><b><u>Level:</u> ${player.level}</b></p>`;
}

const colors = [
  null, 
  '#03A9F4',//I
  '#9C27B0',//F
  '#FFC107',//N
  '#E91E63',//P
  '#00BCD4',//U 
  '#8BC34A',//T
  '#3F51B5',//V
  '#00E74F',//W
  '#FF7733',//X
  '#E7001A'//A

];

function keyListener(e){
  if(e.type === 'keydown'){
    if(e.keyCode === 37){
      Mover(-1)
    } else if(e.keyCode === 39){
      Mover(1);
    } else if(e.keyCode === 81){
      Rotar(-1);
    } else if(e.keyCode === 87 || e.keyCode === 38){
      Rotar(1);
    } else if(e.keyCode === 27){
      pauseGame();
    }
  }

  if (e.keyCode === 40) {
    if (e.type === 'keydown') {
        if (player.dropInterval !== DROP_FAST) {
            caida();
            player.dropInterval = DROP_FAST;
        }
    } else {
        player.dropInterval = player.DROP_SLOW;
    }
  }
};

function pauseGame(){
  if(pause === true){	
    pause = false;	
    $('#pause').modal({"onCloseStart": update() });
    $('#pause').modal('close');
  } else {
    if(chocar(arena, player)){
      pause = true;
      if(player.score > 0){
      $('#gameOver').modal({
				'dismissible': false,
				"onOpenEnd": function(){ $('#name').focus(); } 
      });
      $('#gameOver').modal('open');
      $('.yourScore').html(`<p>Your Score: ${player.score}`)
    } else {
      $('#newGame').modal({'dismissible': false});
      $('#newGame').modal('open'); 
    }
    } else {
      pause = true;
      document.createEventListener
    $('#pause').modal({
      "dismissible": false,
      "onCloseStart": update() });
    $('#pause').modal('open'); 
    $("#pauseBtn").focus(); 
    $('body').on('keydown', (e)=>{
      if(e.keyCode === 39){
        $('#StartNewBtn').focus();
      }
      if(e.keyCode === 37){
        $("#pauseBtn").focus(); 
      }
    })
    }
  }
}

function newGame(){
	
  clearPlayer();
  pause = false;
  gameReset();
  update();
  updateScore();  
  document.addEventListener('keydown', keyListener);
  document.addEventListener('keyup', keyListener);
}

update();