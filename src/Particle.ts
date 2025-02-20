import {
    Vec2,
    vec2,
    vec3,
} from "./deps.ts"

export class Particle {
    pos
    heightmap
    speed = vec2(0, 0)

    volume = 1
    sediment = 1

    constructor(
        pos: Vec2,
        heightmap: number[][],
    ) {
        this.pos = pos
        this.heightmap = heightmap
    }

    getNormal(x: number, y: number) {
        const L = this.heightmap[x-1][y]
        const R = this.heightmap[x+1][y]
        const T = this.heightmap[x][y+1]
        const B = this.heightmap[x][y-1]

        const n = vec3(R-L, B-T, -2)

        return n.mul(1/n.size)
    }

    step() {
        const dt = 1
        const density = 1
        const friction = 0.1
        const depositionRate = 1
        const evapRate = 0.01

        const ipos = this.pos
        const n = this.getNormal(ipos.x, ipos.y)

        this.speed = this.speed.add(
            vec2(n.x, n.z)
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
                this.heightmap[ipos.x][ipos.y]
              - this.heightmap[this.pos.x][this.pos.y]
            )
        )

        const cdiff = c_eq - this.sediment

        this.sediment += dt * depositionRate * cdiff
        this.heightmap[ipos.x][ipos.y] -=
            dt
            * this.volume
            * depositionRate
            * cdiff
        
        this.volume *= 1 - dt * evapRate
    }
}
