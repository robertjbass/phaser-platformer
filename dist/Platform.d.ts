export declare class Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    constructor(x: number, y: number, width: number, height: number, color?: string);
    draw(ctx: CanvasRenderingContext2D): void;
    collidesWith(x: number, y: number, width: number, height: number): boolean;
}
//# sourceMappingURL=Platform.d.ts.map