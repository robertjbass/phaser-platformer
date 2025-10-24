import Phaser from "phaser";
export class GameScene extends Phaser.Scene {
    player;
    platforms;
    cursors;
    keyA;
    keyD;
    keyW;
    constructor() {
        super({ key: "GameScene" });
    }
    create() {
        // Set background color
        this.cameras.main.setBackgroundColor("#87CEEB");
        // Create platformsControls:
        this.platforms = this.physics.add.staticGroup();
        // Ground
        this.createPlatform(400, 580, 800, 40, 0x8b4513);
        // Floating platforms
        this.createPlatform(200, 450, 200, 20, 0x8b4513);
        this.createPlatform(425, 400, 150, 20, 0x8b4513);
        this.createPlatform(650, 350, 200, 20, 0x8b4513);
        this.createPlatform(250, 300, 100, 20, 0x8b4513);
        this.createPlatform(125, 550, 150, 20, 0x8b4513);
        this.createPlatform(675, 500, 150, 20, 0x8b4513);
        // Create player
        this.player = this.physics.add.sprite(100, 100, "");
        // Create player visual (red rectangle with eyes)
        const graphics = this.add.graphics();
        graphics.fillStyle(0xff6b6b);
        graphics.fillRect(0, 0, 30, 40);
        // Eyes
        graphics.fillStyle(0xffffff);
        graphics.fillRect(7, 10, 6, 6);
        graphics.fillRect(17, 10, 6, 6);
        // Pupils
        graphics.fillStyle(0x000000);
        graphics.fillRect(9, 12, 3, 3);
        graphics.fillRect(19, 12, 3, 3);
        graphics.generateTexture("player", 30, 40);
        graphics.destroy();
        this.player.setTexture("player");
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        // Player physics properties
        if (this.player.body && "setGravityY" in this.player.body) {
            this.player.body.setSize(30, 40);
            this.player.body.setGravityY(600);
        }
        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        // Debug text
        this.add.text(10, 10, "Use Arrow Keys or A/D to move, Space/W to jump", {
            fontSize: "14px",
            color: "#000000",
            backgroundColor: "#ffffff",
            padding: { x: 5, y: 5 },
        });
    }
    update() {
        const speed = 200;
        const jumpVelocity = -400;
        // Horizontal movement
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.player.setVelocityX(-speed);
        }
        else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.player.setVelocityX(speed);
        }
        else {
            this.player.setVelocityX(0);
        }
        // Jump
        if ((this.cursors.up.isDown ||
            this.cursors.space.isDown ||
            this.keyW.isDown) &&
            this.player.body.touching.down) {
            this.player.setVelocityY(jumpVelocity);
        }
    }
    createPlatform(x, y, width, height, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, width, height);
        // Border
        graphics.lineStyle(2, 0x654321);
        graphics.strokeRect(0, 0, width, height);
        const key = `platform_${x}_${y}`;
        graphics.generateTexture(key, width, height);
        graphics.destroy();
        const platform = this.platforms.create(x, y, key);
        platform.setOrigin(0.5, 0.5);
        platform.refreshBody();
    }
}
//# sourceMappingURL=GameScene.js.map