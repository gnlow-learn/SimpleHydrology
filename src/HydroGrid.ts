import { RenderableGrid, RGBA } from "./RenderableGrid.ts"

export interface HydroData {
    height: number
    discharge: number
    momentumX: number
    momentumY: number

    dischargeTrack: number
    momentumXTrack: number
    momentumYTrack: number

    rootDensity: number
}

export class HydroGrid extends RenderableGrid<HydroData> {
    toRGBA({ height: h }: HydroData) {
        return [h, h, h, 255] as RGBA
    }
    fromRGBA(rgba: RGBA) {
        return {
            height: rgba[0],
            discharge: 0,
            momentumX: 0,
            momentumY: 0,

            dischargeTrack: 0,
            momentumXTrack: 0,
            momentumYTrack: 0,

            rootDensity: 0,
        }
    }
}