import { Vec2 } from "./bge"
import { EnemyType } from "./types"

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

const getRandomEnemies = (playerPos: Vec2, obstacles: Vec2[]) => {




}