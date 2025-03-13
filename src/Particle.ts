import {
    Vec2,
    vec2,
    vec3,
} from "./deps.ts"
import { HeightMap } from "./HeightMap.ts"

import { Grid } from "./Grid.ts"

export class Particle {
    heightmap

    age = 0
    pos
    speed = vec2(0, 0)

    volume = 1
    sediment = 0

    grid

    constructor(
        heightMap: HeightMap,
        pos = vec2(
            Math.random() * heightMap.width,
            Math.random() * heightMap.height,
        ),
        grid: Grid<{
            height: number
            discharge: number
            momentumX: number
            momentumY: number

            dischargeTrack: number
            momentumXTrack: number
            momentumYTrack: number

            rootDensity: number
        }>,
    ) {
        this.pos = pos
        this.heightmap = heightMap

        this.grid = grid
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

    descend() {
        const evapRate = 0.001
        const depositionRate = 0.1
        const minVol = 0.01
        const maxAge = 500

        const entrainment = 10
        const gravity = 1
        const momentumTransfer = 1

        const ipos = this.pos.clone()

        const cell = this.grid.atV(ipos)

        const n = this.getNormal(ipos.x, ipos.y)

        if (
            this.age > maxAge
            || this.volume < minVol
        ) {
            cell.height += this.sediment
            return false
        }

        const effD = Math.max(depositionRate*(1-cell.rootDensity), 0)

        this.speed = this.speed.add(vec2(n.x, n.z).mul(
            gravity / this.volume
        ))

        if (this.speed.size > 0) {
            this.speed = this.speed.normalize().mul(Math.sqrt(2))
        }

        this.pos = this.pos.add(this.speed)

        cell.dischargeTrack += this.volume
        cell.momentumXTrack += this.volume*this.speed.x
        cell.momentumYTrack += this.volume*this.speed.y

        const h2 = this.grid.atV(this.pos).height

        const c_eq = Math.max(0,
            (1+entrainment*cell.discharge)
            *(cell.height-h2)
        )
        const cdiff = c_eq - this.sediment

        this.sediment += effD*cdiff
        cell.height -= effD*cdiff

        this.sediment /= 1-evapRate
        this.volume *= 1-evapRate

        this.age++

        this.cascade(this.pos)

        return true
    }

    cascade(pos: Vec2) {
        const maxDiff = 0.01
        const settling = 0.8

        ;[
            vec2(-1, -1),
            vec2(-1,  0),
            vec2(-1,  1),
            vec2( 0, -1),
            vec2( 0,  1),
            vec2( 1, -1),
            vec2( 1,  0),
            vec2( 1,  1),
        ]
        .map(v => ({
            cell: this.grid.atV(v.add(pos)),
            d: v.size,
        }))
        .toSorted((a, b) =>
            a.cell.height - b.cell.height
        )
        .forEach(({ cell, d }) => {
            const diff = this.grid.atV(pos).height - cell.height

            if (diff == 0) return
            
            const excess =
                Math.abs(diff) - (cell.height > 0.1 ? d*maxDiff : 0)
            
            if (excess <= 0) return
            
            const transfer = settling * excess / 2

            this.grid.atV(pos).height -= transfer*(diff>0?1:-1)
            cell.height += transfer*(diff>0?1:-1)
        })
    }
}
