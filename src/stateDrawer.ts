import { BulletType, EnemyType, ObstacleType, State, WeaponType } from "./types"
import { Drawable } from './bge'
import { baseSize, playerColor, enemyColor, hurtColor, dropColor } from "./constants"

const obstacleSprites: Map<ObstacleType, string> = new Map([
    ["wall1", "▧"],
    ["wall2", "◩"],
    ["wall3", "▩"],
    ["block", "▥"],
    ["door", "▣"]
])

const dropSprites: Map<WeaponType, string> = new Map([
    ["none", "@"],
    ["big-gun", "#"],
    ["shotgun", "$"],
    ["uzi", "&"],
])

const getEnemyChar = (type: EnemyType): string => {
    switch (type) {
        case "slime": return "ç"
        case "fast-slime": return "Ç"
        case "turret": return "¡"
        case "imp": return "£"
        case "rhino": return "§"
        default: return "?"
    }
}

const bulletSizeMap: Map<BulletType, number> = new Map([
    ["big", 1.5],
    ["normal", 1],
    ["small", .75],
    ["shotgun", .75]
])

export const stateDrawer = (state: State): Drawable[] => {
    const playerDrawable = {
        ...state.playerState.pos,
        char: '@',
        size: baseSize,
        color: state.playerState.hurt ? hurtColor : playerColor
    }

    const bulletDrawables: Drawable[] = state.bullets.map(bu => ({
        char: "•",
        color: bu.enemy ? enemyColor : playerColor,
        size: baseSize * bulletSizeMap.get(bu.type),
        ...bu.pos
    }))

    const enemiesDrawables: Drawable[] = state.enemies.map(en => ({
        char: getEnemyChar(en.type),
        color: en.hurt ? hurtColor : enemyColor,
        size: baseSize,
        ...en.pos
    }))

    const obstacleDrawable: Drawable[] = state.obstacles.map(os => ({
        char: obstacleSprites.get(os.type),
        color: playerColor,
        size: baseSize,
        ...os.pos
    }))

    const dropDrawables: Drawable[] = state.drops.map(dr => ({
        char: dropSprites.get(dr.type),
        color: dropColor,
        size: baseSize,
        ...dr.pos
    }))

    const healthBlocks = state.playerState.health / 100 * 8

    const healthString = "[" + "■".repeat(healthBlocks) + " ".repeat(8 - healthBlocks) + "]"

    const healthDrawable: Drawable = {
        char: healthString,
        color: "#00000080",
        size: baseSize / 5,
        x: state.playerState.pos.x,
        y: state.playerState.pos.y + baseSize * .75
    }

    return [
        playerDrawable,
        ...bulletDrawables,
        ...enemiesDrawables,
        ...obstacleDrawable,
        ...dropDrawables,
        healthDrawable,
    ]
}
