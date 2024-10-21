const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const shootSound = document.getElementById("shootSound");
const explosionSound = document.getElementById("explosionSound");
const gameOverSound = document.getElementById("gameOverSound");

let shipX = canvas.width / 2 - 20;
let shipY = canvas.height - 40;
let shipWidth = 40;
let shipHeight = 20;
let bullets = [];
let asteroids = [];
let powerUps = [];
let score = 0;
let lives = 10;
let level = 1;
let gameOver = false;

let shipSpeedBoost = false;
let tripleShot = false;
let shieldActive = false;

let leftPressed = false;
let rightPressed = false;

// Eventos de teclado
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        leftPressed = true;
    } else if (event.key === "ArrowRight") {
        rightPressed = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") {
        leftPressed = false;
    } else if (event.key === "ArrowRight") {
        rightPressed = false;
    }
});

// Movimento contínuo da nave
function updateShipPosition() {
    if (leftPressed && shipX > 0) {
        shipX -= shipSpeedBoost ? 10 : 5; // Aumente para mais velocidade
    } 
    if (rightPressed && shipX + shipWidth < canvas.width) {
        shipX += shipSpeedBoost ? 10 : 5; // Aumente para mais velocidade
    }
}

// Função de tiro
document.addEventListener("keydown", (event) => {
    if (event.key === " " && !gameOver) {
        shootSound.play();
        bullets.push({ x: shipX + shipWidth / 2 - 2, y: shipY, width: 4, height: 10 });
        if (tripleShot) {
            bullets.push({ x: shipX + shipWidth / 2 - 10, y: shipY, width: 4, height: 10 });
            bullets.push({ x: shipX + shipWidth / 2 + 6, y: shipY, width: 4, height: 10 });
        }
    }
});

// Atualizar balas
function updateBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= 5;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function drawBullets() {
    ctx.fillStyle = "white";
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Gerar e desenhar asteroides
function generateAsteroids() {
    if (Math.random() < 0.02 * level && !gameOver) {  // Ajustei para gerar menos asteroides
        const size = Math.random() * 30 + 20;  // Asteroides menores
        const speed = Math.random() * 1 + 0.5; // Asteroides mais lentos
        const x = Math.random() * (canvas.width - size);
        asteroids.push({ x: x, y: 0, width: size, height: size, speed: speed });
    }
}

function drawAsteroids() {
    ctx.fillStyle = "gray";
    for (let i = 0; i < asteroids.length; i++) {
        ctx.fillRect(asteroids[i].x, asteroids[i].y, asteroids[i].width, asteroids[i].height);
        asteroids[i].y += asteroids[i].speed;

        // Remove asteroides que saem da tela
        if (asteroids[i].y > canvas.height) {
            asteroids.splice(i, 1);
            i--;
        }
    }
}

// Funções de jogo
function checkCollisions() {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < asteroids.length; j++) {
            if (collisionDetection(bullets[i], asteroids[j])) {
                explosionSound.play();
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                score += 10;
                i--;
                break;
            }
        }
    }

    for (let i = 0; i < asteroids.length; i++) {
        if (collisionDetection({ x: shipX, y: shipY, width: shipWidth, height: shipHeight }, asteroids[i])) {
            if (shieldActive) {
                shieldActive = false;
            } else {
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                }
            }
            asteroids.splice(i, 1);
            i--;
        }
    }
}

// Detecção de colisão
function collisionDetection(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
    );
}

// Atualiza a pontuação e exibe no HTML
function updateScoreboard() {
    document.getElementById("scoreboard").innerHTML = `Pontuação: ${score} | Vidas: ${lives} | Nível: ${level}`;
}

// Game loop principal
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        updateShipPosition();
        drawShip();
        updateBullets();
        drawBullets();
        generateAsteroids();
        drawAsteroids();
        checkCollisions();
        increaseDifficulty();
    } else {
        drawGameOver();
    }

    updateScoreboard();
    requestAnimationFrame(gameLoop);
}

// Função para desenhar a nave
function drawShip() {
    ctx.fillStyle = shieldActive ? "green" : "white";
    ctx.fillRect(shipX, shipY, shipWidth, shipHeight);
}

// Aumenta a dificuldade ao longo do tempo
let levelUpTime = 0;
function increaseDifficulty() {
    levelUpTime++;
    if (levelUpTime > 500) {
        level++;
        levelUpTime = 0;
    }
}

// Exibe "Game Over"
function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    gameOverSound.play();
}

// Inicia o loop do jogo
gameLoop();
