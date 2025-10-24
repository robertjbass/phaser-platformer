import { Platform } from './Platform.js';
export class Player {
    x;
    y;
    width;
    height;
    velocityX;
    velocityY;
    speed;
    jumpPower;
    gravity;
    isOnGround;
    color;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 12;
        this.gravity = 0.5;
        this.isOnGround = false;
        this.color = '#FF6B6B';
    }
    update(keys, platforms, canvasHeight) {
        // Horizontal movement
        this.velocityX = 0;
        if (keys.has('ArrowLeft') || keys.has('a')) {
            this.velocityX = -this.speed;
        }
        if (keys.has('ArrowRight') || keys.has('d')) {
            this.velocityX = this.speed;
        }
        // Apply gravity
        this.velocityY += this.gravity;
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        // Check platform collisions
        this.isOnGround = false;
        for (const platform of platforms) {
            if (this.checkCollision(platform)) {
                this.resolveCollision(platform);
            }
        }
        // Ground collision (bottom of canvas)
        if (this.y + this.height >= canvasHeight) {
            this.y = canvasHeight - this.height;
            this.velocityY = 0;
            this.isOnGround = true;
        }
        // Jump
        if ((keys.has(' ') || keys.has('w')) && this.isOnGround) {
            this.velocityY = -this.jumpPower;
            this.isOnGround = false;
        }
    }
    checkCollision(platform) {
        return platform.collidesWith(this.x, this.y, this.width, this.height);
    }
    resolveCollision(platform) {
        // Calculate overlap on each axis
        const overlapX = Math.min(this.x + this.width - platform.x, platform.x + platform.width - this.x);
        const overlapY = Math.min(this.y + this.height - platform.y, platform.y + platform.height - this.y);
        // Resolve collision on the axis with smallest overlap
        if (overlapX < overlapY) {
            // Horizontal collision
            if (this.x < platform.x) {
                this.x = platform.x - this.width;
            }
            else {
                this.x = platform.x + platform.width;
            }
            this.velocityX = 0;
        }
        else {
            // Vertical collision
            if (this.y < platform.y) {
                // Landing on top of platform
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.isOnGround = true;
            }
            else {
                // Hitting bottom of platform
                this.y = platform.y + platform.height;
                this.velocityY = 0;
            }
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Draw eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 7, this.y + 10, 6, 6);
        ctx.fillRect(this.x + 17, this.y + 10, 6, 6);
        // Draw pupils
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 9, this.y + 12, 3, 3);
        ctx.fillRect(this.x + 19, this.y + 12, 3, 3);
    }
}
//# sourceMappingURL=Player.js.map