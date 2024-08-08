import { Bullet, BulletType } from "./types"
import { Vec2 } from './bge'
import { baseSize, bulletSpeed } from "./constants"

export const getNewBullet = (position: Vec2, baseSpeed: Vec2, direction: Vec2, speed: number, type: BulletType, enemy: boolean): Bullet => ({
    pos: Vec2.sum(position, Vec2.mult(direction, baseSize / 2)),
    speed: Vec2.sum(Vec2.mult(direction, speed), baseSpeed),
    type,
    enemy
})

export const randomizeVec2 = (source: Vec2, variation: number) => {

    const angle = Vec2.toAngle(source)

    return Vec2.fromAngle(angle + Math.random() * variation - variation / 2)
}

export const getShotgunBullet = (playerPos: Vec2, playerOffset: Vec2, shootingDirection: Vec2) =>
    getNewBullet(Vec2.sum(playerPos, Vec2.mult(Vec2.fromAngle(Math.random() * Math.PI * 2), baseSize / 4)), playerOffset, randomizeVec2(shootingDirection, .2), bulletSpeed * (Math.random() * .25 + 3), "shotgun", false)