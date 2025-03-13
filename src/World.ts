import { Grid } from "./Grid.ts"
import { HeightMap } from "./HeightMap.ts"

export class World {
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
        
    }
}