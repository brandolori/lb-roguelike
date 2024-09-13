import { Vec2 } from "./bge"

type BulletType = "normal" | "small" | "big" | "shotgun" | "rocket"

type Bullet = {
    pos: Vec2
    speed: Vec2
    type: BulletType
    enemy: boolean
    lifetime: number
}

type Caltrop = {
    pos: Vec2
    age: number
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

type WeaponType = "none" | "big-gun" | "shotgun" | "uzi" | "glock"

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

type Tombstone = {
    pos: Vec2
    lifetime: number
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
    caltrops: Caltrop[]
    tombstones: Tombstone[]
    won: boolean
}

type TrinketType =
    "twins" |
    "rubber" |
    "bible" |
    "passthrough" |
    "ghost" |
    "swamp" |
    "bus" |
    "bible2" |
    "rocket" |
    "tombstone"