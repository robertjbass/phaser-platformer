export class Platform {
    x;
    y;
    width;
    height;
    color;
    constructor(x, y, width, height, color = '#8B4513') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Add some visual depth
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    // Check if a point or rectangle collides with this platform
    collidesWith(x, y, width, height) {
        return (x < this.x + this.width &&
            x + width > this.x &&
            y < this.y + this.height &&
            y + height > this.y);
    }
}
//# sourceMappingURL=Platform.js.map