import "https://esm.sh/adorable-css@1.6.2"

import { html, render, ref } from "./src/deps.ts"

import { HydroGrid } from "./src/HydroGrid.ts"
import { Particle } from "./src/Particle.ts"
import { World } from "./src/World.ts"

const heightMap = await HydroGrid.fromPath("./static/heightMap.png")

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
                world.erode(10)
            }
        })}
    ></canvas>
`, document.body)