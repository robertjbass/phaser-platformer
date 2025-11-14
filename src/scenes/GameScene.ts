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

  // Visual effects
  private attackSlash!: Phaser.GameObjects.Graphics;
  private dustParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private atmosphericFog!: Phaser.GameObjects.TileSprite;
  private backgroundLayers: Phaser.GameObjects.TileSprite[] = [];

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    // Set dark Hollow Knight-inspired background
    this.cameras.main.setBackgroundColor("#0a0a15");

    // Create atmospheric background layers
    this.createBackgroundLayers();

    // Create fog effect
    this.createAtmosphericFog();

    // Create platforms
    this.platforms = this.physics.add.staticGroup();

    // Ground with Hollow Knight-style aesthetic
    this.createPlatform(400, 580, 800, 40, 0x1a1a2e, 0x2d2d44);

    // Floating platforms with varied colors for depth
    this.createPlatform(200, 450, 200, 20, 0x252535, 0x3a3a50);
    this.createPlatform(425, 400, 150, 20, 0x1f1f2d, 0x34344a);
    this.createPlatform(650, 350, 200, 20, 0x252535, 0x3a3a50);
    this.createPlatform(250, 300, 100, 20, 0x1a1a28, 0x2f2f45);
    this.createPlatform(125, 550, 150, 20, 0x202030, 0x353548);
    this.createPlatform(675, 500, 150, 20, 0x1f1f2d, 0x34344a);

    // Create detailed character sprite
    this.createCharacterSprites();

    // Create player with animations
    this.player = this.physics.add.sprite(100, 100, "player-idle");
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // Hollow Knight-style physics
    if (this.player.body && "setGravityY" in this.player.body) {
      this.player.body.setSize(28, 38);
      this.player.body.setOffset(6, 6);
      this.player.body.setGravityY(this.gravity);
      this.player.body.setMaxVelocity(this.moveSpeed, this.maxFallSpeed);
    }

    // Create animations
    this.createAnimations();

    // Create attack slash effect
    this.attackSlash = this.add.graphics();
    this.attackSlash.setDepth(10);

    // Create sword hitbox (invisible collision box)
    this.swordHitbox = this.add.rectangle(-100, -100, 50, 10, 0xffffff, 0);
    this.swordHitbox.setOrigin(0, 0.5);
    this.swordHitbox.setVisible(false);
    this.physics.add.existing(this.swordHitbox);

    // Create particle system for dust/effects
    this.createParticleSystem();

    // Collisions
    this.physics.add.collider(this.player, this.platforms);

    // Input - WASD movement + J for jump + K for attack
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyJ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);

    // UI text with improved styling
    this.add.text(10, 10, "A/D - Move | J - Jump | K - Attack", {
      fontSize: "16px",
      color: "#e0e0f0",
      backgroundColor: "#1a1a2e",
      padding: { x: 8, y: 6 },
      stroke: "#6a6a8a",
      strokeThickness: 2,
    });

    // Add atmospheric lighting
    this.createLightingEffects();
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const isOnGround = body.touching.down;

    // Update parallax background
    this.updateBackgroundParallax();

    // Horizontal movement - Hollow Knight style (instant acceleration)
    if (this.keyA.isDown) {
      const speed = isOnGround ? this.moveSpeed : this.moveSpeed * this.airAcceleration;
      this.player.setVelocityX(-speed);
      this.facingRight = false;
      this.player.setFlipX(true);
    } else if (this.keyD.isDown) {
      const speed = isOnGround ? this.moveSpeed : this.moveSpeed * this.airAcceleration;
      this.player.setVelocityX(speed);
      this.facingRight = true;
      this.player.setFlipX(false);
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
      this.dustParticles.explode(8, this.player.x, this.player.y + 20);
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

    // Update animations based on state
    this.updateAnimations(isOnGround);

    // Update sword hitbox position and visibility
    if (this.isAttacking) {
      const offsetX = this.facingRight ? 25 : -25;
      this.swordHitbox.setPosition(this.player.x + offsetX, this.player.y);
      this.swordHitbox.setVisible(true);
      // Flip sword direction
      this.swordHitbox.setScale(this.facingRight ? 1 : -1, 1);
    } else {
      this.swordHitbox.setVisible(false);
      this.attackSlash.clear();
    }
  }

  private attack(): void {
    this.isAttacking = true;
    this.canAttack = false;

    // Draw attack slash effect
    this.drawAttackSlash();

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

  private drawAttackSlash(): void {
    this.attackSlash.clear();

    const offsetX = this.facingRight ? 30 : -30;
    const slashX = this.player.x + offsetX;
    const slashY = this.player.y;

    // Draw a glowing slash arc
    this.attackSlash.lineStyle(3, 0xc0e0ff, 1);
    this.attackSlash.fillStyle(0xa0d0ff, 0.3);

    if (this.facingRight) {
      this.attackSlash.beginPath();
      this.attackSlash.arc(slashX - 10, slashY, 25, -Math.PI / 3, Math.PI / 3);
      this.attackSlash.strokePath();
    } else {
      this.attackSlash.beginPath();
      this.attackSlash.arc(slashX + 10, slashY, 25, Math.PI * 2 / 3, Math.PI * 4 / 3);
      this.attackSlash.strokePath();
    }

    // Fade out the slash
    this.tweens.add({
      targets: this.attackSlash,
      alpha: 0,
      duration: this.attackDuration,
      onComplete: () => {
        this.attackSlash.alpha = 1;
      }
    });
  }

  private createPlatform(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    highlightColor: number
  ): void {
    const graphics = this.add.graphics();

    // Main platform body
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);

    // Top highlight for depth
    graphics.fillStyle(highlightColor);
    graphics.fillRect(0, 0, width, 3);

    // Subtle edge lighting
    graphics.lineStyle(1, highlightColor, 0.3);
    graphics.strokeRect(1, 1, width - 2, height - 2);

    // Bottom shadow for depth
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRect(0, height - 2, width, 2);

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

  private createCharacterSprites(): void {
    // Create detailed knight character sprite
    const charGraphics = this.add.graphics();
    const width = 40;
    const height = 50;

    // Body (dark armor)
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRoundedRect(10, 15, 20, 25, 3);

    // Cloak/Cape
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRoundedRect(8, 18, 24, 22, 3);

    // Helmet
    charGraphics.fillStyle(0x3a3a55);
    charGraphics.fillRoundedRect(12, 10, 16, 18, 4);

    // Helmet visor (glowing eyes)
    charGraphics.fillStyle(0x6af5ff);
    charGraphics.fillRect(15, 18, 4, 3);
    charGraphics.fillRect(21, 18, 4, 3);

    // Eye glow
    charGraphics.fillStyle(0x6af5ff, 0.5);
    charGraphics.fillRect(14, 17, 6, 5);
    charGraphics.fillRect(20, 17, 6, 5);

    // Legs
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRect(14, 38, 5, 8);
    charGraphics.fillRect(21, 38, 5, 8);

    // Feet
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRect(13, 44, 6, 4);
    charGraphics.fillRect(21, 44, 6, 4);

    // Chest armor highlight
    charGraphics.fillStyle(0x4a4a66);
    charGraphics.fillRect(15, 22, 10, 2);

    charGraphics.generateTexture("player-idle", width, height);

    // Create walking frame 1
    charGraphics.clear();

    // Body
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRoundedRect(10, 16, 20, 25, 3);

    // Cloak
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRoundedRect(8, 19, 24, 22, 3);

    // Helmet
    charGraphics.fillStyle(0x3a3a55);
    charGraphics.fillRoundedRect(12, 11, 16, 18, 4);

    // Eyes
    charGraphics.fillStyle(0x6af5ff);
    charGraphics.fillRect(15, 19, 4, 3);
    charGraphics.fillRect(21, 19, 4, 3);
    charGraphics.fillStyle(0x6af5ff, 0.5);
    charGraphics.fillRect(14, 18, 6, 5);
    charGraphics.fillRect(20, 18, 6, 5);

    // Legs - walking pose
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRect(14, 39, 5, 7);
    charGraphics.fillRect(22, 37, 5, 9);

    // Feet
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRect(13, 44, 6, 4);
    charGraphics.fillRect(22, 44, 6, 4);

    // Chest highlight
    charGraphics.fillStyle(0x4a4a66);
    charGraphics.fillRect(15, 23, 10, 2);

    charGraphics.generateTexture("player-walk1", width, height);

    // Create walking frame 2
    charGraphics.clear();

    // Body
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRoundedRect(10, 16, 20, 25, 3);

    // Cloak
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRoundedRect(9, 19, 24, 22, 3);

    // Helmet
    charGraphics.fillStyle(0x3a3a55);
    charGraphics.fillRoundedRect(12, 11, 16, 18, 4);

    // Eyes
    charGraphics.fillStyle(0x6af5ff);
    charGraphics.fillRect(15, 19, 4, 3);
    charGraphics.fillRect(21, 19, 4, 3);
    charGraphics.fillStyle(0x6af5ff, 0.5);
    charGraphics.fillRect(14, 18, 6, 5);
    charGraphics.fillRect(20, 18, 6, 5);

    // Legs - opposite walking pose
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRect(21, 39, 5, 7);
    charGraphics.fillRect(13, 37, 5, 9);

    // Feet
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRect(21, 44, 6, 4);
    charGraphics.fillRect(12, 44, 6, 4);

    // Chest highlight
    charGraphics.fillStyle(0x4a4a66);
    charGraphics.fillRect(15, 23, 10, 2);

    charGraphics.generateTexture("player-walk2", width, height);

    // Jump frame
    charGraphics.clear();

    // Body - slightly crouched
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRoundedRect(10, 18, 20, 23, 3);

    // Cloak - flowing upward
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRoundedRect(7, 20, 26, 18, 3);

    // Helmet
    charGraphics.fillStyle(0x3a3a55);
    charGraphics.fillRoundedRect(12, 13, 16, 18, 4);

    // Eyes
    charGraphics.fillStyle(0x6af5ff);
    charGraphics.fillRect(15, 21, 4, 3);
    charGraphics.fillRect(21, 21, 4, 3);
    charGraphics.fillStyle(0x6af5ff, 0.5);
    charGraphics.fillRect(14, 20, 6, 5);
    charGraphics.fillRect(20, 20, 6, 5);

    // Legs - tucked for jump
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRect(15, 38, 4, 6);
    charGraphics.fillRect(21, 38, 4, 6);

    // Feet
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRect(15, 42, 5, 4);
    charGraphics.fillRect(21, 42, 5, 4);

    charGraphics.generateTexture("player-jump", width, height);

    // Attack frame
    charGraphics.clear();

    // Body - lunging forward
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRoundedRect(10, 15, 20, 25, 3);

    // Cloak - swept back
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRoundedRect(6, 18, 24, 22, 3);

    // Helmet
    charGraphics.fillStyle(0x3a3a55);
    charGraphics.fillRoundedRect(12, 10, 16, 18, 4);

    // Eyes - intense
    charGraphics.fillStyle(0x6af5ff);
    charGraphics.fillRect(15, 18, 4, 3);
    charGraphics.fillRect(21, 18, 4, 3);
    charGraphics.fillStyle(0x6af5ff, 0.7);
    charGraphics.fillRect(14, 17, 6, 5);
    charGraphics.fillRect(20, 17, 6, 5);

    // Legs - stance
    charGraphics.fillStyle(0x2a2a40);
    charGraphics.fillRect(14, 38, 5, 8);
    charGraphics.fillRect(21, 38, 5, 8);

    // Feet
    charGraphics.fillStyle(0x1a1a2e);
    charGraphics.fillRect(13, 44, 6, 4);
    charGraphics.fillRect(21, 44, 6, 4);

    // Arm/sword suggestion
    charGraphics.fillStyle(0x3a3a55);
    charGraphics.fillRect(28, 20, 8, 4);

    charGraphics.generateTexture("player-attack", width, height);

    charGraphics.destroy();
  }

  private createAnimations(): void {
    // Idle animation
    this.anims.create({
      key: "idle",
      frames: [{ key: "player-idle" }],
      frameRate: 1,
    });

    // Walk animation
    this.anims.create({
      key: "walk",
      frames: [
        { key: "player-walk1" },
        { key: "player-idle" },
        { key: "player-walk2" },
        { key: "player-idle" },
      ],
      frameRate: 8,
      repeat: -1,
    });

    // Jump animation
    this.anims.create({
      key: "jump",
      frames: [{ key: "player-jump" }],
      frameRate: 1,
    });

    // Attack animation
    this.anims.create({
      key: "attack",
      frames: [{ key: "player-attack" }],
      frameRate: 1,
    });
  }

  private updateAnimations(isOnGround: boolean): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (this.isAttacking) {
      if (this.player.anims.currentAnim?.key !== "attack") {
        this.player.play("attack");
      }
    } else if (!isOnGround) {
      if (this.player.anims.currentAnim?.key !== "jump") {
        this.player.play("jump");
      }
    } else if (Math.abs(body.velocity.x) > 10) {
      if (this.player.anims.currentAnim?.key !== "walk") {
        this.player.play("walk");
      }
    } else {
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.play("idle");
      }
    }
  }

  private createParticleSystem(): void {
    // Create particle texture
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0x8a8aa0);
    particleGraphics.fillRect(0, 0, 4, 4);
    particleGraphics.generateTexture("particle", 4, 4);
    particleGraphics.destroy();

    // Create dust particles
    this.dustParticles = this.add.particles(0, 0, "particle", {
      speed: { min: 20, max: 60 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 400,
      gravityY: 200,
    });
  }

  private createBackgroundLayers(): void {
    // Create texture for background layers
    const bgGraphics = this.add.graphics();

    // Distant mountains layer
    bgGraphics.fillStyle(0x15152a, 0.6);
    for (let i = 0; i < 800; i += 100) {
      bgGraphics.fillTriangle(
        i, 150,
        i + 50, 80,
        i + 100, 150
      );
    }
    bgGraphics.generateTexture("bg-mountains", 800, 150);

    // Mid-layer structures
    bgGraphics.clear();
    bgGraphics.fillStyle(0x1a1a30, 0.5);
    for (let i = 0; i < 800; i += 120) {
      bgGraphics.fillRect(i + 20, 100, 60, 80);
      bgGraphics.fillTriangle(
        i + 20, 100,
        i + 50, 70,
        i + 80, 100
      );
    }
    bgGraphics.generateTexture("bg-structures", 800, 180);

    bgGraphics.destroy();

    // Add layers as tile sprites for parallax
    const mountains = this.add.tileSprite(400, 200, 800, 150, "bg-mountains");
    mountains.setDepth(-2);
    mountains.setAlpha(0.4);
    this.backgroundLayers.push(mountains);

    const structures = this.add.tileSprite(400, 250, 800, 180, "bg-structures");
    structures.setDepth(-1);
    structures.setAlpha(0.3);
    this.backgroundLayers.push(structures);
  }

  private createAtmosphericFog(): void {
    // Create fog texture
    const fogGraphics = this.add.graphics();
    fogGraphics.fillStyle(0x3a3a5a, 0.1);
    fogGraphics.fillRect(0, 0, 800, 600);
    fogGraphics.generateTexture("fog", 800, 600);
    fogGraphics.destroy();

    this.atmosphericFog = this.add.tileSprite(400, 300, 800, 600, "fog");
    this.atmosphericFog.setAlpha(0.3);
    this.atmosphericFog.setDepth(5);

    // Animate fog
    this.tweens.add({
      targets: this.atmosphericFog,
      tilePositionX: 100,
      duration: 20000,
      repeat: -1,
    });
  }

  private createLightingEffects(): void {
    // Add some atmospheric light spots
    const lightSpots = [
      { x: 150, y: 200 },
      { x: 400, y: 150 },
      { x: 650, y: 250 },
    ];

    lightSpots.forEach((spot) => {
      const light = this.add.circle(spot.x, spot.y, 80, 0x6a7a9a, 0.05);
      light.setDepth(-1);

      // Pulsing effect
      this.tweens.add({
        targets: light,
        alpha: 0.15,
        scale: 1.2,
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private updateBackgroundParallax(): void {
    const cameraX = this.cameras.main.scrollX;

    if (this.backgroundLayers.length > 0 && this.backgroundLayers[0]) {
      this.backgroundLayers[0].tilePositionX = cameraX * 0.1;
      if (this.backgroundLayers[1]) {
        this.backgroundLayers[1].tilePositionX = cameraX * 0.3;
      }
    }
  }
}
