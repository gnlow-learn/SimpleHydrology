import { vec2 } from "./deps.ts"
import { Grid } from "./Grid.ts"
import { HeightMap } from "./HeightMap.ts"
import { Particle } from "./Particle.ts"

const minVol = 0.001

export class World {
    heightMap
    waterStream
    waterPool
    dim

    constructor(
        heightMap: HeightMap
    ) {
        this.heightMap = heightMap
        this.waterStream = HeightMap.fromDimension(
            heightMap.width,
            heightMap.height,
            () => 0,
        )
        this.waterPool = HeightMap.fromDimension(
            heightMap.width,
            heightMap.height,
            () => 0,
        )

        this.dim = vec2(this.heightMap.width, this.heightMap.height)
    }

    drop(track: Grid<boolean>) {
        const drop = new Particle(
            this.heightMap,
            vec2(
                Math.random() * this.heightMap.width,
                Math.random() * this.heightMap.height,
            ),
        )

        let spill = 5
        while (drop.volume > minVol && spill != 0) {
            drop.descend(
                this.heightMap,
                this.waterStream,
                this.waterPool,
                track,
                this.dim,
                1, //scale
            )

            if (drop.volume > minVol)
                drop.flood(this.heightMap, this.waterPool, this.dim)
            spill--
        }
    }

    erode(n: number) {
        const track = Grid.fromDimension(
            this.dim.x,
            this.dim.y,
            () => false,
        )

        for (let i=0; i<n; i++) {
            this.drop(track)
        }

        const lRate = 0.01

        for (let x=0; x<this.dim.x; x++) {
            for (let y=0; y<this.dim.y; y++) {
                this.waterStream.setAt(x, y,
                    (1-lRate)*this.waterStream.at(x, y)
                    + lRate*(track.at(x, y) ? 1 : 0)
                )
            }
        }
    }
}