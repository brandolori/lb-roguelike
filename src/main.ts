import { Vector2 } from "./bge";
import { Drawable } from "./bge";
import * as BGE from './bge';
import "./style.css"

const playerSpeed = 67
const bulletSpeed = 100
const baseSize = 18

type Bullet = {
    position: Vector2
    speed: Vector2
}

type State = {
    playerPos: Vector2
    bullets: Bullet[]
    timeout: number
}

const getNewBullet = (position: Vector2, baseSpeed: Vector2, direction: Vector2, speed: number): Bullet => {
    return { position: Vector2.sum(position, Vector2.mult(direction, baseSize)), speed: Vector2.sum(Vector2.mult(direction, speed), baseSpeed) }
}

const stateUpdater = (state: State, input: Set<string>, deltaTime: number): State => {

    console.log(deltaTime)

    // unpack
    const { playerPos, bullets, timeout } = state

    const horizontalOffset = (input.has("move-right") ? +playerSpeed : 0) + (input.has("move-left") ? -playerSpeed : 0)
    const verticalOffset = (input.has("move-down") ? +playerSpeed : 0) + (input.has("move-up") ? -playerSpeed : 0)
    const playerOffset = { x: horizontalOffset, y: verticalOffset }
    const playerDelta = Vector2.mult(playerOffset, deltaTime)

    const movedBullets: Bullet[] = bullets.map(bu => ({ ...bu, position: Vector2.sum(bu.position, Vector2.mult(bu.speed, deltaTime)) }))

    let addedBullets = []

    if (timeout == 0) {
        if (input.has("shoot-right")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vector2.right, bulletSpeed))
        } else if (input.has("shoot-left")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vector2.left, bulletSpeed))
        } else if (input.has("shoot-up")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vector2.up, bulletSpeed))
        } else if (input.has("shoot-down")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vector2.down, bulletSpeed))
        }
    }

    const updatedTimeout = addedBullets.length > 0 ? 0.2 : timeout - deltaTime

    // assemble
    const newBullets = [...movedBullets, ...addedBullets]
    const newPlayerPos = Vector2.sum(state.playerPos, playerDelta)
    const newTimeout = Math.max(updatedTimeout, 0)

    return {
        playerPos: newPlayerPos,
        bullets: newBullets,
        timeout: newTimeout
    }
}

const stateDrawer = (state: State): Drawable[] => {
    const bulletDrawables: Drawable[] = state.bullets.map(bu => ({ char: "•", color: "black", size: baseSize, x: bu.position.x, y: bu.position.y }))

    return [{ x: state.playerPos.x, y: state.playerPos.y, char: '@', size: baseSize, color: 'red' }, ...bulletDrawables]
}

const initialState: State = {
    playerPos: {
        x: 10,
        y: 10
    },
    bullets: [],
    timeout: 0
}

BGE.init(initialState, stateUpdater, stateDrawer)
