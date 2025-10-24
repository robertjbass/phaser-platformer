import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private swordHitbox!: Phaser.GameObjects.Rectangle;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private facingRight: boolean = true;
  private isAttacking: boolean = false;
  private canAttack: boolean = true;
  private attackDuration: number = 200; // milliseconds
  private attackCooldown: number = 300; // milliseconds

  // Hollow Knight-style physics values
  private moveSpeed: number = 250;
  private jumpStrength: number = 380;
  private gravity: number = 900;
  private maxFallSpeed: number = 500;
  private airAcceleration: number = 0.8; // Air control multiplier

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    // Set background color
    this.cameras.main.setBackgroundColor("#87CEEB");

    // Create platforms
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

    // Hollow Knight-style physics
    if (this.player.body && "setGravityY" in this.player.body) {
      this.player.body.setSize(30, 40);
      this.player.body.setGravityY(this.gravity);
      this.player.body.setMaxVelocity(this.moveSpeed, this.maxFallSpeed);
    }

    // Create sword hitbox (visible during attack)
    this.swordHitbox = this.add.rectangle(-100, -100, 50, 10, 0xcccccc);
    this.swordHitbox.setStrokeStyle(2, 0xffffff);
    this.swordHitbox.setOrigin(0, 0.5);
    this.swordHitbox.setVisible(false);
    this.physics.add.existing(this.swordHitbox);

    // Collisions
    this.physics.add.collider(this.player, this.platforms);

    // Input - WASD movement + J for jump + K for attack
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyJ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);

    // Debug text
    this.add.text(10, 10, "A/D - Move | J - Jump | K - Attack", {
      fontSize: "14px",
      color: "#000000",
      backgroundColor: "#ffffff",
      padding: { x: 5, y: 5 },
    });
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const isOnGround = body.touching.down;

    // Horizontal movement - Hollow Knight style (instant acceleration)
    if (this.keyA.isDown) {
      const speed = isOnGround ? this.moveSpeed : this.moveSpeed * this.airAcceleration;
      this.player.setVelocityX(-speed);
      this.facingRight = false;
    } else if (this.keyD.isDown) {
      const speed = isOnGround ? this.moveSpeed : this.moveSpeed * this.airAcceleration;
      this.player.setVelocityX(speed);
      this.facingRight = true;
    } else {
      // Instant stop when on ground (like Hollow Knight)
      if (isOnGround && !this.isAttacking) {
        this.player.setVelocityX(0);
      } else if (!isOnGround) {
        // Slight air drag
        this.player.setVelocityX(this.player.body!.velocity.x * 0.95);
      }
    }

    // Jump - J key only (with variable jump height)
    if (Phaser.Input.Keyboard.JustDown(this.keyJ) && isOnGround) {
      this.player.setVelocityY(-this.jumpStrength);
    }

    // Variable jump height - release J early for shorter jump
    if (Phaser.Input.Keyboard.JustUp(this.keyJ)) {
      if (this.player.body!.velocity.y < 0) {
        this.player.setVelocityY(this.player.body!.velocity.y * 0.5);
      }
    }

    // Attack - K key
    if (Phaser.Input.Keyboard.JustDown(this.keyK) && this.canAttack) {
      this.attack();
    }

    // Update sword hitbox position and visibility
    if (this.isAttacking) {
      const offsetX = this.facingRight ? 25 : -25;
      this.swordHitbox.setPosition(this.player.x + offsetX, this.player.y);
      this.swordHitbox.setVisible(true);
      // Flip sword direction
      this.swordHitbox.setScale(this.facingRight ? 1 : -1, 1);
    } else {
      this.swordHitbox.setVisible(false);
    }
  }

  private attack(): void {
    this.isAttacking = true;
    this.canAttack = false;

    // Don't kill momentum - player keeps their current velocity during attack
    // This feels more like Hollow Knight

    // End attack after duration
    this.time.delayedCall(this.attackDuration, () => {
      this.isAttacking = false;
    });

    // Reset attack cooldown
    this.time.delayedCall(this.attackCooldown, () => {
      this.canAttack = true;
    });
  }

  private createPlatform(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);

    // Border
    graphics.lineStyle(2, 0x654321);
    graphics.strokeRect(0, 0, width, height);

    const key = `platform_${x}_${y}`;
    graphics.generateTexture(key, width, height);
    graphics.destroy();

    const platform = this.platforms.create(
      x,
      y,
      key
    ) as Phaser.Physics.Arcade.Sprite;
    platform.setOrigin(0.5, 0.5);
    platform.refreshBody();
  }
}
