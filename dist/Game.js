import { Player } from './Player.js';
import { Platform } from './Platform.js';
export class Game {
    canvas;
    ctx;
    player;
    platforms;
    keys;
    lastTime;
    constructor(canvas) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = ctx;
        // Initialize player
        this.player = new Player(100, 100);
        // Create platforms
        this.platforms = [
            new Platform(100, 400, 200, 20),
            new Platform(350, 350, 150, 20),
            new Platform(550, 300, 200, 20),
            new Platform(200, 250, 100, 20),
            new Platform(50, 500, 150, 20),
            new Platform(300, 500, 250, 20),
            new Platform(600, 450, 150, 20),
        ];
        // Input handling
        this.keys = new Set();
        this.setupInput();
        this.lastTime = 0;
    }
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key.toLowerCase());
            // Prevent default for arrow keys and space to avoid page scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
        });
    }
    update(deltaTime) {
        this.player.update(this.keys, this.platforms, this.canvas.height);
    }
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB'; // Sky blue
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw platforms
        for (const platform of this.platforms) {
            platform.draw(this.ctx);
        }
        // Draw player
        this.player.draw(this.ctx);
        // Draw simple HUD
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`, 10, this.canvas.height - 10);
    }
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.update(deltaTime);
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    start() {
        requestAnimationFrame((time) => {
            this.lastTime = time;
            this.gameLoop(time);
        });
    }
}
//# sourceMappingURL=Game.js.map