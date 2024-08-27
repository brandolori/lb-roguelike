import { startPos } from "./constants"
import { getRandomEnemies } from "./enemies"
import { getRandomRoom } from "./rooms"
import { EnemyType, ObstacleType, PlayerState, State } from "./types"

const levels: { walls: ObstacleType; enemyTypes: EnemyType[]; name: string, difficulties: number[] }[] = [
    {
        name: "Level 1",
        walls: "wall1",
        enemyTypes: ["slime", "turret"],
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

    const newRoom = getRandomRoom(levelData.walls)

    const initialState: State = {
        playerState: {
            ...playerState,
            pos: startPos
        },
        canShoot: true,
        bullets: [],
        enemies: getRandomEnemies(startPos, newRoom.map(os => os.pos), levelData.enemyTypes, levelData.difficulties[roomIndex]),
        obstacles: newRoom,
        drops: [],
        roomIndex: roomIndex,
        levelIndex: levelIndex,
        bible: 0
    }

    return initialState
}