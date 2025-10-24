import Phaser from 'phaser';
export class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }
    create() {
        // Set background color
        this.cameras.main.setBackgroundColor('#2d2d2d');
        const { width, height } = this.cameras.main;
        // Title
        this.add.text(width / 2, height / 3, 'PLATFORMER', {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        // Subtitle
        this.add.text(width / 2, height / 2, 'Press SPACE, ENTER, or Click to Start', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        // Instructions
        const instructions = [
            'Controls:',
            'Arrow Keys or A/D - Move',
            'Space or W - Jump'
        ];
        instructions.forEach((line, index) => {
            this.add.text(width / 2, height / 2 + 80 + (index * 30), line, {
                fontSize: '18px',
                color: '#888888'
            }).setOrigin(0.5);
        });
        // Add pulsing effect to start text
        const startText = this.add.text(width / 2, height - 100, '> Press SPACE <', {
            fontSize: '20px',
            color: '#FFD700'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        // Input to start game
        this.input.keyboard.once('keydown-SPACE', () => {
            console.log('Starting GameScene from SPACE');
            this.scene.start('GameScene');
        });
        this.input.keyboard.once('keydown-ENTER', () => {
            console.log('Starting GameScene from ENTER');
            this.scene.start('GameScene');
        });
        // Also allow clicking anywhere to start
        this.input.once('pointerdown', () => {
            console.log('Starting GameScene from click');
            this.scene.start('GameScene');
        });
        console.log('MainMenu scene created and ready');
    }
}
//# sourceMappingURL=MainMenu.js.map