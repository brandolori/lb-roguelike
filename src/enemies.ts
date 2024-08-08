import { Vec2, pick } from "./bge"
import { baseSize, screenHeight, screenWidth } from "./constants"
import { Enemy, EnemyData, EnemyType } from "./types"

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
    health: 6
})

const getFastSlime = (pos: Vec2): Enemy => ({
    pos,
    type: "fast-slime",
    state: "paused",
    movementDirection: Vec2.zero,
    symbol: Symbol(),
    hurt: false,
    hurtSymbol: Symbol(),
    health: 6
})

const getTurret = (pos: Vec2): Enemy => ({
    pos,
    type: "turret",
    state: "paused",
    movementDirection: Vec2.zero,
    symbol: Symbol(),
    hurt: false,
    hurtSymbol: Symbol(),
    health: 10
})

const getImp = (pos: Vec2): Enemy => ({
    pos,
    type: "imp",
    state: "paused",
    movementDirection: Vec2.zero,
    symbol: Symbol(),
    hurt: false,
    hurtSymbol: Symbol(),
    health: 10
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