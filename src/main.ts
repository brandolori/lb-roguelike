import { Bullet, BulletType, Enemy, State } from "./types"
import { StateUpdater, init, Vec2, TimerRequest } from './bge'
import "./style.css"
import { stateDrawer } from "./stateDrawer"
import { getRandomRoom } from "./rooms"
import { baseSize, screenWidth, playerSpeed, bulletSpeed, screenHeight } from "./constants"
import { getFreeRandomDirection, getRandomEnemies } from "./enemies"

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

const tryMove = (startingPos: Vec2, movement: Vec2, occupiedPositions: Vec2[]): Vec2 => {
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

const stateUpdater: StateUpdater<State> = (state: State, events: Set<string | symbol>, deltaTime: number) => {
    // unpack
    const { playerPos: oldPlayerPos, bullets: oldBullets, canShoot, enemies: oldEnemies, obstacles } = state
    const newTimers: TimerRequest[] = []
    let enemies = [...oldEnemies]
    let bullets = [...oldBullets]

    // player movement
    const playerOffset = {
        x: (events.has("move-right") ? +playerSpeed : 0) + (events.has("move-left") ? -playerSpeed : 0),
        y: (events.has("move-down") ? +playerSpeed : 0) + (events.has("move-up") ? -playerSpeed : 0)
    }
    const playerDelta = Vec2.mult(playerOffset, deltaTime)

    const occupiedPositions = [
        ...enemies.map(en => en.pos),
        ...obstacles.map(en => en.pos)
    ]

    const playerPos = tryMove(oldPlayerPos, playerDelta, occupiedPositions)

    // bullet movement
    bullets = bullets.map(bu => ({ ...bu, pos: Vec2.sum(bu.pos, Vec2.mult(bu.speed, deltaTime)) }))

    // enemy movement
    enemies = enemies.map(en => {

        if (en.state == "paused") {
            return en
        }

        if ((en.type == "imp" || en.type == "rhino") && en.state != "moving") {
            return en
        }

        const playerDistance = Vec2.sub(playerPos, en.pos)
        const movementDirection = (() => {
            switch (en.type) {
                case "slime":
                case "fast-slime":
                    return Vec2.normalize(playerDistance)
                case "rhino":
                case "imp":
                    return en.movementDirection
                default: return Vec2.zero
            }
        })()
        const movement = (() => {
            switch (en.type) {
                case "slime": return Vec2.mult(movementDirection, playerSpeed / 2 * deltaTime)
                case "fast-slime": return Vec2.mult(movementDirection, playerSpeed * deltaTime)
                case "imp": return Vec2.mult(movementDirection, playerSpeed / 2 * deltaTime)
                case "rhino": return Vec2.mult(movementDirection, playerSpeed * 3 * deltaTime)
                default: return Vec2.zero
            }
        })()

        const occupiedPositions = [
            playerPos,
            ...enemies.filter(enemy => enemy != en).map(en => en.pos),
            ...obstacles.map(en => en.pos)
        ]

        const newPos = tryMove(en.pos, movement, occupiedPositions)

        return {
            ...en,
            pos: newPos
        }
    })

    if (events.has("room-start-cooldown")) {
        enemies = enemies.map(en => ({ ...en, state: "idle" }))
        enemies.filter(en => en.type == "imp" || en.type == "turret" || en.type == "rhino").forEach(en => newTimers.push({ id: en.symbol, time: Math.random() * 4 }))
    }

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
        newTimers.push({ id: "shoot-cooldown", time: .2 })
    }

    // turret
    enemies = enemies.map(en => {
        if (en.type != "turret" || en.state == "paused" || !events.has(en.symbol)) {
            return en
        }

        newTimers.push({ id: en.symbol, time: Math.random() * 5 + 1 })
        return {
            ...en,
            state: en.state == "idle" ? "shooting" : "idle",
        }
    })

    // rhino
    enemies = enemies.map(en => {
        if (en.type != "rhino" || en.state == "paused" || !events.has(en.symbol)) {
            return en
        }

        newTimers.push({ id: en.symbol, time: en.state == "idle" ? 1 : Math.random() * 5 + 1 })
        return {
            ...en,
            state: en.state == "moving" ? "idle" : "moving",
            movementDirection: Vec2.normalize(Vec2.sub(playerPos, en.pos))
        }
    })

    // imp
    enemies = enemies.map(en => {
        if (en.type != "imp" || en.state == "paused" || !events.has(en.symbol)) {
            return en
        }

        newTimers.push({ id: en.symbol, time: Math.random() * 2 + 1 })
        return {
            ...en,
            state: en.state == "moving" ? "idle" : "moving",
            movementDirection: getFreeRandomDirection(en.pos, obstacles.map(el => el.pos))
        }
    })

    const turretBullets: Bullet[] = events.has("generic-rapid")
        ? enemies
            .filter(en => en.type == "turret" && en.state == "shooting")
            .map(en => {
                const direction = Vec2.normalize(Vec2.sub(playerPos, en.pos))
                return getNewBullet(en.pos, Vec2.zero, direction, bulletSpeed, "normal", true)
            })
        : []

    const impBullets: Bullet[] = enemies.filter(en => en.type == "imp" && en.state == "idle" && events.has(en.symbol)).map(en => {
        const direction = Vec2.normalize(Vec2.sub(playerPos, en.pos))
        return getNewBullet(en.pos, Vec2.zero, direction, bulletSpeed, "normal", true)
    })

    // bullet/enemy collision
    bullets = [...bullets, ...addedBullets, ...turretBullets, ...impBullets]

    const collisions = bullets
        .filter(bu => !bu.enemy)
        .flatMap(bu => enemies.map(en => ([bu, en])))
        .filter(co => Vec2.distance(co[0].pos, co[1].pos) <= baseSize / 2) as [Bullet, Enemy][]

    const uniqueCollisions = new Map(collisions)
    const bulletsCollided = new Set(uniqueCollisions.keys())
    const enemiesCollided = new Set(uniqueCollisions.values())

    bullets = bullets.filter(bu => !bulletsCollided.has(bu))
    enemies = enemies.filter(en => !enemiesCollided.has(en))

    // bullet/wall collisions
    const wallCollisions = bullets
        .flatMap(bu => obstacles.map(os => ({ bu, os })))
        .filter(co => Vec2.squareCollision(co.bu.pos, co.os.pos, baseSize))
        .map(cp => cp.bu)

    const wallCollisionsSet = new Set<Bullet>(wallCollisions)

    bullets = bullets.filter(bu => !wallCollisionsSet.has(bu))

    if (events.has("generic-rapid")) {
        newTimers.push({ id: "generic-rapid", time: .5 })
    }

    // assemble next state
    const nextState: State = {
        playerPos: playerPos,
        bullets: bullets,
        enemies: enemies,
        canShoot: canShootInFrame && !hasShot,
        obstacles
    }
    return {
        timers: newTimers,
        state: nextState
    }
}

const canvas = document.getElementById('bge-canvas')! as HTMLCanvasElement
canvas.width = screenWidth
canvas.height = screenHeight

const initialRoom = getRandomRoom()

const initialState: State = {
    playerPos: { x: 36, y: 36 },
    canShoot: true,
    bullets: [],
    enemies: getRandomEnemies({ x: 36, y: 36 }, initialRoom.map(os => os.pos)),
    obstacles: initialRoom
}

const startEvents = [{ id: "generic-rapid", time: 0 }, { id: "room-start-cooldown", time: 1 }]

init(canvas, initialState, stateUpdater, stateDrawer, startEvents)
