import { Vec2 } from "./bge"
import { screenHeight, baseSize, screenWidth } from "./constants"
import { getWithRandomChance } from "./getWithRandomChance"
import { Obstacle, ObstacleType } from "./types"

export function getVec2sInTriangle(p1: Vec2, p2: Vec2, p3: Vec2): Vec2[] {
    const Vec2s: Vec2[] = []

    // Funzione per determinare l'area di un triangolo dato dai tre punti
    const area = (p1: Vec2, p2: Vec2, p3: Vec2): number => {
        return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2)
    }

    // Funzione per verificare se un punto è all'interno del triangolo
    const isInside = (pt: Vec2): boolean => {
        const A = area(p1, p2, p3)
        const A1 = area(pt, p2, p3)
        const A2 = area(p1, pt, p3)
        const A3 = area(p1, p2, pt)

        return A === A1 + A2 + A3
    }

    // Trova i bounding box del triangolo
    const minX = Math.min(p1.x, p2.x, p3.x)
    const maxX = Math.max(p1.x, p2.x, p3.x)
    const minY = Math.min(p1.y, p2.y, p3.y)
    const maxY = Math.max(p1.y, p2.y, p3.y)

    // Itera attraverso il bounding box e verifica i punti interi
    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x++) {
        for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
            const Vec2 = { x, y }
            if (isInside(Vec2)) {
                Vec2s.push(Vec2)
            }
        }
    }

    return Vec2s
}

const flipX = (points: Vec2[], size: Vec2): Vec2[] => {
    return points.map(po => ({ x: size.x - po.x, y: po.y }))
}

const flipY = (points: Vec2[], size: Vec2): Vec2[] => {
    return points.map(po => ({ x: po.x, y: size.y - po.y }))
}

const mirror = (points: Vec2[], size: Vec2): Vec2[] => {
    return flipY(flipX(points, size), size)
}

const getVec2sInQuad = (p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2) => {
    const upperLeft = getVec2sInTriangle(p1, p2, p3).map(v2 => Vec2.mult(v2, baseSize))
    const lowerRight = getVec2sInTriangle(p2, p3, p4).map(v2 => Vec2.mult(v2, baseSize))

    return [...upperLeft, ...lowerRight]
}

const generateSequence = (length: number) => Array.from({ length: length }, (_, index) => index)

const getWalls = (): Vec2[] => {
    const wall1 = generateSequence(screenHeight / baseSize).map(nm => ({ x: baseSize / 2, y: nm * baseSize + baseSize / 2 }))
    const wall2 = generateSequence(screenHeight / baseSize).map(nm => ({ x: screenWidth - baseSize / 2, y: nm * baseSize + baseSize / 2 }))
    const wall3 = generateSequence(screenWidth / baseSize).map(nm => ({ y: baseSize / 2, x: nm * baseSize + baseSize / 2 }))
    const wall4 = generateSequence(screenWidth / baseSize).map(nm => ({ y: screenHeight - baseSize / 2, x: nm * baseSize + baseSize / 2 }))

    return [...wall1, ...wall2, ...wall3, ...wall4]
}

const getRoomA = (): Vec2[] => {
    const upperLeft = getVec2sInTriangle({ x: 3, y: 3 }, { x: 5, y: 5 }, { x: 3, y: 5 }).map(v2 => Vec2.mult(v2, baseSize))
    const upperRight = getVec2sInTriangle({ x: 23, y: 3 }, { x: 21, y: 5 }, { x: 23, y: 5 }).map(v2 => Vec2.mult(v2, baseSize))
    const lowerLeft = getVec2sInTriangle({ x: 3, y: 12 }, { x: 5, y: 10 }, { x: 3, y: 10 }).map(v2 => Vec2.mult(v2, baseSize))
    const lowerRight = getVec2sInTriangle({ x: 23, y: 12 }, { x: 21, y: 10 }, { x: 23, y: 10 }).map(v2 => Vec2.mult(v2, baseSize))

    return [...upperLeft, ...upperRight, ...lowerLeft, ...lowerRight]
}

const getRoomB = (): Vec2[] => {
    const quad = getVec2sInQuad({ x: 10, y: 6 }, { x: 10, y: 9 }, { x: 17, y: 6 }, { x: 17, y: 9 })

    return quad
}

const getRoomC = (): Vec2[] => {
    const quad1 = getVec2sInQuad({ x: 5, y: 6 }, { x: 5, y: 9 }, { x: 12, y: 6 }, { x: 12, y: 9 })
    const quad2 = getVec2sInQuad({ x: 15, y: 6 }, { x: 15, y: 9 }, { x: 22, y: 6 }, { x: 22, y: 9 })

    return [...quad1,
    ...quad2]
}

const getRoomD = (): Vec2[] => {
    const quad1 = getVec2sInQuad({ x: 3, y: 3 }, { x: 3, y: 6 }, { x: 8, y: 3 }, { x: 8, y: 6 })
    const quad2 = getVec2sInQuad({ x: 12, y: 7 }, { x: 12, y: 8 }, { x: 17, y: 5 }, { x: 17, y: 10 })
    const quad3 = getVec2sInQuad({ x: 22, y: 10 }, { x: 22, y: 12 }, { x: 23, y: 10 }, { x: 23, y: 12 })

    return [...quad1,
    ...quad2,
    ...quad3]
}

const getRoomE = (): Vec2[] => {

    const quad1 = getVec2sInQuad({ x: 10, y: 4 }, { x: 10, y: 5 }, { x: 17, y: 4 }, { x: 17, y: 5 })
    const quad2 = getVec2sInQuad({ x: 10, y: 6 }, { x: 10, y: 10 }, { x: 12, y: 6 }, { x: 12, y: 10 })
    const quad3 = getVec2sInQuad({ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 17, y: 10 }, { x: 17, y: 11 })

    return [...quad1,
    ...quad2,
    ...quad3]
}

export const getRandomRoom = (wallType: ObstacleType): Obstacle[] => {
    return getWithRandomChance<Vec2[]>([
        {
            chance: 1,
            option: getRoomA()
        },
        {
            chance: 1,
            option: getRoomB()
        },
        {
            chance: 1,
            option: getRoomC()
        },
        {
            chance: 1,
            option: getRoomD()
        },
        {
            chance: 1,
            option: getRoomE()
        },
        {
            chance: 1,
            option: mirror(getRoomD(), { x: screenWidth, y: screenHeight })
        },
        {
            chance: 1,
            option: flipX(getRoomD(), { x: screenWidth, y: screenHeight })
        },
        {
            chance: 1,
            option: flipY(getRoomD(), { x: screenWidth, y: screenHeight })
        },
        {
            chance: 1,
            option: flipX(getRoomE(), { x: screenWidth, y: screenHeight })
        },
    ]).map(v2 => ({ pos: v2, type: "block" } as Obstacle))
        .concat(getWalls().map(v2 => ({ pos: v2, type: wallType } as Obstacle)))

}