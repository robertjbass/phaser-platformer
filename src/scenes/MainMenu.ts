import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  create(): void {
    // Set dark Hollow Knight-inspired background
    this.cameras.main.setBackgroundColor('#0a0a15');

    const { width, height } = this.cameras.main;

    // Create atmospheric background
    this.createBackgroundEffects();

    // Title with glow effect
    const title = this.add.text(width / 2, height / 3, 'HOLLOW PLATFORMER', {
      fontSize: '56px',
      color: '#6af5ff',
      fontStyle: 'bold',
      stroke: '#1a3a5a',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#6af5ff',
        blur: 20,
        fill: true
      }
    }).setOrigin(0.5);

    // Pulsing glow on title
    this.tweens.add({
      targets: title,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(width / 2, height / 2 - 20, 'A Dark Journey Awaits', {
      fontSize: '20px',
      color: '#8a9aaa',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Instructions with better styling
    const instructions = [
      '',
      'Controls:',
      'A/D - Move Left/Right',
      'J - Jump (hold for higher jump)',
      'K - Attack',
    ];

    instructions.forEach((line, index) => {
      const text = this.add.text(width / 2, height / 2 + 40 + (index * 26), line, {
        fontSize: index === 1 ? '20px' : '16px',
        color: index === 1 ? '#c0d0e0' : '#7a8a9a',
        fontStyle: index === 1 ? 'bold' : 'normal',
        stroke: '#0a0a15',
        strokeThickness: 2
      }).setOrigin(0.5);

      if (index > 1) {
        // Fade in animation
        text.setAlpha(0);
        this.tweens.add({
          targets: text,
          alpha: 1,
          duration: 500,
          delay: 200 + index * 100
        });
      }
    });

    // Add pulsing effect to start text
    const startText = this.add.text(width / 2, height - 80, '> Press SPACE to Begin <', {
      fontSize: '22px',
      color: '#6af5ff',
      stroke: '#1a3a5a',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.4,
      scale: 0.95,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Particle effects
    this.createParticles();

    // Input to start game with fade transition
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.startGame();
    });

    this.input.keyboard!.once('keydown-ENTER', () => {
      this.startGame();
    });

    // Also allow clicking anywhere to start
    this.input.once('pointerdown', () => {
      this.startGame();
    });
  }

  private startGame(): void {
    // Fade out effect
    this.cameras.main.fadeOut(500, 10, 10, 21);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }

  private createBackgroundEffects(): void {
    const { width, height } = this.cameras.main;

    // Add some mysterious glowing orbs in the background
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      const size = Phaser.Math.Between(40, 100);

      const orb = this.add.circle(x, y, size, 0x2a3a5a, 0.08);
      orb.setDepth(-1);

      this.tweens.add({
        targets: orb,
        alpha: 0.15,
        scale: 1.3,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Add vertical light beams
    for (let i = 0; i < 4; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const beam = this.add.rectangle(x, height / 2, 2, height, 0x6af5ff, 0.05);
      beam.setDepth(-2);

      this.tweens.add({
        targets: beam,
        alpha: 0.1,
        width: 4,
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createParticles(): void {
    // Create particle texture
    const graphics = this.add.graphics();
    graphics.fillStyle(0x6af5ff);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('menu-particle', 4, 4);
    graphics.destroy();

    // Floating particles
    const particles = this.add.particles(0, 0, 'menu-particle', {
      x: { min: 0, max: 800 },
      y: 600,
      speedY: { min: -30, max: -60 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 8000,
      frequency: 200,
      tint: [0x6af5ff, 0x8a9aaa, 0xaabaca]
    });

    particles.setDepth(-1);
  }
}
