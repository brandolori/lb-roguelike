import { Vec2 } from "./bge"
import { screenHeight, baseSize, screenWidth } from "./constants"
import { getWithRandomChance } from "./getWithRandomChance"
import { Obstacle } from "./types"


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

const generateSequence = (length: number) => Array.from({ length: length }, (_, index) => index)


const wall1 = generateSequence(screenHeight / baseSize).map(nm => ({ x: baseSize / 2, y: nm * baseSize + baseSize / 2 }))
const wall2 = generateSequence(screenHeight / baseSize).map(nm => ({ x: screenWidth - baseSize / 2, y: nm * baseSize + baseSize / 2 }))
const wall3 = generateSequence(screenWidth / baseSize).map(nm => ({ y: baseSize / 2, x: nm * baseSize + baseSize / 2 }))
const wall4 = generateSequence(screenWidth / baseSize).map(nm => ({ y: screenHeight - baseSize / 2, x: nm * baseSize + baseSize / 2 }))

const upperLeft = getVec2sInTriangle({ x: 3, y: 3 }, { x: 5, y: 5 }, { x: 3, y: 5 }).map(v2 => Vec2.mult(v2, baseSize))
const upperRight = getVec2sInTriangle({ x: 23, y: 3 }, { x: 21, y: 5 }, { x: 23, y: 5 }).map(v2 => Vec2.mult(v2, baseSize))
const lowerLeft = getVec2sInTriangle({ x: 3, y: 12 }, { x: 5, y: 10 }, { x: 3, y: 10 }).map(v2 => Vec2.mult(v2, baseSize))
const loweRight = getVec2sInTriangle({ x: 23, y: 12 }, { x: 21, y: 10 }, { x: 23, y: 10 }).map(v2 => Vec2.mult(v2, baseSize))

const roomA = [...upperLeft, ...upperRight, ...lowerLeft, ...loweRight, ...wall1, ...wall2, ...wall3, ...wall4]

export const getRandomRoom = (): Obstacle[] => {
    return getWithRandomChance<Vec2[]>([{
        chance: 1,
        option: roomA
    }])
        .map(v2 => ({ pos: v2, type: 0 }))
}