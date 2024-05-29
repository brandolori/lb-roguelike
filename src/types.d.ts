import { Vector2 } from "./bge"

export type Bullet = {
    position: Vector2
    speed: Vector2
}
type EnemyType = "slime"

type Enemy = {
    pos: Vector2
    type: EnemyType
}
export type State = {
    playerPos: Vector2
    canShoot: boolean
    bullets: Bullet[]
    enemies: Enemy[]
}
