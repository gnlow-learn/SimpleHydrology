import {
    Vec2,
    vec2,
    vec3,
} from "./deps.ts"
import { HeightMap } from "./HeightMap.ts"

export class Particle {
    pos
    heightmap
    speed = vec2(0, 0)

    volume = 1
    sediment = 0

    constructor(
        heightMap: HeightMap,
        pos = vec2(
            Math.random() * heightMap.width,
            Math.random() * heightMap.height,
        ),
    ) {
        this.pos = pos
        this.heightmap = heightMap
    }

    getNormal(x: number, y: number) {
        const L = this.heightmap.at(x-1, y)
        const R = this.heightmap.at(x+1, y)
        const T = this.heightmap.at(x, y+1)
        const B = this.heightmap.at(x, y-1)

        const n = vec3(R-L, B-T, -2)

        return n.mul(1/n.size)
    }

    step() {
        const dt = 1.2
        const density = 1
        const friction = 0.05
        const depositionRate = 0.1
        const evapRate = 0.001

        const ipos = vec2(this.pos.x, this.pos.y)
        const n = this.getNormal(ipos.x, ipos.y)

        this.speed = this.speed.add(
            vec2(n.x, n.y)
                .mul(dt)
                .mul(1/this.volume * density)
        )
        this.pos = this.pos.add(
            this.speed.mul(dt)
        )
        this.speed = this.speed.mul(
            1 - dt * friction
        )

        const c_eq = Math.max(0,
            this.volume
            * this.speed.size
            * (
                this.heightmap.atV(ipos)
              - this.heightmap.atV(this.pos)
            )
        )

        const cdiff = c_eq - this.sediment

        this.sediment += dt * depositionRate * cdiff
        this.heightmap.setAtV(ipos,
            this.heightmap.atV(ipos)
            - dt
            * this.volume
            * depositionRate
            * cdiff
        )
        
        this.volume *= 1 - dt * evapRate
    }
}
