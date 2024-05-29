import { Bullet, State } from "./types"
import { Vector2, Drawable } from "./bge"
import * as BGE from './bge'
import "./style.css"

const playerSpeed = 67
const bulletSpeed = 100
const baseSize = 18
const playerColor = "000000"
const enemyColor = "720714"

const getNewBullet = (position: Vector2, baseSpeed: Vector2, direction: Vector2, speed: number): Bullet => {
    return { position: Vector2.sum(position, Vector2.mult(direction, baseSize)), speed: Vector2.sum(Vector2.mult(direction, speed), baseSpeed) }
}

const stateUpdater: BGE.StateUpdater<State> = (context: BGE.GameContext, state: State, events: Set<string>, deltaTime: number): State => {

    // unpack
    const { playerPos, bullets, canShoot } = state

    // player movement
    const playerOffset = {
        x: (events.has("move-right") ? +playerSpeed : 0) + (events.has("move-left") ? -playerSpeed : 0),
        y: (events.has("move-down") ? +playerSpeed : 0) + (events.has("move-up") ? -playerSpeed : 0)
    }
    const playerDelta = Vector2.mult(playerOffset, deltaTime)

    // bullet movement
    const movedBullets: Bullet[] = bullets.map(bu => ({ ...bu, position: Vector2.sum(bu.position, Vector2.mult(bu.speed, deltaTime)) }))

    // player shooting
    const shootCooldownOver = events.has("shoot-cooldown")
    const canShootInFrame = shootCooldownOver || canShoot
    let addedBullets = []
    let hasShot = false

    if (canShoot) {
        if (events.has("shoot-right")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vector2.right, bulletSpeed))
            hasShot = true
        } else if (events.has("shoot-left")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vector2.left, bulletSpeed))
            hasShot = true
        } else if (events.has("shoot-up")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vector2.up, bulletSpeed))
            hasShot = true
        } else if (events.has("shoot-down")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vector2.down, bulletSpeed))
            hasShot = true
        }
    }

    if (hasShot) {
        context.requestTimer("shoot-cooldown", .2)
    }

    // assemble next state
    const nextState = {
        playerPos: Vector2.sum(state.playerPos, playerDelta),
        bullets: [...movedBullets, ...addedBullets],
        enemies: [],
        canShoot: canShootInFrame && !hasShot
    }
    return nextState
}

const stateDrawer = (state: State): Drawable[] => {
    const bulletDrawables: Drawable[] = state.bullets.map(bu => ({ char: "•", color: playerColor, size: baseSize, x: bu.position.x, y: bu.position.y }))

    return [{ x: state.playerPos.x, y: state.playerPos.y, char: '@', size: baseSize, color: playerColor }, ...bulletDrawables]
}

const initialState: State = {
    playerPos: {
        x: 10,
        y: 10
    },
    canShoot: true,
    bullets: [],
    enemies: []
}


const canvas = document.getElementById('bge-canvas')! as HTMLCanvasElement
canvas.width = 640
canvas.height = 360

BGE.init(canvas, initialState, stateUpdater, stateDrawer)
