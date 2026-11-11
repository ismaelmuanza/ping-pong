
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Elementos da interface
const playerScoreElement = document.getElementById("player-score");
const computerScoreElement = document.getElementById("computer-score");
const message = document.getElementById("message");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

// dificuldade do jogo

const difficultySelect = document.getElementById("difficulty");
let computerSpeed = 3.5;

// Dimensões do campo
const WIDTH = 800;
const HEIGHT = 500;

// Raquetes
const paddleWidth = 13;
const paddleHeight = 110;

let playerY = HEIGHT / 2 - paddleHeight / 2;
let computerY = HEIGHT / 2 - paddleHeight / 2;

// Bola
const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 9,
    speedX: 5,
    speedY: 3
};

// Pontuação
let playerScore = 0;
let computerScore = 0;

// Estado do jogo
let running = false;
let paused = false;
let finished = false;

// Controlos
const keys = {};

// Criar uma nova posição para a bola
function resetBall(direction) {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;

    const angle = Math.random() * 0.7 - 0.35;

    ball.speedX = direction * 5.2 * Math.cos(angle);
    ball.speedY = 5.2 * Math.sin(angle);
}

// Desenhar o campo e os elementos
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Fundo
    ctx.fillStyle = "#101827";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Linha central
    ctx.setLineDash([12, 14]);
    ctx.strokeStyle = "#46566c";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();

    ctx.setLineDash([]);

    // Raquete do jogador
    ctx.fillStyle = "#4adea1";
    ctx.fillRect(30, playerY, paddleWidth, paddleHeight);

    // Raquete do computador
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(
        WIDTH - 43,
        computerY,
        paddleWidth,
        paddleHeight
    );

    // Bola
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Identificação dos lados
    ctx.fillStyle = "#718096";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";

    ctx.fillText("JOGADOR", 105, 35);
    ctx.fillText("COMPUTADOR", 695, 35);
}

// Atualizar a movimentação
function update() {

    // Movimentação do jogador
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
        playerY -= 7;
    }

    if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
        playerY += 7;
    }

    // Impedir que a raquete saia do campo
    playerY = Math.max(
        0,
        Math.min(HEIGHT - paddleHeight, playerY)
    );

    // Inteligência do computador
    const target = ball.y - paddleHeight / 2;
    computerSpeed = Number(difficultySelect.value);

    if (computerY < target) {
        computerY += computerSpeed;
    } else if (computerY > target) {
        computerY -= computerSpeed;
    }

    computerY = Math.max(
        0,
        Math.min(HEIGHT - paddleHeight, computerY)
    );

    // Movimentar a bola
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Colisão com as paredes superior e inferior
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.speedY = Math.abs(ball.speedY);
    }

    if (ball.y + ball.radius > HEIGHT) {
        ball.y = HEIGHT - ball.radius;
        ball.speedY = -Math.abs(ball.speedY);
    }

    // Colisão com a raquete do jogador
    if (
        ball.speedX < 0 &&
        ball.x - ball.radius < 43 &&
        ball.x > 25 &&
        ball.y > playerY &&
        ball.y < playerY + paddleHeight
    ) {
        ball.x = 44 + ball.radius;

        ball.speedX = Math.abs(ball.speedX) * 1.045;

        ball.speedY +=
            ((ball.y - (playerY + paddleHeight / 2)) / 55) * 2.1;
    }

    // Colisão com a raquete do computador
    if (
        ball.speedX > 0 &&
        ball.x + ball.radius > WIDTH - 43 &&
        ball.x < WIDTH - 25 &&
        ball.y > computerY &&
        ball.y < computerY + paddleHeight
    ) {
        ball.x = WIDTH - 44 - ball.radius;

        ball.speedX = -Math.abs(ball.speedX) * 1.035;

        ball.speedY +=
            ((ball.y - (computerY + paddleHeight / 2)) / 55) * 1.8;
    }

    // Limitar a velocidade vertical
    ball.speedY = Math.max(
        -9,
        Math.min(9, ball.speedY)
    );

    ball.speedX = Math.max(
        -10,
        Math.min(10, ball.speedX)
    );

    // Ponto para o computador
    if (ball.x < 0) {
        computerScore++;
        updateScore();
        checkWinner();

        if (!finished) {
            resetBall(1);
        }
    }

    // Ponto para o jogador
    if (ball.x > WIDTH) {
        playerScore++;
        updateScore();
        checkWinner();

        if (!finished) {
            resetBall(-1);
        }
    }
}

// Atualizar a pontuação
function updateScore() {
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
}

// Verificar o vencedor
function checkWinner() {

    if (playerScore >= 5) {
        endGame("🏆 Parabéns! Venceste o computador!");
    }

    if (computerScore >= 5) {
        endGame("O computador venceu! Tenta novamente.");
    }
}

// Terminar a partida
function endGame(result) {
    running = false;
    finished = true;

    message.textContent = result;
    startBtn.textContent = "Jogar novamente";
}

// Ciclo principal do jogo
function gameLoop() {

    if (!running) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
function startGame() {

    if (finished) {
        resetGame();
    }

    if (running) return;

    running = true;
    paused = false;

    startBtn.textContent = "A jogar";
    pauseBtn.textContent = "Pausar";

    message.textContent = "Boa sorte! Primeiro a chegar aos 5 pontos vence.";

    gameLoop();
}

// Pausar o jogo
function pauseGame() {

    if (!running) return;

    running = false;
    paused = true;

    startBtn.textContent = "Continuar";
    pauseBtn.textContent = "Continuar";

    message.textContent = "Jogo pausado.";

    draw();
}

// Reiniciar o jogo
function resetGame() {

    running = false;
    paused = false;
    finished = false;

    playerScore = 0;
    computerScore = 0;

    playerY = HEIGHT / 2 - paddleHeight / 2;
    computerY = HEIGHT / 2 - paddleHeight / 2;

    updateScore();
    resetBall(Math.random() > 0.5 ? 1 : -1);

    startBtn.textContent = "Iniciar jogo";
    pauseBtn.textContent = "Pausar";

    message.textContent = "Primeiro a chegar aos 5 pontos vence!";

    draw();
}

// Controlar o teclado
window.addEventListener("keydown", function(event) {

    if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === " "
    ) {
        event.preventDefault();
    }

    keys[event.key] = true;

    // Espaço para pausar ou continuar
    if (event.key === " " && !event.repeat) {
        if (running) {
            pauseGame();
        } else {
            startGame();
        }
    }
});

window.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});

// Controlar a raquete com o rato ou toque
function movePlayer(event) {

    const rect = canvas.getBoundingClientRect();

    playerY =
        (event.clientY - rect.top) *
        (HEIGHT / rect.height) -
        paddleHeight / 2;

    playerY = Math.max(
        0,
        Math.min(HEIGHT - paddleHeight, playerY)
    );

    if (!running) {
        draw();
    }
}

canvas.addEventListener("pointerdown", function(event) {
    canvas.setPointerCapture(event.pointerId);
    movePlayer(event);
});

canvas.addEventListener("pointermove", function(event) {
    if (event.pointerType === "mouse" || event.buttons) {
        movePlayer(event);
    }
});

// Botões
startBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", function() {
    if (running) {
        pauseGame();
    } else {
        startGame();
    }
});

resetBtn.addEventListener("click", resetGame);

// Preparar o jogo
resetGame();
