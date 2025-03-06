import {
    Vec2,
    vec2,
    vec3,
} from "./deps.ts"
import { Grid } from "./Grid.ts"
import { HeightMap } from "./HeightMap.ts"

const dt = 1.2
const density = 1
const friction = 0.05
const depositionRate = 0.1
const evapRate = 0.001

const minVol = 0.001

export class Particle {
    pos
    heightmap
    speed = vec2(0, 0)

    volume = 1
    sediment = 0
    volumeFactor = 100

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
        const ipos = this.pos.clone()
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

    descend(
        h: HeightMap,
        stream: Grid<number>,
        pool: Grid<number>,
        track: Grid<boolean>,
        dim: Vec2,
        scale: number,
    ) {
        let ipos: Vec2

        while (this.volume < minVol) {
            ipos = this.pos.clone()

            track.setAtV(ipos, true)

            const effD = depositionRate
            const effF = friction*(1-0.5*stream.atV(ipos))
            const effR = evapRate*(1-0.2*stream.atV(ipos))

            if (!(
                0 <= this.pos.x &&
                     this.pos.x <= dim.x &&
                0 <= this.pos.y &&
                     this.pos.y <= dim.y
            )) {
                this.volume = 0
                break
            }

            const npos = ipos // todo?
            const acc = vec2(0, 0)

            if (
                stream.atV(npos) > 0.5
                && acc.size < 0.01
            ) break

            if (pool.atV(npos) > 0) break
        }
    }

    flood(
        height: HeightMap,
        pool: Grid<number>,
        dim: Vec2,
    ) {
        let plane = height.atV(this.pos) + pool.atV(this.pos)
        let initialPlane = plane

        let floodSet: Vec2[] = []
        let fail = 10

        while (this.volume > minVol) {
            floodSet = []
            const tried = HeightMap.fromDimension(
                dim.x,
                dim.y,
                () => false,
            )

            let drain: Vec2
            let drainFound = false

            const fill = (x: number, y: number) => {
                if (!(
                    0 <= x &&
                         x <= dim.x &&
                    0 <= y &&
                         y <= dim.y
                )) return

                if (tried.at(x, y)) return
                tried.setAt(x, y, true)

                const iPlane = height.at(x, y) + pool.at(x, y)

                if (plane < iPlane) return

                if (initialPlane > iPlane) {
                    if (
                        !drainFound ||
                        height.atV(drain) + pool.atV(drain) < iPlane
                    ) drain = vec2(x, y)

                    drainFound = true
                    return
                }

                floodSet.push(vec2(x, y))
                fill(x+1, y)
                fill(x-1, y)
                fill(x, y+1)
                fill(x, y-1)
                fill(x+1, y+1)
                fill(x-1, y-1)
                fill(x+1, y-1)
                fill(x-1, y+1)
            }

            fill(this.pos.x, this.pos.y)

            if (drain!) {
                this.pos = drain!.clone()

                const drainage = 0.001
                plane = (1-drainage)*initialPlane
                    + drainage*(height.atV(drain)+pool.atV(drain))
                
                for (const s of floodSet)
                    pool.setAtV(
                        s,
                        Math.max(plane - height.atV(s), 0),
                    )

                this.sediment *= 0.1
                break
            }

            let tVol = 0

            for (const s of floodSet)
                tVol += this.volumeFactor*(plane-height.atV(s)-pool.atV(s))
            
            if (tVol <= this.volume && initialPlane < plane) {
                for (const s of floodSet)
                    pool.setAtV(s, plane-height.atV(s))

                this.volume -= tVol
                tVol = 0
            }
            else fail--

            const approach = 0.5
            initialPlane = Math.max(plane, initialPlane)
            plane += approach*(this.volume-tVol)
                / floodSet.length
                / this.volumeFactor
        }

        if (fail == 0)
            this.volume = 0
    }
}
