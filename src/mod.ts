import { Particle } from "./Particle.ts"

const loadHeightMap =
async (path: string) => {
    const image = new Image()
    image.src = path
    await new Promise(o => image.addEventListener("load", o))

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    ctx.drawImage(image, 0, 0)

    return Array.from({ length: image.width }, (_, x) =>
        Array.from({ length: image.height }, (_, y) =>
            ctx.getImageData(x, y, 1, 1).data[0]
        )
    )
}


console.log(await loadHeightMap("./static/heightMap.png"))