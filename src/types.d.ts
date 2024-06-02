import { Vec2 } from "./bge"

type BulletType = "normal" | "small" | "big"

type Bullet = {
    pos: Vec2
    speed: Vec2
    type: BulletType
    enemy: boolean
}
type EnemyType = "slime" | "fast-slime" | "imp" | "rhino" | "turret"

type Obstacle = {
    pos: Vec2
    type: number
}

type Enemy = {
    pos: Vec2
    type: EnemyType
    state: string
}
type State = {
    playerPos: Vec2
    canShoot: boolean
    bullets: Bullet[]
    enemies: Enemy[]
    obstacles: Obstacle[]
}
