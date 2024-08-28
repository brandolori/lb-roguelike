import { Bullet, BulletType, WeaponType } from "./types"
import { Vec2 } from './bge'
import { baseSize, bibleDistance, bulletSpeed, screenHeight, screenWidth } from "./constants"

export const getNewBullet = (position: Vec2, baseSpeed: Vec2, direction: Vec2, speed: number, type: BulletType, enemy: boolean): Bullet => ({
    pos: Vec2.sum(position, Vec2.mult(direction, baseSize / 2)),
    speed: Vec2.sum(Vec2.mult(direction, speed), baseSpeed),
    type,
    enemy,
    bounces: 0
})

export const randomizeVec2 = (source: Vec2, variation: number) => {

    const angle = Vec2.toAngle(source)

    return Vec2.fromAngle(angle + Math.random() * variation - variation / 2)
}

export const getShotgunBullet = (playerPos: Vec2, playerOffset: Vec2, shootingDirection: Vec2) =>
    getNewBullet(Vec2.sum(playerPos, Vec2.mult(Vec2.fromAngle(Math.random() * Math.PI * 2), baseSize / 4)), playerOffset, randomizeVec2(shootingDirection, .2), bulletSpeed * (Math.random() * .25 + 3), "shotgun", false)

export const getDamageFromBulletType = (type: BulletType) => {
    switch (type) {
        case "normal":
            return 1
        case "small":
            return .5
        case "big":
            return 2
        case "shotgun":
            return 1
    }
}

export const getBiblePosition = (playerPos: Vec2, bibleAngle: number): Vec2 => ({
    x: playerPos.x + Math.cos(bibleAngle) * bibleDistance,
    y: playerPos.y + Math.sin(bibleAngle) * bibleDistance,
})

export const getShootingCooldownFromGun = (type: WeaponType) => {
    switch (type) {
        case "none":
            return .3
        case "big-gun":
            return .2
        case "shotgun":
            return .75
        case "uzi":
            return .1
    }
}

export const getGhostPosition = (playerPos: Vec2): Vec2 => ({
    x: screenWidth - playerPos.x,
    y: screenHeight - playerPos.y
})