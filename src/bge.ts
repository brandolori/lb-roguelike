export type TimerRequest = { id: string | symbol, time: number }
export type StateUpdater<T> = (state: T, events: Set<string | symbol>, deltaTime: number) => { timers: TimerRequest[], state: T }
export type StateDrawer<T> = (state: T) => Drawable[]

export type GameContext = {
    requestTimer: (id: string, time: number) => void
}

export const pick = <T>(data: T[]) => {
    const randomIndex = Math.floor(Math.random() * data.length)
    const item = data[randomIndex]

    return item
}

export const init = <T>(canvas: HTMLCanvasElement, initialState: T, stateUpdater: StateUpdater<T>, stateDrawer: StateDrawer<T>, startingEvents: TimerRequest[]) => {

    document.addEventListener("keydown", keyDownHandler, false)
    document.addEventListener("keyup", keyUpHandler, false)

    const events = new Set<string | symbol>()
    const inputs = new Set<string | symbol>()

    const keyboardDict = {
        "w": "move-up",
        "a": "move-left",
        "s": "move-down",
        "d": "move-right",
        "ArrowLeft": "shoot-left",
        "ArrowUp": "shoot-up",
        "ArrowDown": "shoot-down",
        "ArrowRight": "shoot-right",
    }

    function keyDownHandler(event: KeyboardEvent) {
        if (event.key in keyboardDict) {
            inputs.add(keyboardDict[event.key])
        }
    }

    function keyUpHandler(event: KeyboardEvent) {
        if (event.key in keyboardDict) {
            inputs.delete(keyboardDict[event.key])
        }
    }

    let state = initialState

    let previousTimeStamp: number

    const requestTimer = (id: string | symbol, time: number) => {
        setTimeout(() => {
            events.add(id)
        }, time * 1000)
    }

    startingEvents.forEach(e => requestTimer(e.id, e.time))

    const draw: FrameRequestCallback = (timeStamp) => {

        if (previousTimeStamp === undefined) {
            previousTimeStamp = timeStamp
        }
        const elapsed = (timeStamp - previousTimeStamp) / 1000
        previousTimeStamp = timeStamp

        inputs.forEach(ip => events.add(ip))
        const { timers, state: newState } = stateUpdater(state, events, elapsed)
        events.clear()

        state = newState
        timers.forEach(tm => requestTimer(tm.id, tm.time))

        const drawables = stateDrawer(state)

        drawCharactersOnCanvas(canvas, drawables)

        requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
}

const drawCharactersOnCanvas = (canvas: HTMLCanvasElement, drawables: Drawable[]) => {
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawables.forEach(obj => {
        const { x, y, char, size, color } = obj

        // Imposta il colore del testo
        ctx.fillStyle = color

        // Imposta la dimensione del carattere e il font monospaziato
        ctx.font = `bold ${size}px courier new`

        // Misura la larghezza del carattere
        const textMetrics = ctx.measureText(char)
        const textWidth = textMetrics.width

        // Approssimazione dell'altezza del carattere
        const textHeight = size // Un'approssimazione dell'altezza del testo

        // Calcola le coordinate in modo che il punto (x, y) sia al centro del carattere
        const centeredX = x - textWidth / 2
        const centeredY = y + textHeight / 2

        // Disegna il carattere alla posizione centrata
        ctx.fillText(char, centeredX, centeredY)
    })
}

export const Vec2 = {
    sum: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),
    mult: (a: Vec2, m: number): Vec2 => ({ x: a.x * m, y: a.y * m }),
    sub: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),
    normalize: (v: Vec2): Vec2 => {
        const length = Math.sqrt(v.x * v.x + v.y * v.y)
        return length === 0 ? { x: 0, y: 0 } : { x: v.x / length, y: v.y / length }
    },
    distance: (a: Vec2, b: Vec2): number => {
        const dx = b.x - a.x
        const dy = b.y - a.y
        return Math.sqrt(dx * dx + dy * dy)
    },
    squareCollision: (a: Vec2, b: Vec2, side: number) => Math.abs(a.x - b.x) <= side / 2 && Math.abs(a.y - b.y) <= side / 2,
    right: { x: 1, y: 0 } as Vec2,
    left: { x: -1, y: 0 } as Vec2,
    up: { x: 0, y: -1 } as Vec2,
    down: { x: 0, y: 1 } as Vec2,
    zero: { x: 0, y: 0 } as Vec2,
    fromAngle: (amplitude: number): Vec2 => ({ x: Math.cos(amplitude), y: Math.sin(amplitude) }),
    toAngle: (vec: Vec2): number => Math.atan2(vec.y, vec.x),
    random: (l: number) => Vec2.mult(Vec2.fromAngle(Math.random() * Math.PI * 2), l)
}

export type Drawable = {
    x: number
    y: number
    char: string
    size: number
    color: string
}
export type Vec2 = {
    x: number
    y: number
};

