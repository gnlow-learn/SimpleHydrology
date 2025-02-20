import { html, render, ref } from "./src/deps.ts"

import { HeightMap } from "./src/HeightMap.ts"

const heightMap = await HeightMap.fromPath("./static/heightMap.png")

render(html`
    <canvas
        width=${heightMap.width}
        height=${heightMap.height}
        ${ref(el => {
            const canvas = el as HTMLCanvasElement
            const ctx = canvas.getContext("2d")!
            ctx.putImageData(
                heightMap.toImageData(),
                0, 0,
            )
        })}
    ></canvas>
`, document.body)