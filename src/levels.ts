import { baseSize, screenHeight, screenWidth, playerStartPos } from "./constants"
import { getRandomEnemies } from "./enemies"
import { getRandomDrop } from "./player"
import { getRandomRoom, getWalls } from "./rooms"
import { EnemyType, ObstacleType, PlayerState, State } from "./types"

const levels: { walls: ObstacleType; enemyTypes: EnemyType[]; name: string, difficulties: number[] }[] = [
    {
        name: "Level 1",
        walls: "wall1",
        enemyTypes: ["slime", "imp"],
        difficulties: [5, 6, 7, 8, 9],
    },
    {
        name: "Level 2",
        walls: "wall2",
        enemyTypes: ["fast-slime", "turret", "imp"],
        difficulties: [10, 11, 12, 13, 14],
    },
    {
        name: "Level 3",
        walls: "wall3",
        enemyTypes: ["fast-slime", "turret", "imp", "rhino"],
        difficulties: [15, 16, 17, 18, 19],
    },
]

export const generateRoom = (roomIndex: number, levelIndex: number, playerState: PlayerState) => {
    const levelData = levels[levelIndex]

    const newRoom = levelData ? getRandomRoom(levelData.walls) : []

    const initialState: State = {
        playerState: {
            ...playerState,
            pos: playerStartPos
        },
        canShoot: true,
        bullets: [],
        enemies: levelData ? getRandomEnemies(playerStartPos, newRoom.map(os => os.pos), levelData.enemyTypes, levelData.difficulties[roomIndex]) : [],
        obstacles: newRoom,
        drops: [],
        roomIndex: roomIndex,
        levelIndex: levelIndex,
        bible: 0,
        caltrops: [],
        tombstones: [],
        won: !levelData
    }

    return initialState
}

export const getStartState = (playerState: PlayerState) => {
    const levelData = levels[0]

    const newRoom = getWalls(levelData.walls)

    const initialState: State = {
        playerState: {
            ...playerState,
            pos: playerStartPos
        },
        canShoot: true,
        bullets: [],
        enemies: [],
        obstacles: newRoom,
        drops: [...Array(3).keys()].map((_, i) => getRandomDrop({ x: screenWidth / 2 + (i - 1) * baseSize * 3, y: screenHeight / 2 })),
        roomIndex: -1,
        levelIndex: 0,
        bible: 0,
        caltrops: [],
        tombstones: [],
        won: false
    }

    return initialState
}