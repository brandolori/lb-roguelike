import { Vector2 } from "./bge"

type BulletType = "normal" | "small" | "big"

type Bullet = {
    pos: Vector2
    speed: Vector2
    type: BulletType
    enemy: boolean
}
type EnemyType = "slime" | "fast-slime" | "imp" | "rhino" | "turret"

type Enemy = {
    pos: Vector2
    type: EnemyType
}
type State = {
    playerPos: Vector2
    canShoot: boolean
    bullets: Bullet[]
    enemies: Enemy[]
}
