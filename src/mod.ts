import { Vector } from "./deps.ts"

export class Particle {
    pos
    speed = new Vector([0, 0])

    volume = 1
    sediment = 1

    constructor(pos: Vector) {
        this.pos = pos
    }
}