import { Vec2 } from "./bge"

type BulletType = "normal" | "small" | "big"

type Bullet = {
    pos: Vec2
    speed: Vec2
    type: BulletType
    enemy: boolean
}

type Obstacle = {
    pos: Vec2
    type: "wall" | "block"
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
type State = {
    playerPos: Vec2
    canShoot: boolean
    bullets: Bullet[]
    enemies: Enemy[]
    obstacles: Obstacle[]
}
