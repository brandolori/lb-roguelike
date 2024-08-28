import { TimerRequest, Vec2, pick } from "./bge"
import { baseSize, bulletSpeed, screenHeight, screenWidth } from "./constants"
import { getNewBullet } from "./player"
import { Enemy, EnemyData, EnemyType, State } from "./types"

export const getFreeRandomDirection = (starting: Vec2, obstacles: Vec2[]) => {
    for (let index = 0; index < 10; index++) {
        const random = Vec2.fromAngle(Math.random() * Math.PI * 2)
        const newPos = Vec2.sum(Vec2.mult(random, baseSize), starting)
        const free = obstacles.every(os => !Vec2.squareCollision(os, newPos, baseSize))
        if (free) {
            return random
        }
    }
}

const getSlime = (pos: Vec2): Enemy => ({
    pos,
    type: "slime",
    state: "paused",
    movementDirection: Vec2.zero,
    symbol: Symbol(),
    hurt: false,
    hurtSymbol: Symbol(),
    health: 5
})

const getFastSlime = (pos: Vec2): Enemy => ({
    pos,
    type: "fast-slime",
    state: "paused",
    movementDirection: Vec2.zero,
    symbol: Symbol(),
    hurt: false,
    hurtSymbol: Symbol(),
    health: 5
})

const getTurret = (pos: Vec2): Enemy => ({
    pos,
    type: "turret",
    state: "paused",
    movementDirection: Vec2.zero,
    symbol: Symbol(),
    hurt: false,
    hurtSymbol: Symbol(),
    health: 8
})

const getImp = (pos: Vec2): Enemy => ({
    pos,
    type: "imp",
    state: "paused",
    movementDirection: Vec2.zero,
    symbol: Symbol(),
    hurt: false,
    hurtSymbol: Symbol(),
    health: 7
})

const getRhino = (pos: Vec2): Enemy => ({
    pos,
    type: "rhino",
    state: "paused",
    movementDirection: Vec2.zero,
    symbol: Symbol(),
    hurt: false,
    hurtSymbol: Symbol(),
    health: 4
})

const difficulties: EnemyData[] = [
    {
        type: "slime",
        difficulty: 1,
        constructor: getSlime
    },
    {
        type: "fast-slime",
        difficulty: 2,
        constructor: getFastSlime
    },
    {
        type: "turret",
        difficulty: 3,
        constructor: getTurret
    },
    {
        type: "imp",
        difficulty: 3,
        constructor: getImp
    },
    {
        type: "rhino",
        difficulty: 3,
        constructor: getRhino
    }
]

export const getRandomEnemies = (playerPos: Vec2, obstacles: Vec2[], enemyTypes: EnemyType[], difficulty: number): Enemy[] => {

    const types = difficulties.filter(en => enemyTypes.includes(en.type))
    let positionPool = getValidPositions([playerPos, ...obstacles])

    let remainingDifficulty = difficulty
    const toSpawn: EnemyData[] = []

    while (remainingDifficulty > 0) {
        const item = pick(types)

        remainingDifficulty -= item.difficulty
        toSpawn.push(item)
    }

    return toSpawn.map(en => {

        const randomPos = pick(positionPool)

        positionPool = positionPool.filter(el => el != randomPos)

        return en.constructor(randomPos)
    })
}

const getValidPositions = (invalidPositions: Vec2[]): Vec2[] => {
    const gridHeight = screenHeight / baseSize
    const gridWidth = screenWidth / baseSize

    const columns = [...Array(gridWidth).keys()]
    const rows = [...Array(gridHeight).keys()]

    const startingPositions: Vec2[] = columns.flatMap(col => rows.map(row => ({ x: col, y: row }))).map(pos => Vec2.mult(pos, baseSize))

    return startingPositions.filter(pos => invalidPositions.every(inv => !Vec2.squareCollision(pos, inv, baseSize)))
}

export const enemyUpdate = (en: Enemy, state: State, events: Set<symbol | string>, newTimers: TimerRequest[]): Enemy => {

    const hurt = en.hurt && events.has(en.hurtSymbol) ? false : en.hurt

    if (en.type == "turret" && en.state != "paused" && events.has(en.symbol)) {
        newTimers.push({ id: en.symbol, time: Math.random() * 5 + 1 })
        return {
            ...en,
            hurt,
            state: en.state == "idle" ? "shooting" : "idle",
        }
    }
    if (en.type == "rhino" && en.state != "paused" && events.has(en.symbol)) {
        newTimers.push({ id: en.symbol, time: en.state == "idle" ? 1 : Math.random() * 5 + 1 })
        return {
            ...en,
            hurt,
            state: en.state == "moving" ? "idle" : "moving",
            movementDirection: Vec2.normalize(Vec2.sub(state.playerState.pos, en.pos))
        }
    }
    if (en.type == "imp" && en.state != "paused" && events.has(en.symbol)) {
        newTimers.push({ id: en.symbol, time: en.state == "idle" ? Math.random() + 1 : 1 })
        return {
            ...en,
            hurt,
            state: en.state == "moving" ? "idle" : "moving",
            movementDirection: getFreeRandomDirection(en.pos, state.obstacles.map(el => el.pos))
        }
    }

    return { ...en, hurt }
}

export const enemyBullets = (en: Enemy, state: State, events: Set<symbol | string>) => {
    if (events.has("generic-rapid") && en.type == "turret" && en.state == "shooting") {
        const direction = Vec2.normalize(Vec2.sub(state.playerState.pos, en.pos))
        return getNewBullet(en.pos, Vec2.zero, direction, bulletSpeed, "normal", true)
    }

    if (en.type == "imp" && en.state == "idle" && events.has(en.symbol)) {
        const direction = Vec2.normalize(Vec2.sub(state.playerState.pos, en.pos))
        return getNewBullet(en.pos, Vec2.zero, direction, bulletSpeed, "normal", true)
    }
}