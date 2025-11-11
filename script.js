const board = document.querySelector('.board');
const startButton = document.querySelector('.start-btn');
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');
const restartButton = document.querySelector('.restart-btn');
const highScoreDisplay = document.querySelector('#high-score');
const scoreDisplay = document.querySelector('#score');
const timeDisplay = document.querySelector('#time');
const modal = document.querySelector('.modal');

const blockHeight = 50;
const blockWidth = 50;

let highScore = 0;
let score = 0;
let intervalId = null;
let timeInterval = null;

// Keep global snake and direction to persist between restarts
let snake = [];
let direction = 'down';
let food = null;
let blocks = {};
let rows, cols;

function createGrid() {
  board.innerHTML = "";
  cols = Math.floor(board.clientWidth / blockWidth);
  rows = Math.floor(board.clientHeight / blockHeight);
  blocks = {};

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const block = document.createElement('div');
      block.classList.add('block');
      board.appendChild(block);
      blocks[`${row}-${col}`] = block;
    }
  }

  resetGame();
}

function resetGame() {
  clearInterval(intervalId);
  clearInterval(timeInterval);

  snake = [{ x: 1, y: 3 }];
  direction = 'down';
  food = spawnFood();
  score = 0;
  scoreDisplay.innerText = score;
  timeDisplay.innerText = "00:00";

  render();
}

function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols)
    };
  } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
  return newFood;
}

function render() {
  Object.values(blocks).forEach(b => b.classList.remove('fill', 'food'));

  // Draw food
  blocks[`${food.x}-${food.y}`].classList.add('food');

  // Move snake
  let head = { ...snake[0] };
  if (direction === 'left') head.y--;
  else if (direction === 'right') head.y++;
  else if (direction === 'up') head.x--;
  else if (direction === 'down') head.x++;

  // Collision
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= rows ||
    head.y >= cols ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    gameOver();
    return;
  }

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    snake.unshift(head);
    score += 10;
    food = spawnFood();
  } else {
    snake.unshift(head);
    snake.pop();
  }

  // Draw snake
  snake.forEach(seg => blocks[`${seg.x}-${seg.y}`].classList.add('fill'));

  // Update score and high score
  scoreDisplay.innerText = score;
  if (score > highScore) {
    highScore = score;
    highScoreDisplay.innerText = highScore;
  }
}

function startGame() {
  modal.style.display = 'none';
  startGameModal.style.display = 'none';
  gameOverModal.style.display = 'none';

  clearInterval(intervalId);
  clearInterval(timeInterval);

  let startTime = Date.now();
  intervalId = setInterval(render, 200);

  timeInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    timeDisplay.innerText = `${minutes}:${seconds}`;
  }, 1000);
}

function gameOver() {
  clearInterval(intervalId);
  clearInterval(timeInterval);
  modal.style.display = 'flex';
  startGameModal.style.display = 'none';
  gameOverModal.style.display = 'flex';
}

function restartGame() {
  modal.style.display = 'none';
  gameOverModal.style.display = 'none';
  resetGame();
  startGame();
}

// Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
  else if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
  else if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
  else if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
});

// Init
createGrid();
window.addEventListener('resize', createGrid);
