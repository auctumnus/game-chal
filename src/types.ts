export const enum ClientMessageTypes {
    LogIn,
    Movement,
    Talk
}

export interface ClientLogInMessage {
    t: ClientMessageTypes.LogIn,
    n: string
}

export interface ClientMovementMessage {
    t: ClientMessageTypes.Movement
    to: {
        x: number
        y: number
    }
}

export interface ClientTalkMessage {
    t: ClientTalkMessage
}

export type ClientMessage = ClientLogInMessage | ClientMovementMessage | ClientTalkMessage

export const enum ServerMessageTypes {
    Error,
    LogIn,
    LogOut,
    Movement,
    GameState,
    TalkReply
}

export interface ServerErrorMessage {
    t: ServerMessageTypes.Error
    e: string
}

export interface ServerMovementMessage {
    t: ServerMessageTypes.Movement
    id: string
    to: {
        x: number
        y: number
    }
}

export interface ServerGameStateMessage {
    t: ServerMessageTypes.GameState
    id: string
    u: {
        id: string
        n: string
        pos: {
            x: number
            y: number
        }
    }[],
    n: {
        pos: {
            x: number
            y: number
        }
    }[]
    m: number[][]
}

export interface ServerLogInMessage {
    t: ServerMessageTypes.LogIn
    id: string
    n: string
    pos: {
        x: number
        y: number
    }
}

export interface ServerLogOutMessage {
    t: ServerMessageTypes.LogOut
    id: string
    n: string
}

export interface ServerTalkReplyMessage {
    t: ServerMessageTypes.TalkReply
    m: string
}

export type ServerMessage = ServerErrorMessage | ServerMovementMessage | ServerLogInMessage | ServerLogOutMessage | ServerGameStateMessage | ServerTalkReplyMessage