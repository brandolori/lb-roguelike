import { Bullet, BulletType, Enemy, EnemyType, State } from "./types"
import { StateUpdater, GameContext, init, Vec2, Drawable } from './bge'
import "./style.css"

const playerSpeed = 60
const bulletSpeed = 120
const baseSize = 24
const playerColor = "#000000"
const enemyColor = "#720714"
const screenWidth = 640
const screenHeight = 360

const getNewBullet = (position: Vec2, baseSpeed: Vec2, direction: Vec2, speed: number, type: BulletType, enemy: boolean): Bullet => ({
    pos: Vec2.sum(position, Vec2.mult(direction, baseSize / 2)),
    speed: Vec2.sum(Vec2.mult(direction, speed), baseSpeed),
    type,
    enemy
})

const getRandom = (range: number, forbidden: number) => {
    const value = Math.random() * screenWidth
    return Math.abs(value - forbidden) > 3 * baseSize
        ? value
        : getRandom(range, forbidden)
}

const getEnemyChar = (type: EnemyType): string => {
    switch (type) {
        case "slime": return "ç"
        case "fast-slime": return "Ç"
        case "turret": return "¡"
        default: return "?"
    }
}

const getWithRandomChance = <T>(options: { option: T, chance: number }[]) => {
    const totalWeight = options.reduce((sum, opt) => sum + opt.chance, 0)
    const randomValue = Math.random() * totalWeight
    let cumulativeWeight = 0

    for (const opt of options) {
        cumulativeWeight += opt.chance
        if (randomValue <= cumulativeWeight) {
            return opt.option
        }
    }

    return null // Nessuna opzione valida trovata
}

const stateUpdater: StateUpdater<State> = (context: GameContext, state: State, events: Set<string>, deltaTime: number): State => {
    // unpack
    const { playerPos, bullets, canShoot, enemies } = state

    // player movement
    const playerOffset = {
        x: (events.has("move-right") ? +playerSpeed : 0) + (events.has("move-left") ? -playerSpeed : 0),
        y: (events.has("move-down") ? +playerSpeed : 0) + (events.has("move-up") ? -playerSpeed : 0)
    }
    const playerDelta = Vec2.mult(playerOffset, deltaTime)

    // bullet movement
    const bulletsMoved: Bullet[] = bullets.map(bu => ({ ...bu, pos: Vec2.sum(bu.pos, Vec2.mult(bu.speed, deltaTime)) }))

    // enemy movement
    const enemiesMoved: Enemy[] = enemies.map(en => {

        const playerDistance = Vec2.sub(playerPos, en.pos)

        const movementDirection = Vec2.normalize(playerDistance)

        const movement = (() => {
            switch (en.type) {
                case "slime": return Vec2.mult(movementDirection, playerSpeed / 2 * deltaTime)
                case "fast-slime": return en.pos, Vec2.mult(movementDirection, playerSpeed * deltaTime)
                default: return Vec2.zero
            }
        })()

        return {
            ...en,
            pos: Vec2.sum(en.pos, movement)
        }
    })

    // player shooting
    const shootCooldownOver = events.has("shoot-cooldown")
    const canShootInFrame = shootCooldownOver || canShoot
    let addedBullets: Bullet[] = []
    let hasShot = false

    if (canShoot) {
        if (events.has("shoot-right")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vec2.right, bulletSpeed, "normal", false))
            hasShot = true
        } else if (events.has("shoot-left")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vec2.left, bulletSpeed, "normal", false))
            hasShot = true
        } else if (events.has("shoot-up")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vec2.up, bulletSpeed, "normal", false))
            hasShot = true
        } else if (events.has("shoot-down")) {
            addedBullets.push(getNewBullet(playerPos, playerOffset, Vec2.down, bulletSpeed, "normal", false))
            hasShot = true
        }
    }

    if (hasShot) {
        context.requestTimer("shoot-cooldown", .2)
    }

    // bullet/enemy collision

    const bulletsMovedAdded = [...bulletsMoved, ...addedBullets]

    const collisions = bulletsMovedAdded
        .flatMap(bu => enemiesMoved.map(en => ([bu, en])))
        .filter(co => Vec2.distance(co[0].pos, co[1].pos) <= baseSize / 2) as [Bullet, Enemy][]

    const uniqueCollisions = new Map(collisions)

    const bulletsCollided = new Set(uniqueCollisions.keys())
    const enemiesCollided = new Set(uniqueCollisions.values())

    const bulletsLeft = bulletsMovedAdded.filter(bu => !bulletsCollided.has(bu))
    const enemiesLeft = enemiesMoved.filter(en => !enemiesCollided.has(en))

    // spawn enemies
    const spawnedEnemies: Enemy[] = events.has("spawn-enemies")
        ? [{
            pos: { x: getRandom(screenWidth, playerPos.x), y: getRandom(screenHeight, playerPos.y) },
            type: getWithRandomChance<EnemyType>([{ option: "slime", chance: 1 }, { option: "fast-slime", chance: 1 }, { option: "turret", chance: 1 }])
        }]
        : []

    if (events.has("spawn-enemies")) {
        context.requestTimer("spawn-enemies", 2)
    }
    

    // assemble next state
    const nextState = {
        playerPos: Vec2.sum(state.playerPos, playerDelta),
        bullets: bulletsLeft,
        enemies: [...enemiesLeft, ...spawnedEnemies],
        canShoot: canShootInFrame && !hasShot
    }
    return nextState
}

const stateDrawer = (state: State): Drawable[] => {
    const playerDrawable = {
        x: state.playerPos.x,
        y: state.playerPos.y,
        char: '@',
        size: baseSize,
        color: playerColor
    }

    const bulletDrawables: Drawable[] = state.bullets.map(bu => ({
        char: "•",
        color: playerColor,
        size: baseSize,
        x: bu.pos.x,
        y: bu.pos.y
    }))

    const enemiesDrawables: Drawable[] = state.enemies.map(en => ({
        char: getEnemyChar(en.type),
        color: enemyColor,
        size: baseSize,
        x: en.pos.x,
        y: en.pos.y
    }))

    return [
        ...bulletDrawables,
        ...enemiesDrawables,
        playerDrawable,
    ]
}

const initialState: State = {
    playerPos: { x: 10, y: 10 },
    canShoot: true,
    bullets: [],
    enemies: [{
        pos: { x: 50, y: 50 },
        type: "slime"
    }]
}

const canvas = document.getElementById('bge-canvas')! as HTMLCanvasElement
canvas.width = screenWidth
canvas.height = screenHeight

init(canvas, initialState, stateUpdater, stateDrawer, ["spawn-enemies"])
