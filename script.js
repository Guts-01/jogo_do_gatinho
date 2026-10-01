const elements = {
  area: document.querySelector('#game-area'),
  cat: document.querySelector('#cat'),
  puddle: document.querySelector('#puddle'),
  score: document.querySelector('#score'),
  timer: document.querySelector('#timer'),
  overlay: document.querySelector('#game-overlay'),
  overlayIcon: document.querySelector('#overlay-icon'),
  overlayTitle: document.querySelector('#overlay-title'),
  overlayDetail: document.querySelector('#overlay-detail'),
  status: document.querySelector('#game-status'),
  startButton: document.querySelector('#start-button'),
  jumpButton: document.querySelector('#jump-button'),
  pauseButton: document.querySelector('#pause-button'),
  helpButton: document.querySelector('#help-button'),
  helpDialog: document.querySelector('#help-dialog'),
  closeHelp: document.querySelector('#close-help'),
  gotItButton: document.querySelector('#got-it-button'),
};

const JUMP_DURATION = 1.15;
const clouds = document.querySelectorAll('.cloud');
const state = {
  mode: 'ready',
  score: 0,
  elapsed: 0,
  jumpTime: JUMP_DURATION,
  obstacleX: 0,
  obstacleScored: false,
  spawnDelay: 0,
  frame: null,
  lastFrameTime: 0,
};

function announce(message) {
  elements.status.textContent = message;
}

function moveCloud(cloud, startingProgress = 0) {
  const duration = 9 + Math.random() * 7;
  cloud.style.setProperty('--cloud-duration', `${duration}s`);
  cloud.style.animationDelay = `${-duration * startingProgress}s`;
  cloud.classList.add('is-moving');
}

clouds.forEach((cloud, index) => {
  cloud.addEventListener('animationend', (event) => {
    if (event.animationName !== 'cloud-cross') return;
    cloud.classList.remove('is-moving');
    cloud.style.animationDelay = '0s';
    window.setTimeout(() => moveCloud(cloud), 500 + Math.random() * 3500);
  });
  moveCloud(cloud, [0.15, 0.48, 0.78][index]);
});

function setOverlay(icon, title, detail) {
  elements.overlayIcon.textContent = icon;
  elements.overlayTitle.textContent = title;
  elements.overlayDetail.textContent = detail;
  elements.overlay.hidden = false;
}

function updateControls() {
  const { mode } = state;
  elements.startButton.textContent = {
    ready: 'Começar', running: 'Reiniciar', paused: 'Reiniciar', over: 'Jogar novamente',
  }[mode];
  elements.jumpButton.disabled = mode !== 'running';
  elements.pauseButton.hidden = mode === 'ready' || mode === 'over';
  elements.pauseButton.textContent = mode === 'paused' ? 'Continuar' : 'Pausar';
  elements.area.setAttribute('aria-label', {
    ready: 'Área do jogo. Começar partida',
    running: 'Área do jogo. Pular',
    paused: 'Área do jogo. Continuar partida',
    over: 'Área do jogo. Jogar novamente',
  }[mode]);
}

function updateTimer() {
  const totalSeconds = Math.floor(state.elapsed);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  elements.timer.textContent = `${minutes}:${seconds}`;
}

function placeObstacle() {
  state.obstacleX = elements.area.clientWidth + 20;
  state.obstacleScored = false;
  elements.puddle.style.transform = `translateX(${state.obstacleX}px)`;
}

function startGame() {
  if (state.frame !== null) cancelAnimationFrame(state.frame);
  state.mode = 'running';
  state.score = 0;
  state.elapsed = 0;
  state.jumpTime = JUMP_DURATION;
  state.spawnDelay = 0;
  elements.score.textContent = '0';
  elements.cat.style.transform = 'translateY(0)';
  updateTimer();
  placeObstacle();
  elements.overlay.hidden = true;
  updateControls();
  announce('Partida iniciada. Pule as poças!');
  elements.area.focus({ preventScroll: true });
  state.lastFrameTime = performance.now();
  state.frame = requestAnimationFrame(gameLoop);
}

function pauseGame(message = 'Jogo pausado.') {
  if (state.mode !== 'running') return;
  state.mode = 'paused';
  cancelAnimationFrame(state.frame);
  state.frame = null;
  setOverlay('⏸', 'Jogo pausado', 'Pressione Continuar ou toque na pista.');
  updateControls();
  announce(message);
}

function resumeGame() {
  if (state.mode !== 'paused') return;
  state.mode = 'running';
  elements.overlay.hidden = true;
  updateControls();
  announce('Partida retomada.');
  elements.area.focus({ preventScroll: true });
  state.lastFrameTime = performance.now();
  state.frame = requestAnimationFrame(gameLoop);
}

function endGame() {
  state.mode = 'over';
  state.frame = null;
  setOverlay('💧', 'O gatinho se molhou!', `Você fez ${state.score} ${state.score === 1 ? 'ponto' : 'pontos'}. Tente de novo!`);
  updateControls();
  announce(`Fim de jogo. Você fez ${state.score} ${state.score === 1 ? 'ponto' : 'pontos'}.`);
}

function jump() {
  if (state.mode !== 'running' || state.jumpTime < JUMP_DURATION) return;
  state.jumpTime = 0;
}

function hasCollision() {
  const cat = elements.cat.getBoundingClientRect();
  const puddle = elements.puddle.getBoundingClientRect();
  const catLeft = cat.left + cat.width * 0.28;
  const catRight = cat.right - cat.width * 0.28;
  const catBottom = cat.bottom - cat.height * 0.12;
  return catRight > puddle.left + 12 && catLeft < puddle.right - 12 && catBottom > puddle.top + 4;
}

function gameLoop(now) {
  if (state.mode !== 'running') return;
  const delta = Math.min((now - state.lastFrameTime) / 1000, 0.05);
  state.lastFrameTime = now;
  state.elapsed += delta;
  updateTimer();

  if (state.jumpTime < JUMP_DURATION) {
    state.jumpTime = Math.min(state.jumpTime + delta, JUMP_DURATION);
    const progress = state.jumpTime / JUMP_DURATION;
    const jumpHeight = Math.min(125, elements.area.clientHeight * 0.34);
    elements.cat.style.transform = `translateY(${-Math.sin(Math.PI * progress) * jumpHeight}px)`;
  }

  if (state.spawnDelay > 0) {
    state.spawnDelay -= delta;
    if (state.spawnDelay <= 0) placeObstacle();
  } else {
    const speed = Math.min(500, Math.max(250, elements.area.clientWidth * 0.5)) + state.score * 8;
    state.obstacleX -= speed * delta;
    elements.puddle.style.transform = `translateX(${state.obstacleX}px)`;

    if (hasCollision()) {
      endGame();
      return;
    }

    const cat = elements.cat.getBoundingClientRect();
    const puddle = elements.puddle.getBoundingClientRect();
    if (!state.obstacleScored && puddle.right < cat.left + cat.width * 0.2) {
      state.obstacleScored = true;
      state.score += 1;
      elements.score.textContent = String(state.score);
      announce(`${state.score} ${state.score === 1 ? 'ponto' : 'pontos'}.`);
    }
    if (puddle.right < elements.area.getBoundingClientRect().left) {
      state.spawnDelay = 0.6;
    }
  }

  state.frame = requestAnimationFrame(gameLoop);
}

function useArea() {
  if (state.mode === 'running') jump();
  else if (state.mode === 'paused') resumeGame();
  else startGame();
}

elements.area.addEventListener('click', useArea);
elements.area.addEventListener('keydown', (event) => {
  if (event.code === 'Enter' || event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) useArea();
  }
});

document.addEventListener('keydown', (event) => {
  if (elements.helpDialog.open || event.repeat || !(event.code === 'Space' || event.code === 'ArrowUp')) return;
  if (event.target.closest('button, dialog, input, textarea, select, a')) return;
  event.preventDefault();
  if (state.mode === 'running') jump();
});

elements.startButton.addEventListener('click', startGame);
elements.jumpButton.addEventListener('click', jump);
elements.pauseButton.addEventListener('click', () => {
  if (state.mode === 'running') pauseGame();
  else resumeGame();
});
elements.helpButton.addEventListener('click', () => {
  pauseGame('Jogo pausado para mostrar as instruções.');
  elements.helpDialog.showModal();
});
elements.closeHelp.addEventListener('click', () => elements.helpDialog.close());
elements.gotItButton.addEventListener('click', () => elements.helpDialog.close());
elements.helpDialog.addEventListener('click', (event) => {
  if (event.target === elements.helpDialog) elements.helpDialog.close();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseGame('Jogo pausado porque você saiu da aba.');
});

updateControls();
