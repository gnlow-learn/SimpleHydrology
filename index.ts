import "https://esm.sh/adorable-css@1.6.2"

import { html, render, ref } from "./src/deps.ts"

import { HeightMap } from "./src/HeightMap.ts"
import { World } from "./src/World.ts"

const heightMap = await HeightMap.fromPath("./static/heightMap.png")

const tick = () => new Promise(requestAnimationFrame)

render(html`
    <canvas
        width=${heightMap.width}
        height=${heightMap.height}
        ${ref(async el => {
            const canvas = el as HTMLCanvasElement
            heightMap.render(canvas)

            const world = new World(heightMap)

            while (true) {
                await tick()
                heightMap.render(canvas)
                world.erode(1)
            }
        })}
    ></canvas>
`, document.body)