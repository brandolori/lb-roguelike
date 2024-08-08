import { State } from "./types"
import { Drawable } from './bge'
import { getEnemyChar } from "./enemies"
import { baseSize, playerColor, enemyColor, hurtColor } from "./constants"

export const stateDrawer = (state: State): Drawable[] => {
    const playerDrawable = {
        ...state.playerPos,
        char: '@',
        size: baseSize,
        color: playerColor
    }

    const bulletDrawables: Drawable[] = state.bullets.map(bu => ({
        char: "•",
        color: bu.enemy ? enemyColor : playerColor,
        size: baseSize,
        ...bu.pos
    }))

    const enemiesDrawables: Drawable[] = state.enemies.map(en => ({
        char: getEnemyChar(en.type),
        color: en.hurt ? hurtColor : enemyColor,
        size: baseSize,
        ...en.pos
    }))

    const obstacleDrawable: Drawable[] = state.obstacles.map(os => ({
        char: os.type == "wall" ? "▧" : "▥",
        color: playerColor,
        size: baseSize,
        ...os.pos
    }))

    return [
        playerDrawable,
        ...bulletDrawables,
        ...enemiesDrawables,
        ...obstacleDrawable
    ]
}
