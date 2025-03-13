import { Vec2, vec2 } from "./deps.ts"
import { Grid } from "./Grid.ts"
import { HeightMap } from "./HeightMap.ts"
import { Particle } from "./Particle.ts"

export class World {
    lrate = 0.1
    maxDiff = 0.01
    settling = 0.8

    grid: Grid<{
        height: number
        discharge: number
        momentumX: number
        momentumY: number

        dischargeTrack: number
        momentumXTrack: number
        momentumYTrack: number

        rootDensity: number
    }>
    constructor(heightMap: HeightMap) {
        this.grid = heightMap.map(height => ({
            height,
            discharge: 0,
            momentumX: 0,
            momentumY: 0,

            dischargeTrack: 0,
            momentumXTrack: 0,
            momentumYTrack: 0,

            rootDensity: 0,
        }))
    }
    
    erode(cycles: number) {
        for (let i=0; i<cycles; i++) {
            const newPos = vec2(
                this.grid.width*Math.random(),
                this.grid.height*Math.random(),
            )

            if (this.grid.atV(newPos).height < 0.1) continue

            const drop = new Particle(this.grid, newPos)

            while (drop.descend());

            this.grid.forEach((cell, pos) => {
                cell.discharge =
                    (1-this.lrate)*cell.discharge
                    + this.lrate*cell.dischargeTrack
                cell.momentumX =
                    (1-this.lrate)*cell.momentumX
                    + this.lrate*cell.momentumXTrack
                cell.momentumY =
                    (1-this.lrate)*cell.momentumY
                    + this.lrate*cell.momentumYTrack
            })
        }
    }
}