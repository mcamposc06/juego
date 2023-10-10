// Obtén el elemento canvas y su contexto
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Establece el tamaño inicial del canvas al tamaño de la ventana del navegador
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables del juego
let score = 0;
let gameMode = ""; // Modo de juego actual
let lives = 5; // Agrega una variable para las vidas del jugador
let gameStarted = false; // Variable para verificar si el juego ha comenzado


// Variables de la nave
const shipWidth = 80;
const shipHeight = 40;
let shipX = canvas.width / 2 - shipWidth / 2;
const shipY = canvas.height - shipHeight - 10;
let shipSpeed = 20;

// Variables de los meteoritos
const meteoriteRadius = 20;
let meteorites = [];

// Variables de las balas
const bulletWidth = 5;
const bulletHeight = 15;
let bullets = [];
let bulletSpeed = 10;

// Variables del temporizador (modo de desafío de 60 segundos)
let timeLeft = 60;
let timerInterval;

// Función para dibujar la nave
function drawShip() {
  ctx.beginPath();
  ctx.rect(shipX, shipY, shipWidth, shipHeight);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();
}

// Función para dibujar los botones
function drawButtons() {
  // Dibuja el botón del modo de juego "Normal"
  ctx.beginPath();
  ctx.rect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 50);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();

  // Dibuja el texto del botón del modo de juego "Normal"
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Normal Mode", canvas.width / 2 - 75, canvas.height / 2 - 20);

  // Dibuja el botón del modo de juego "Desafío"
  ctx.beginPath();
  ctx.rect(canvas.width / 2 - 100, canvas.height / 2 + 50, 200, 50);
  ctx.fillStyle = "orange";
  ctx.fill();
  ctx.closePath();

  // Dibuja el texto del botón del modo de juego "Desafío"
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Challenge Mode", canvas.width / 2 - 90, canvas.height / 2 + 80);
}

function handleButtonClick(event) {
  if (!gameStarted) { // Verifica si el juego no ha comenzado
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Verifica si se hizo clic en el botón del modo de juego "Normal"
    if (
      mouseX >= canvas.width / 2 - 100 &&
      mouseX <= canvas.width / 2 + 100 &&
      mouseY >= canvas.height / 2 - 50 &&
      mouseY <= canvas.height / 2
    ) {
      startGame("normal");
    }

    // Verifica si se hizo clic en el botón del modo de juego "Desafío"
    if (
      mouseX >= canvas.width / 2 - 100 &&
      mouseX <= canvas.width / 2 + 100 &&
      mouseY >= canvas.height / 2 + 50 &&
      mouseY <= canvas.height / 2 + 100
    ) {
      startGame("challenge");
    }
  }
}

// Agrega un controlador de eventos para el clic en el canvas
canvas.addEventListener("click", handleButtonClick);

// Llama a la función drawButtons() para dibujar los botones en el canvas
drawButtons();


// Función para dibujar los meteoritos
function drawMeteorites() {
  for (let i = 0; i < meteorites.length; i++) {
    ctx.beginPath();
    ctx.arc(meteorites[i].x, meteorites[i].y, meteoriteRadius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
}

// Función para dibujar las balas
function drawBullets() {
  for (let i = 0; i < bullets.length; i++) {
    ctx.beginPath();
    ctx.rect(bullets[i].x, bullets[i].y, bulletWidth, bulletHeight);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
  }
}

// Función para detectar colisiones
function detectCollisions() {
  const bulletsToRemove = [];
  const meteoritesToRemove = [];

  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < meteorites.length; j++) {
      const dx = bullets[i].x - meteorites[j].x;
      const dy = bullets[i].y - meteorites[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < meteoriteRadius) {
        bulletsToRemove.push(i);
        meteoritesToRemove.push(j);
        score++;
      }
    }
  }

  // Elimina los elementos marcados para eliminación
  for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
    bullets.splice(bulletsToRemove[i], 1);
  }

  for (let i = meteoritesToRemove.length - 1; i >= 0; i--) {
    meteorites.splice(meteoritesToRemove[i], 1);
  }
}


// Función para actualizar el juego en cada fotograma
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawShip();
  drawMeteorites();
  drawBullets();
  detectCollisions();

  // Actualiza la posición de la nave
  if (shipX < 0) {
    shipX = 0;
  } else if (shipX > canvas.width - shipWidth) {
    shipX = canvas.width - shipWidth;
  }

  // Actualiza la posición de los meteoritos
  for (let i = 0; i < meteorites.length; i++) {
    meteorites[i].y += 2;

    if (meteorites[i].y > canvas.height + meteoriteRadius) {
      meteorites.splice(i, 1);
      lives--; // Reduce una vida cuando un meteorito toca el fondo del suelo

      if (lives <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }
  }

  // Actualiza la posición de las balas
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y -= bulletSpeed;

    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }

  // Dibuja la puntuación
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Lives: " + lives, 10, 60);

  // Verifica si se cumplen las condiciones de fin de juego
  if (gameMode === "challenge") {
    ctx.fillText("Time: " + timeLeft, canvas.width - 100, 30);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }

  // Llama a la función update() en un bucle de animación para actualizar el juego en cada fotograma
  requestAnimationFrame(update);
}

// Función para iniciar el juego
function startGame(mode) {
  gameMode = mode;
  gameStarted = true; // Establece gameStarted en true cuando el juego comienza


  // Reinicia las variables del juego
  score = 0;
  meteorites = [];
  bullets = [];
  shipX = canvas.width / 2 - shipWidth / 2;
  timeLeft = 60; // Reinicia el tiempo a 60 segundos

  // Genera meteoritos de forma aleatoria cada 2 segundo
  setInterval(function() {
    const meteoriteX = Math.random() * (canvas.width - meteoriteRadius * 2) + meteoriteRadius;
    meteorites.push({ x: meteoriteX, y: -meteoriteRadius });
  }, 2000);

  // Configura los controladores de eventos para el movimiento de la nave y el disparo de balas
  document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft") {
      shipX -= shipSpeed;
    } else if (event.key === "ArrowRight") {
      shipX += shipSpeed;
    } else if (event.key === " ") {
      bullets.push({ x: shipX + shipWidth / 2 - bulletWidth / 2, y: shipY });
    }
  });

  // Inicia el temporizador (modo de desafío de 60 segundos)
  if (gameMode === "challenge") {
    updateTimer(); // Llama a la función para actualizar el temporizador
  }

  // Llama a la función update() para comenzar el juego
  update();
}

// Función para actualizar el temporizador
function updateTimer() {
  if (timeLeft <= 0) {
    endGame();
  } else {
    setTimeout(function() {
      timeLeft--;
      updateTimer(); // Llama a la función nuevamente después de un segundo
    }, 1000);
  }
}

// Función para finalizar el juego
function endGame() {
  // Lógica para finalizar el juego y mostrar la puntuación final
  alert("Game Over! Your score: " + score);
}
