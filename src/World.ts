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
        this.grid = heightMap
    }
    
    erode(cycles: number) {
        
    }
}