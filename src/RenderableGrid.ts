import { Grid } from "./Grid.ts"

export type RGBA = [number, number, number, number]

export abstract class RenderableGrid<T> extends Grid<T> {
    /*static*/ abstract toRGBA(data: T): RGBA
    /*static*/ abstract fromRGBA(rgba: RGBA): T

    toImageData() {
        const u = Array.from(
            { length: this.width*this.height },
            (_, i) => this.data
                [i % this.width]
                [Math.floor(i / this.width)],
        ).flatMap(h => this.toRGBA(h))

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

    static async fromPath(
        path: string
    ) {
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
                this.prototype.fromRGBA(
                    Array.from(imageData.data.slice(
                        (x+y*image.width)*4,
                        (x+y*image.width)*4+4,
                    )) as RGBA
                )
            )
        )
        // @ts-expect-error: this won't be abstract, right?
        return new this(arr)
    }
}