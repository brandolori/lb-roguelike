import { Vec2 } from "./bge"
import { baseSize, screenHeight, screenWidth } from "./constants"
import { getWithRandomChance } from "./getWithRandomChance"
import { Enemy, EnemyType } from "./types"

const difficulties: { type: EnemyType, difficulty: number }[] = [
    {
        type: "slime",
        difficulty: 1
    },
    {
        type: "fast-slime",
        difficulty: 2
    },
    {
        type: "turret",
        difficulty: 3
    },
    {
        type: "imp",
        difficulty: 4
    },
    {
        type: "rhino",
        difficulty: 4
    }
]

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

export const getRandomEnemies = (playerPos: Vec2, obstacles: Vec2[]): Enemy[] => {

    const positionPool = getValidPositions([playerPos, ...obstacles])

    return [...Array(10).keys()].map(() => {

        const randomIndex = Math.floor(Math.random() * positionPool.length)

        const randomPos = positionPool.splice(randomIndex, 1)[0]

        return ({
            pos: randomPos,
            type: getWithRandomChance<EnemyType>([
                { option: "slime", chance: 1 },
                { option: "fast-slime", chance: 1 },
                { option: "turret", chance: 1 },
                { option: "imp", chance: 1 },
                { option: "rhino", chance: 1 },
            ]),
            state: "paused",
            movementDirection: Vec2.zero,
            symbol: Symbol()
        })
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

export const getEnemyChar = (type: EnemyType): string => {
    switch (type) {
        case "slime": return "ç"
        case "fast-slime": return "Ç"
        case "turret": return "¡"
        case "imp": return "£"
        case "rhino": return "§"
        default: return "?"
    }
}
