import { Vec2 } from "./deps.ts"

const mod =
(a: number, b: number) =>
    ((a % b) + b) % b

export class HeightMap {
    data
    constructor(data: number[][]) {
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
    setAt(x_: number, y_: number, value: number) {
        const [x, y] = this.cleanCoord(x_, y_)
        this.data[Math.floor(x)][Math.floor(y)] = value
    }
    setAtV(v: Vec2, value: number) {
        this.setAt(v.x, v.y, value)
    }

    toImageData() {
        const u = Array.from(
            { length: this.width*this.height },
            (_, i) => this.data
                [i % this.width]
                [Math.floor(i / this.width)],
        ).flatMap(h => [h, h, h, 255])

        return new ImageData(
            Uint8ClampedArray.from(u),
            this.width,
            this.height,
        )
    }
    render(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d")!
        ctx.putImageData(this.toImageData(), 0, 0)
    }

    static async fromPath(path: string) {
        const image = new Image()
        image.src = path
        await new Promise(o => image.addEventListener("load", o))

        const canvas = document.createElement("canvas")
        canvas.width = image.width
        canvas.height = image.height

        const ctx = canvas.getContext("2d")!

        ctx.drawImage(image, 0, 0)

        const imageData = ctx.getImageData(0, 0, image.width, image.height)

        const arr = Array.from({ length: image.width }, (_, x) =>
            Array.from({ length: image.height }, (_, y) =>
                imageData.data[(x+y*image.width)*4]
            )
        )
        return new HeightMap(arr)
    }
}