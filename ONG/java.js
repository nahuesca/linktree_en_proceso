// Configuración del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ANCHO = 300;
const ALTO = 200;

// Establecer dimensiones del canvas
canvas.width = ANCHO;
canvas.height = ALTO;

// Estado del juego
let game = {
    pezX: 100,
    pezY: ALTO / 2,
    pezAncho: 50,
    pezAlto: 40,
    velocidadPez: 5,
    puntuacion: 0,
    juegoActivo: true,
    basura: [],
    frameCount: 0
};

// Controles
const keys = {};

// Clase Basura
class Basura {
    constructor(x, y, tipo) {
        this.x = x;
        this.y = y;
        this.tipo = tipo; // 0=botella, 1=bolsa, 2=lata
        this.ancho = 40;
        this.alto = 40;
        this.velocidad = 3 + Math.random() * 3;
    }

    mover() {
        this.x -= this.velocidad;
    }

    fueraDePantalla() {
        return this.x + this.ancho < 0;
    }

    colisionaCon(px, py, pancho, palto) {
        return this.x < px + pancho && 
               this.x + this.ancho > px && 
               this.y < py + palto && 
               this.y + this.alto > py;
    }
}

// Dibujar el pez
function dibujarPez(x, y) {
    // Cuerpo del pez
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 20, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cola
    ctx.fillStyle = '#FF6400';
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.lineTo(x - 15, y + 10);
    ctx.lineTo(x - 15, y + 30);
    ctx.closePath();
    ctx.fill();
    
    // Aleta superior
    ctx.fillStyle = '#FF6400';
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 10);
    ctx.lineTo(x + 20, y);
    ctx.lineTo(x + 25, y + 15);
    ctx.closePath();
    ctx.fill();
    
    // Ojo
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + 28, y + 13, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + 29, y + 13, 2, 0, Math.PI * 2);
    ctx.fill();
}

// Dibujar basura
function dibujarBasura(basura) {
    switch(basura.tipo) {
        case 0: // Botella plástica
            ctx.fillStyle = '#6496FF';
            ctx.fillRect(basura.x + 10, basura.y, 20, 35);
            ctx.fillStyle = '#5078C8';
            ctx.fillRect(basura.x + 12, basura.y, 16, 8);
            break;
            
        case 1: // Bolsa plástica
            ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
            ctx.beginPath();
            ctx.moveTo(basura.x + 5, basura.y + 5);
            ctx.lineTo(basura.x + 35, basura.y + 5);
            ctx.lineTo(basura.x + 30, basura.y + 35);
            ctx.lineTo(basura.x + 10, basura.y + 35);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#969696';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case 2: // Lata
            ctx.fillStyle = '#C83232';
            ctx.fillRect(basura.x + 8, basura.y + 5, 25, 30);
            ctx.fillStyle = '#961E1E';
            ctx.fillRect(basura.x + 10, basura.y + 8, 21, 8);
            break;
    }
}

// Actualizar juego
function actualizar() {
    if (!game.juegoActivo) return;

    game.frameCount++;

    // Movimiento del pez
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        game.pezY = Math.max(0, game.pezY - game.velocidadPez);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        game.pezY = Math.min(ALTO - game.pezAlto, game.pezY + game.velocidadPez);
    }

    // Generar basura cada 60 frames
    if (game.frameCount % 60 === 0) {
        const tipo = Math.floor(Math.random() * 3);
        const y = Math.random() * (ALTO - 50);
        game.basura.push(new Basura(ANCHO, y, tipo));
    }

    // Mover y verificar basura
    const basuraEliminada = [];
    
    for (let i = 0; i < game.basura.length; i++) {
        const basura = game.basura[i];
        basura.mover();

        // Verificar colisión con el pez
        if (basura.colisionaCon(game.pezX, game.pezY, game.pezAncho, game.pezAlto)) {
            game.juegoActivo = false;
        }

        // Eliminar si está fuera de pantalla y sumar punto
        if (basura.fueraDePantalla()) {
            basuraEliminada.push(i);
            game.puntuacion++;
        }
    }

    // Eliminar basura fuera de pantalla
    for (let i = basuraEliminada.length - 1; i >= 0; i--) {
        game.basura.splice(basuraEliminada[i], 1);
    }
}

// Dibujar todo
function dibujar() {
    // Fondo oceánico con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, ALTO);
    gradient.addColorStop(0, '#0A5078');
    gradient.addColorStop(1, '#0A3050');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    if (game.juegoActivo) {
        // Burbujas decorativas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 15; i++) {
            let bubbleY = (game.frameCount * 2 + i * 40) % ALTO;
            ctx.beginPath();
            ctx.arc(50 + i * 55, bubbleY, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dibujar pez
        dibujarPez(game.pezX, game.pezY);

        // Dibujar toda la basura
        game.basura.forEach(basura => dibujarBasura(basura));

        // Puntuación
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Puntuación: ' + game.puntuacion, 20, 40);

    } else {
        // Pantalla de Game Over
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, ANCHO, ALTO);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡Juego Terminado!', ANCHO / 2, ALTO / 2 - 50);

        ctx.font = '28px Arial';
        ctx.fillText('Puntuación: ' + game.puntuacion, ANCHO / 2, ALTO / 2 + 10);

        ctx.font = '20px Arial';
        ctx.fillText('Presiona ESPACIO para jugar de nuevo', ANCHO / 2, ALTO / 2 + 70);

        ctx.fillStyle = '#64C8FF';
        ctx.font = 'italic 18px Arial';
        ctx.fillText('¡Protejamos nuestros océanos!', ANCHO / 2, ALTO / 2 + 120);
        
        ctx.textAlign = 'left';
    }
}

// Reiniciar juego
function reiniciarJuego() {
    game.pezY = ALTO / 2;
    game.puntuacion = 0;
    game.basura = [];
    game.frameCount = 0;
    game.juegoActivo = true;
}

// Event listeners para teclado
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Reiniciar con espacio
    if (e.key === ' ' && !game.juegoActivo) {
        reiniciarJuego();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Loop principal del juego
function gameLoop() {
    actualizar();
    dibujar();
    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
gameLoop();