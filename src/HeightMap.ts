import { RenderableGrid, RGBA } from "./RenderableGrid.ts"

export class HeightMap extends RenderableGrid<number> {
    toRGBA(h: number) {
        return [h, h, h, 255] as RGBA
    }
    fromRGBA(rgba: RGBA) {
        return rgba[0]
    }
}