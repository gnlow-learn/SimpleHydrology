import "https://esm.sh/adorable-css@1.6.2"

import { html, render, ref } from "./src/deps.ts"

import { HeightMap } from "./src/HeightMap.ts"
import { Particle } from "./src/Particle.ts"

const heightMap = await HeightMap.fromPath("./static/heightMap.png")

const tick = () => new Promise(requestAnimationFrame)

render(html`
    <canvas
        width=${heightMap.width}
        height=${heightMap.height}
        ${ref(async el => {
            const canvas = el as HTMLCanvasElement
            heightMap.render(canvas)

            const particles = Array.from({ length: 200000 }, () =>
                new Particle(heightMap)
            )

            while (true) {
                await tick()
                heightMap.render(canvas)
                particles.forEach(particle => particle.step())
            }
        })}
    ></canvas>
`, document.body)