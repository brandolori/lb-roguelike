import { Bullet, Drop, Enemy, State } from "./types"
import { StateUpdater, init, Vec2, TimerRequest } from './bge'
import "./style.css"
import { stateDrawer } from "./stateDrawer"
import { baseSize, screenWidth, playerSpeed, bulletSpeed, screenHeight, roomsInLevel, startPos } from "./constants"
import { enemyUpdate, enemyBullets } from "./enemies"
import { tryMove } from "./tryMove"
import { generateRoom } from "./levels"
import { getNewBullet, getShotgunBullet, randomizeVec2 } from "./player"

const stateUpdater: StateUpdater<State> = (state: State, events: Set<string | symbol>, deltaTime: number) => {
    // unpack
    const { canShoot, obstacles, roomIndex, levelIndex } = state

    const playerState = { ...state.playerState }
    let enemies = [...state.enemies]
    let bullets = [...state.bullets]
    let drops = [...state.drops]

    const newTimers: TimerRequest[] = []

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

    playerState.pos = tryMove(playerState.pos, playerDelta, occupiedPositions)

    // player shooting
    const shootCooldownOver = events.has("shoot-cooldown")
    const canShootInFrame = shootCooldownOver || canShoot
    let newPlayerBullets: Bullet[] = []
    let hasShot = false

    if (canShoot) {
        let shootingDirection: Vec2

        if (events.has("shoot-right")) {
            shootingDirection = Vec2.right
        }
        else if (events.has("shoot-left")) {
            shootingDirection = Vec2.left
        }
        else if (events.has("shoot-up")) {
            shootingDirection = Vec2.up
        }
        else if (events.has("shoot-down")) {
            shootingDirection = Vec2.down
        }

        if (shootingDirection) {

            if (playerState.weapon == "none") {
                newPlayerBullets.push(getNewBullet(playerState.pos, playerOffset, shootingDirection, bulletSpeed, "normal", false))
                newTimers.push({ id: "shoot-cooldown", time: .2 })
            }
            else if (playerState.weapon == "big-gun") {
                newPlayerBullets.push(getNewBullet(playerState.pos, playerOffset, shootingDirection, bulletSpeed * .75, "big", false))
                newTimers.push({ id: "shoot-cooldown", time: .2 })
            }
            else if (playerState.weapon == "uzi") {
                newPlayerBullets.push(getNewBullet(playerState.pos, playerOffset, randomizeVec2(shootingDirection, .2), bulletSpeed * 1.5, "small", false))
                newTimers.push({ id: "shoot-cooldown", time: .1 })
            }
            else if (playerState.weapon == "shotgun") {
                newPlayerBullets.push(
                    getShotgunBullet(playerState.pos, playerOffset, shootingDirection),
                    getShotgunBullet(playerState.pos, playerOffset, shootingDirection),
                    getShotgunBullet(playerState.pos, playerOffset, shootingDirection),
                    getShotgunBullet(playerState.pos, playerOffset, shootingDirection),
                    getShotgunBullet(playerState.pos, playerOffset, shootingDirection),

                )
                newTimers.push({ id: "shoot-cooldown", time: .75 })
            }
            hasShot = true
        }
    }

    // bullet movement
    bullets = bullets.map(bu => ({ ...bu, pos: Vec2.sum(bu.pos, Vec2.mult(bu.speed, deltaTime)) }))

    // shotgun bullets
    bullets = bullets.map(bu => ({
        ...bu,
        speed: bu.type == "shotgun" ? Vec2.mult(bu.speed, 1 - Math.min(deltaTime * 4, 1)) : bu.speed
    }))
        .filter(bu => !(bu.type == "shotgun" && Vec2.distance(Vec2.zero, bu.speed) < baseSize * 3))

    // enemy movement
    enemies = enemies.map(en => {

        if (en.state == "paused") {
            return en
        }

        if ((en.type == "imp" || en.type == "rhino") && en.state != "moving") {
            return en
        }

        const playerDistance = Vec2.sub(playerState.pos, en.pos)
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
                case "imp": return Vec2.mult(movementDirection, playerSpeed * deltaTime)
                case "rhino": return Vec2.mult(movementDirection, playerSpeed * 3 * deltaTime)
                default: return Vec2.zero
            }
        })()

        const occupiedPositions = [
            playerState.pos,
            ...enemies.filter(enemy => enemy != en).map(en => en.pos),
            ...obstacles.map(en => en.pos)
        ]

        const newPos = tryMove(en.pos, movement, occupiedPositions)

        return {
            ...en,
            pos: newPos
        }
    })

    // update Enemies
    enemies = enemies.map(en => enemyUpdate(en, state, events, newTimers))

    const newEnemyBullets = enemies.map(en => enemyBullets(en, state, events)).filter(el => el)

    // bullet/enemy collision
    bullets = [...bullets, ...newPlayerBullets, ...newEnemyBullets]

    const collisions = bullets
        .filter(bu => !bu.enemy)
        .flatMap(bu => enemies.map(en => ([bu, en])))
        .filter(co => Vec2.distance(co[0].pos, co[1].pos) <= baseSize / 2) as [Bullet, Enemy][]

    const uniqueCollisions = new Map(collisions)
    const bulletsCollided = new Set(uniqueCollisions.keys())
    const enemiesCollided = new Set(uniqueCollisions.values())

    bullets = bullets.filter(bu => !bulletsCollided.has(bu))
    const enemiesNotCollided = enemies.filter(en => !enemiesCollided.has(en))
    const enemiesHurt: Enemy[] = [...enemiesCollided].map(en => {

        if (!en.hurt) {
            newTimers.push({ id: en.hurtSymbol, time: .125 })
        }

        return ({
            ...en,
            hurt: true,
            health: en.health - 1
        })
    })

    const survivedEnemies = enemiesHurt.filter(en => en.health > 0)

    const newDrops: Drop[] = enemiesHurt.filter(en => en.health <= 0).map(en => ({ pos: en.pos, type: "big-gun" }))

    drops.push(...newDrops)

    enemies = [...enemiesNotCollided, ...survivedEnemies]

    // bullet/wall collisions
    const wallCollisions = bullets
        .flatMap(bu => obstacles.map(os => ({ bu, os })))
        .filter(co => Vec2.squareCollision(co.bu.pos, co.os.pos, baseSize))
        .map(cp => cp.bu)

    const wallCollisionsSet = new Set<Bullet>(wallCollisions)

    bullets = bullets.filter(bu => !wallCollisionsSet.has(bu))

    // bullet/player collisions
    const playerCollisions = bullets
        .filter(bu => bu.enemy)
        .filter(bu => Vec2.squareCollision(bu.pos, playerState.pos, baseSize))

    const playerCollisionsSet = new Set<Bullet>(playerCollisions)
    bullets = bullets.filter(bu => !playerCollisionsSet.has(bu))

    // enemy/player collisions
    const enemyPlayerCollisions = enemies
        .filter(en => Vec2.squareCollision(en.pos, playerState.pos, baseSize + 1))

    // player damage
    if ((playerCollisions.length > 0 || enemyPlayerCollisions.length > 0) && !playerState.hurt) {
        playerState.health -= 25
        newTimers.push({ id: "hurt-cooldown", time: .25 })
        playerState.hurt = true

        if (playerState.health < 1) {
            location.reload()
        }
    }

    // process events
    if (events.has("generic-rapid")) {
        newTimers.push({ id: "generic-rapid", time: .5 })
    }
    if (events.has("room-start-cooldown")) {
        enemies = enemies.map(en => ({ ...en, state: "idle" }))
        enemies.filter(en => en.type == "imp" || en.type == "turret" || en.type == "rhino").forEach(en => newTimers.push({ id: en.symbol, time: Math.random() * 4 }))
    }
    if (events.has("hurt-cooldown")) {
        playerState.hurt = false
    }

    if (enemies.length == 0) {
        obstacles.push({ pos: Vec2.mult({ x: 13.5, y: 14.5 }, baseSize), type: "door" })
    }

    // move to next room
    if (Vec2.squareCollision(playerState.pos, obstacles.find(os => os.type == "door")?.pos ?? Vec2.zero, baseSize * 2)) {

        const newState = generateRoom((roomIndex + 1) % roomsInLevel, roomIndex + 1 == roomsInLevel ? levelIndex + 1 : levelIndex, playerState)
        newTimers.push({ id: "room-start-cooldown", time: 1 })
        return {
            timers: newTimers,
            state: newState
        }
    }

    // assemble next state
    return {
        timers: newTimers,
        state: {
            ...state,
            playerState,
            bullets: bullets,
            enemies: enemies,
            drops,
            canShoot: canShootInFrame && !hasShot,
        }
    }
}

const canvas = document.getElementById('bge-canvas')! as HTMLCanvasElement
canvas.width = screenWidth
canvas.height = screenHeight

const initialState = generateRoom(0, 0, { health: 100, pos: startPos, hurt: false, weapon: "shotgun", weaponHealth: 100 })

const startEvents = [{ id: "generic-rapid", time: 0 }, { id: "room-start-cooldown", time: 1 }]

init(canvas, initialState, stateUpdater, stateDrawer, startEvents)
