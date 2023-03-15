export const MAP = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
]

export interface NPC {
    pos: {
        x: number
        y: number
    }
    message: string
}

export const NPCS: NPC[] = [
    {
        pos: {
            x: 0,
            y: 0,
        },
        message: `#H$KJFKDSFH*&SDFHSDFB ${process.env.FLAG1} KJH*SD&F#$@#JKNDSC`
    },
    {
        pos: {
            x: 4.5,
            y: 4.5
        },
        message: `i'm stuck in the void :-( ${process.env.FLAG2}`
    }
]

export const SPAWN = { x: 3, y: 3 }