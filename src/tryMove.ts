import { Vec2 } from './bge'
import { baseSize } from "./constants"

export const tryMove = (startingPos: Vec2, movement: Vec2, occupiedPositions: Vec2[]): Vec2 => {
    const testPos = (testing: Vec2) => occupiedPositions.every(ps => !Vec2.squareCollision(ps, testing, baseSize))

    const fullMove = Vec2.sum(startingPos, movement)
    if (testPos(fullMove)) {
        return fullMove
    }

    const xMove: Vec2 = { x: startingPos.x + movement.x, y: startingPos.y }
    if (testPos(xMove)) {
        return xMove
    }

    const yMove: Vec2 = { x: startingPos.x, y: startingPos.y + movement.y }
    if (testPos(yMove)) {
        return yMove
    }

    return startingPos
}
