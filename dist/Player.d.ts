import { Platform } from './Platform.js';
export declare class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    jumpPower: number;
    gravity: number;
    isOnGround: boolean;
    color: string;
    constructor(x: number, y: number);
    update(keys: Set<string>, platforms: Platform[], canvasHeight: number): void;
    checkCollision(platform: Platform): boolean;
    resolveCollision(platform: Platform): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Player.d.ts.map