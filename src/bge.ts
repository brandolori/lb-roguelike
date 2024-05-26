type StateUpdater<T> = (state: T, input: Set<string>, deltaTime: number) => T
type StateDrawer<T> = (state: T) => Drawable[]

export const init = <T>(initialState: T, stateUpdater: StateUpdater<T>, stateDrawer: StateDrawer<T>) => {

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    const pressedKeys = new Set<string>();

    const keyboardDict = {
        "w": "move-up",
        "a": "move-left",
        "s": "move-down",
        "d": "move-right",
        "ArrowLeft": "shoot-left",
        "ArrowUp": "shoot-up",
        "ArrowDown": "shoot-down",
        "ArrowRight": "shoot-right",
    };

    function keyDownHandler(event: KeyboardEvent) {
        if (event.key in keyboardDict) {
            pressedKeys.add(keyboardDict[event.key]);
        }
    }

    function keyUpHandler(event: KeyboardEvent) {
        if (event.key in keyboardDict) {
            pressedKeys.delete(keyboardDict[event.key]);
        }
    }

    const canvas = document.getElementById('bge-canvas')! as HTMLCanvasElement;
    canvas.width = 640;
    canvas.height = 360;

    let state = initialState;

    let previousTimeStamp: number;

    const draw: FrameRequestCallback = (timeStamp) => {

        if (previousTimeStamp === undefined) {
            previousTimeStamp = timeStamp;
        }
        const elapsed = (timeStamp - previousTimeStamp) / 1000;
        previousTimeStamp = timeStamp

        state = stateUpdater(state, pressedKeys, elapsed);

        const drawables = stateDrawer(state);

        drawCharactersOnCanvas(canvas, drawables);

        requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
};

const drawCharactersOnCanvas = (canvas: HTMLCanvasElement, drawables: Drawable[]) => {
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawables.forEach(obj => {
        const { x, y, char, size, color } = obj;

        // Imposta il colore del testo
        ctx.fillStyle = color;

        // Imposta la dimensione del carattere e il font monospaziato
        ctx.font = `${size}px monospace`;

        // Misura la larghezza del carattere
        const textMetrics = ctx.measureText(char);
        const textWidth = textMetrics.width;

        // Approssimazione dell'altezza del carattere
        const textHeight = size; // Un'approssimazione dell'altezza del testo


        // Calcola le coordinate in modo che il punto (x, y) sia al centro del carattere
        const centeredX = x - textWidth / 2;
        const centeredY = y + textHeight / 2;

        // Disegna il carattere alla posizione centrata
        ctx.fillText(char, Math.round(centeredX), Math.round(centeredY));
    });
};

export const Vector2 = {
    sum: (a: Vector2, b: Vector2): Vector2 => ({ x: a.x + b.x, y: a.y + b.y }),
    mult: (a: Vector2, m: number): Vector2 => ({ x: a.x * m, y: a.y * m }),
    right: { x: 1, y: 0 } as Vector2,
    left: { x: -1, y: 0 } as Vector2,
    up: { x: 0, y: -1 } as Vector2,
    down: { x: 0, y: 1 } as Vector2,
}

export type Drawable = {
    x: number;
    y: number;
    char: string;
    size: number;
    color: string;
};
export type Vector2 = {
    x: number;
    y: number;
};

