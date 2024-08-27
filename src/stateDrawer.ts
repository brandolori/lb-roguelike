import { BulletType, EnemyType, ObstacleType, State, TrinketType, WeaponType } from "./types"
import { Drawable } from './bge'
import { baseSize, playerColor, enemyColor, hurtColor, dropColor, screenWidth, bibleDistance, ghostColor } from "./constants"
import { getBiblePosition, getGhostPosition } from "./player"

const getObstacleSprite = (type: ObstacleType): string => {
    switch (type) {
        case "wall1": return "▧"
        case "wall2": return "◩"
        case "wall3": return "▩"
        case "block": return "▥"
        case "door": return "▣"
    }
}

const getDropSprite = (type: WeaponType): string => {
    switch (type) {
        case "none": return "@"
        case "big-gun": return "£"
        case "shotgun": return "$"
        case "uzi": return "€"
    }
}

const getBulletSize = (type: BulletType): number => {
    switch (type) {
        case "big": return 1.5
        case "normal": return 1
        case "small": return 0.75
        case "shotgun": return 0.75
        default: return 1 // Valore di default per i tipi non riconosciuti
    }
}


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

const getTrinketChar = (type: TrinketType): string => {
    switch (type) {
        case "explode":
            return "💥"
        case "thorns":
            return "🌹"
        case "mirror":
            return "🪞"
        case "rubber":
            return "🎈"
        case "bible":
            return "📕"
        case "passthrough":
            return "🪟"
        case "ghost":
            return "👻"
        case "swamp":
            return "🐸"
        case "bus":
            return "🚌"
        case "selfie":
            return "📷"
        case "boom":
            return "💣"
    }
}

export const stateDrawer = (state: State): Drawable[] => {
    const playerDrawable = {
        ...state.playerState.pos,
        char: getDropSprite(state.playerState.weapon),
        size: baseSize,
        color: state.playerState.hurt ? hurtColor : playerColor
    }

    const bulletDrawables: Drawable[] = state.bullets.map(bu => ({
        char: "•",
        color: bu.enemy ? enemyColor : playerColor,
        size: baseSize * getBulletSize(bu.type),
        ...bu.pos
    }))

    const enemiesDrawables: Drawable[] = state.enemies.map(en => ({
        char: getEnemyChar(en.type),
        color: en.hurt ? hurtColor : enemyColor,
        size: baseSize,
        ...en.pos
    }))

    const obstacleDrawable: Drawable[] = state.obstacles.map(os => ({
        char: getObstacleSprite(os.type),
        color: playerColor,
        size: baseSize,
        ...os.pos
    }))

    const dropDrawables: Drawable[] = state.drops.flatMap((dr): Drawable[] => ([
        // {
        //     char: getTrinketChar(dr.trinket),
        //     ...dr.pos,
        //     size: baseSize,
        //     color: dropColor
        // }, 
        {
            char: getDropSprite(dr.type) + getTrinketChar(dr.trinket),
            color: dropColor,
            size: baseSize / 2,
            ...dr.pos
        }
    ]))

    const healthBlocks = Math.round(state.playerState.health / 100 * 8)
    const healthString = "[" + "■".repeat(healthBlocks) + " ".repeat(8 - healthBlocks) + "]"
    const healthDrawable: Drawable = {
        char: healthString,
        color: "#00000080",
        size: baseSize / 5,
        x: state.playerState.pos.x,
        y: state.playerState.pos.y + baseSize * .75
    }

    const weaponHealthBlock = Math.round(state.playerState.weaponHealth / 100 * 8)
    const weaponHealthString = "[" + "■".repeat(weaponHealthBlock) + " ".repeat(8 - weaponHealthBlock) + "]"
    const weaponHealthDrawable: Drawable = {
        char: weaponHealthString,
        color: state.playerState.weapon != "none" ? "#30300080" : "#00000000",
        size: baseSize / 5,
        x: state.playerState.pos.x,
        y: state.playerState.pos.y + baseSize
    }

    const trinketDrawables: Drawable[] = state.playerState.trinkets.map((tr, i) => ({
        char: getTrinketChar(tr),
        color: "black",
        size: baseSize * .75,
        x: screenWidth + baseSize / 2,
        y: (i + 0.5) * baseSize
    }))

    const bibleDrawable: Drawable = {
        char: getTrinketChar("bible"),
        color: state.playerState.trinkets.includes("bible") ? "black" : "#00000000",
        size: baseSize * .75,
        ...getBiblePosition(state.playerState.pos, state.bible)
    }

    const ghostDrawable: Drawable = {
        char: getDropSprite(state.playerState.weapon),
        size: baseSize,
        color: state.playerState.trinkets.includes("ghost") ? ghostColor : "#00000000",
        ...getGhostPosition(state.playerState.pos),
    }

    return [
        ...dropDrawables,
        ...obstacleDrawable,
        ...enemiesDrawables,
        playerDrawable,
        healthDrawable,
        weaponHealthDrawable,
        ...bulletDrawables,
        ...trinketDrawables,
        bibleDrawable,
        ghostDrawable
    ]
}
