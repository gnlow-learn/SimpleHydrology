import { vec2, Vec2 } from "./deps.ts"

const mod =
(a: number, b: number) =>
    ((a % b) + b) % b

export class Grid<T> {
    data
    constructor(data: T[][]) {
        this.data = data
    }

    get width() {
        return this.data.length
    }
    get height() {
        return this.data[0].length
    }

    cleanCoord(x: number, y: number) {
        return [
            mod(Math.floor(x), this.width),
            mod(Math.floor(y), this.height),
        ]
    }
    at(x_: number, y_: number) {
        const [x, y] = this.cleanCoord(x_, y_)
        return this.data[Math.floor(x)][Math.floor(y)]
    }
    atV(v: Vec2) {
        return this.at(v.x, v.y)
    }
    setAt(x_: number, y_: number, value: T) {
        const [x, y] = this.cleanCoord(x_, y_)
        this.data[Math.floor(x)][Math.floor(y)] = value
    }
    setAtV(v: Vec2, value: T) {
        this.setAt(v.x, v.y, value)
    }

    static fromDimension<T>(
        w: number,
        h: number,
        fill: (pos: Vec2) => T,
    ) {
        return new this(
            Array.from({ length: w }, (_, x) =>
                Array.from({ length: h }, (_, y) =>
                    fill(vec2(x, y))
                )
            )
        )
    }
}