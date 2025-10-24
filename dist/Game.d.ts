import { Player } from './Player.js';
import { Platform } from './Platform.js';
export declare class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;
    platforms: Platform[];
    keys: Set<string>;
    lastTime: number;
    constructor(canvas: HTMLCanvasElement);
    setupInput(): void;
    update(deltaTime: number): void;
    draw(): void;
    gameLoop(currentTime: number): void;
    start(): void;
}
//# sourceMappingURL=Game.d.ts.map