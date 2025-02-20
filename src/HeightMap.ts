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