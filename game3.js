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
let lives = 3;
let level = 1;
let gameOver = false;

let shipSpeedBoost = false;
let tripleShot = false;
let shieldActive = false;

// Controles da nave
document.addEventListener("keydown", moveShip);
document.addEventListener("keydown", shootBullet);
// -----------------------------------------------------------------AQUI------
function moveShip(event) {
    if (event.key === "ArrowLeft" && shipX > 0) {
        shipX -= shipSpeedBoost ? 10 : 10;
    } else if (event.key === "ArrowRight" && shipX + shipWidth < canvas.width) {
        shipX += shipSpeedBoost ? 10 : 10;
    }
}

// Tiro
function shootBullet(event) {
    if (event.key === " " && !gameOver) {
        shootSound.play();
        bullets.push({ x: shipX + shipWidth / 2 - 2, y: shipY, width: 4, height: 10 });
        if (tripleShot) {
            bullets.push({ x: shipX + shipWidth / 2 - 10, y: shipY, width: 4, height: 10 });
            bullets.push({ x: shipX + shipWidth / 2 + 6, y: shipY, width: 4, height: 10 });
        }
    }
}

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

// Asteroides
function generateAsteroids() {
    if (Math.random() < 0.05 * level && !gameOver) {
        const size = Math.random() * 40 + 20;
        const speed = Math.random() * 2 + 1 + (level * 0.2);
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

// Power-ups
function generatePowerUps() {
    if (Math.random() < 0.01 && !gameOver) {
        const type = Math.random() < 0.33 ? "speed" : (Math.random() < 0.5 ? "triple" : "shield");
        const x = Math.random() * (canvas.width - 20);
        powerUps.push({ x: x, y: 0, width: 20, height: 20, type: type });
    }
}

function drawPowerUps() {
    ctx.fillStyle = "blue";
    for (let i = 0; i < powerUps.length; i++) {
        ctx.fillRect(powerUps[i].x, powerUps[i].y, powerUps[i].width, powerUps[i].height);
        powerUps[i].y += 2;

        if (collisionDetection({ x: shipX, y: shipY, width: shipWidth, height: shipHeight }, powerUps[i])) {
            if (powerUps[i].type === "speed") {
                shipSpeedBoost = true;
                setTimeout(() => shipSpeedBoost = false, 5000);
            } else if (powerUps[i].type === "triple") {
                tripleShot = true;
                setTimeout(() => tripleShot = false, 5000);
            } else if (powerUps[i].type === "shield") {
                shieldActive = true;
                setTimeout(() => shieldActive = false, 5000);
            }
            powerUps.splice(i, 1);
            i--;
        }

        if (powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
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

// Função de atualização de jogo
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        drawShip();
        updateBullets();
        drawBullets();
        generateAsteroids();
        drawAsteroids();
        generatePowerUps();
        drawPowerUps();
        checkCollisions();
        increaseDifficulty();
    } else {
        drawGameOver();
    }

    updateScoreboard();
    requestAnimationFrame(gameLoop);
}

function drawShip() {
    ctx.fillStyle = shieldActive ? "green" : "white";
    ctx.fillRect(shipX, shipY, shipWidth, shipHeight);
}

function updateScoreboard() {
    document.getElementById("scoreboard").innerHTML = `Pontuação: ${score} | Vidas: ${lives} | Nível: ${level}`;
}

function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    gameOverSound.play();
}

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

// Aumentar dificuldade ao longo do tempo
let levelUpTime = 0;

function increaseDifficulty() {
    levelUpTime++;
    if (levelUpTime > 500) {
        level++;
        levelUpTime = 0;
    }
}

// Inicia o loop do jogo
gameLoop();
