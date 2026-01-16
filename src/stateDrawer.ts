import { BulletType, EnemyType, ObstacleType, State, TrinketType, WeaponType } from "./types"
import { Drawable } from './bge'
import { baseSize, playerColor, enemyColor, hurtColor, dropColor, screenWidth, ghostColor, screenHeight } from "./constants"
import { getBible2Position, getBiblePosition, getGhostPosition } from "./player"

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
        case "glock": return "¥"
    }
}

const getBulletSize = (type: BulletType): number => {
    switch (type) {
        case "big": return 1.5
        case "normal": return 1
        case "small": return 0.75
        case "shotgun": return 0.75
        case "rocket": return .5
        default: return 1
    }
}

const getEnemyChar = (type: EnemyType): string => {
    switch (type) {
        case "slime": return "ç"
        case "fast-slime": return "Ç"
        case "turret": return "¡"
        case "imp": return "#"
        case "rhino": return "§"
        default: return "?"
    }
}

const getTrinketChar = (type: TrinketType): string => {
    switch (type) {
        case "twins": return "👬"
        case "rubber": return "🎈"
        case "bible": return "📕"
        case "bible2": return "📘"
        case "passthrough": return "🪟"
        case "ghost": return "👻"
        case "swamp": return "🐸"
        case "bus": return "🚌"
        case "rocket": return "🚀"
        case "tombstone": return "🪦"
    }
}

export const stateDrawer = (state: State): Drawable[] => {
    if (state.playerState.health == 0) {
        const deathDrawable: Drawable = {
            char: "You are dead.",
            color: "black",
            size: baseSize * 2,
            x: screenWidth / 2,
            y: screenHeight / 2
        }
        return [deathDrawable]
    } else if (state.won) {
        const winDrawable: Drawable = {
            char: "You won!",
            color: "black",
            size: baseSize * 2,
            x: screenWidth / 2,
            y: screenHeight / 2
        }
        return [winDrawable]
    }

    const playerDrawable = {
        ...state.playerState.pos,
        char: getDropSprite(state.playerState.weapon),
        size: baseSize,
        color: state.playerState.hurt ? hurtColor : playerColor
    }

    const bulletDrawables: Drawable[] = state.bullets.map(bu => ({
        char: bu.type == "rocket"
            ? "🚀"
            : bu.enemy ? "✦" : "•",
        color: bu.enemy ? enemyColor : playerColor,
        size: baseSize * getBulletSize(bu.type) * (bu.enemy ? .50 : 1),
        x: bu.pos.x,
        y: bu.enemy
            ? bu.pos.y + baseSize * .25
            : bu.pos.y
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

    const dropDrawables: Drawable[] = state.drops.flatMap((dr): Drawable => ({
        char: getDropSprite(dr.type) + getTrinketChar(dr.trinket),
        color: dropColor,
        size: baseSize / 2,
        ...dr.pos
    }))

    const healthBlocks = Math.round(Math.max(state.playerState.health, 0) / 100 * 8)
    const healthString = "[" + "■".repeat(healthBlocks) + " ".repeat(8 - healthBlocks) + "]"
    const healthDrawable: Drawable = {
        char: healthString,
        color: "#00000080",
        size: baseSize / 5,
        x: state.playerState.pos.x,
        y: state.playerState.pos.y + baseSize * .75
    }

    const weaponHealthBlock = Math.round(Math.max(state.playerState.weaponHealth, 0) / 100 * 8)
    const weaponHealthString = "[" + "■".repeat(weaponHealthBlock) + " ".repeat(8 - weaponHealthBlock) + "]"
    const weaponHealthDrawable: Drawable = {
        char: weaponHealthString,
        color: state.playerState.weapon != "none" ? "#30300080" : "transparent",
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

    const pendingTrinketDrawable: Drawable = {
        char: getTrinketChar(state.playerState.pendingTrinket),
        color: state.playerState.weapon != "none" ? "black" : "transparent",
        size: baseSize * .75 + Math.sin(Date.now() / 125) * baseSize / 12,
        x: screenWidth + baseSize / 2,
        y: (state.playerState.trinkets.length + 0.5) * baseSize
    }

    const bibleDrawable: Drawable = {
        char: getTrinketChar("bible"),
        color: state.playerState.trinkets.includes("bible") ? "black" : "transparent",
        size: baseSize * .75,
        ...getBiblePosition(state.playerState.pos, state.bible)
    }

    const bible2Drawable: Drawable = {
        char: getTrinketChar("bible2"),
        color: state.playerState.trinkets.includes("bible2") ? "black" : "transparent",
        size: baseSize * .75,
        ...getBible2Position(state.playerState.pos, state.bible)
    }

    const ghostDrawable: Drawable = {
        char: getDropSprite(state.playerState.weapon),
        size: baseSize,
        color: state.playerState.trinkets.includes("ghost") ? ghostColor : "transparent",
        ...getGhostPosition(state.playerState.pos),
    }

    const caltropDrawables: Drawable[] = state.caltrops.map(cl => ({
        ...cl.pos,
        char: "▴",
        color: playerColor,
        size: baseSize * .5,
    }))

    const tombstoneDrawables: Drawable[] = state.tombstones.map(ts => ({
        char: getTrinketChar("tombstone"),
        color: "black",
        size: baseSize * .75,
        ...ts.pos
    }))



    return [
        ...dropDrawables,
        ...obstacleDrawable,
        ...caltropDrawables,
        ...enemiesDrawables,
        playerDrawable,
        healthDrawable,
        weaponHealthDrawable,
        ...bulletDrawables,
        ...trinketDrawables,
        ...tombstoneDrawables,
        pendingTrinketDrawable,
        bibleDrawable,
        bible2Drawable,
        ghostDrawable,
    ]
}
