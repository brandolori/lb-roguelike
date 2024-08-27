import { Vec2 } from "./bge"

type BulletType = "normal" | "small" | "big" | "shotgun"

type Bullet = {
    pos: Vec2
    speed: Vec2
    type: BulletType
    enemy: boolean
}

type ObstacleType = "wall1" | "wall2" | "wall3" | "block" | "door"

type Obstacle = {
    pos: Vec2
    type: ObstacleType
}

type EnemyType = "slime" | "fast-slime" | "imp" | "rhino" | "turret"

type Enemy = {
    pos: Vec2
    type: EnemyType
    state: "paused" | "idle" | "shooting" | "moving"
    symbol: symbol
    movementDirection: Vec2
    hurtSymbol: symbol
    hurt: boolean
    health: number
}

type EnemyData = {
    type: EnemyType
    difficulty: number
    constructor: (pos: Vec2) => Enemy
}

type WeaponType = "none" | "big-gun" | "shotgun" | "uzi"

type PlayerState = {
    pos: Vec2
    health: number
    hurt: boolean
    weapon: WeaponType
    weaponHealth: number
    trinkets: TrinketType[]
    pendingTrinket: TrinketType
}

type Drop = {
    pos: Vec2
    type: WeaponType
    trinket: TrinketType
}

type State = {
    playerState: PlayerState
    canShoot: boolean
    bullets: Bullet[]
    enemies: Enemy[]
    obstacles: Obstacle[]
    drops: Drop[]
    levelIndex: number
    roomIndex: number
    bible: number
}

type TrinketType = "explode" | "thorns" | "twins" | "rubber" | "bible" | "passthrough" | "ghost" | "swamp" | "bus" | "selfie" | "boom"