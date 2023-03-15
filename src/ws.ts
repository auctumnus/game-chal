import { RawData, WebSocket, WebSocketServer } from "ws";
import { ClientMessage, ClientMessageTypes, ClientLogInMessage, ClientMovementMessage, ServerMessage, ServerMessageTypes, ClientTalkMessage } from "./types";
import { nanoid } from 'nanoid'
import { MAP, NPCS, SPAWN } from "./map";
import { Request } from "express";

const enum ConnectionStatus {
    Unconfirmed,
    LoggedIn
}

interface UnconfirmedConnection {
    ws: WebSocket
    id: string
    status: ConnectionStatus.Unconfirmed
}

interface LoggedInConnection {
    ws: WebSocket
    id: string
    status: ConnectionStatus.LoggedIn
    name: string
    pos: {
        x: number
        y: number
    }
}

type Connection = UnconfirmedConnection | LoggedInConnection

const connections: Record<string, Connection> = {}

/**
 * Validate a message from the client.
 * @param message The json-parsed message from the client.
 * @returns [null, string] with the string being an error on an error,
 * or [message, null] with the successfully validated message.
 */
const validateClientMessage = (message: any): [null, string] | [ClientMessage, null] => {
    // i love dry code
    let invalid: [null, string] = [null, 'invalid message']
    if(!('t' in message)) {
        return invalid
    }
    if(typeof message.t !== "number") {
        return invalid
    }
    
    if(message.t === ClientMessageTypes.LogIn) {
        if(!('n' in message)) {
            return invalid
        }
        if(typeof message.n !== 'string') {
            return invalid
        }
        return [message as ClientLogInMessage, null]
    } else if(message.t === ClientMessageTypes.Movement) {
        if(!('to' in message)) {
            return invalid
        }
        if(typeof message.to !== 'object') {
            return invalid
        }
        if(!('x' in message.to && 'y' in message.to)) {
            return invalid
        }
        if(typeof message.to.x !== 'number' || typeof message.to.y !== 'number') {
            return invalid
        }
        return [message as ClientMovementMessage, null]
    } else if(message.t === ClientMessageTypes.Talk) {
        return [message as ClientTalkMessage, null]
    }
    
    return [null, 'unrecognized message type']
}

/**
 * Generate an error.
 * @param message The error message to include.
 * @returns Formatted JSON error.
 */
const error = (message: string) => JSON.stringify({
    t: ServerMessageTypes.Error,
    e: message
})


const make = (message: ServerMessage) => JSON.stringify(message)

/**
 * Broadcast a message to all clients.
 * @param message The message to send.
 */
let broadcast = (message: ServerMessage, except?: string) => {
    Object.values(connections).forEach(c => {
        if(!except || (except !== c.id)) {
            c.ws.send(make(message))
        }
    })
}


/**
 * Handle a connection.
 * @param ws 
 */
export const handleConnection = (ws: WebSocket, req: Request) => {
    const ip = req.ip
    const id = nanoid()
    connections[id] = {
        ws,
        id,
        status: ConnectionStatus.Unconfirmed
    }
    
    ws.on('message', (message) => {
        let m: any
        try {
            m = JSON.parse(message.toString())
        } catch(_) {
            ws.send(error('invalid json'))
            return void 0
        }

        const [msg, err] = validateClientMessage(m)

        if(err) {
            ws.send(error(err))
            return void 0
        }

        const user = connections[id]
        
        switch(msg?.t) {
            case(ClientMessageTypes.LogIn): {
                const { n: name } = msg
                console.log(`user has logged in with name "${name}" and ip ${ip}`)
                connections[id].status = ConnectionStatus.LoggedIn
                ;(connections[id] as LoggedInConnection).name = name
                ;(connections[id] as LoggedInConnection).pos = SPAWN
                broadcast({
                    t: ServerMessageTypes.LogIn,
                    id,
                    n: name,
                    pos: SPAWN
                }, id)
                ws.send(make({
                    t: ServerMessageTypes.GameState,
                    id,
                    u: (Object.values(connections).filter(c => c.status === ConnectionStatus.LoggedIn) as LoggedInConnection[])
                        .map(c => ({ id: c.id, n: c.name, pos: c.pos })),
                    m: MAP,
                    n: NPCS.map(n => ({pos: n.pos}))
                }))
                break
            }
            case(ClientMessageTypes.Movement): {
                if(user.status !== ConnectionStatus.LoggedIn) {
                    ws.send(error('not logged in'))
                } else {
                    // @ts-ignore
                    connections[id].pos = msg.to
                    broadcast({
                        t: ServerMessageTypes.Movement,
                        id,
                        to: msg.to
                    })
                }
                break
            }
            case(ClientMessageTypes.Talk): {
                if(user.status !== ConnectionStatus.LoggedIn) {
                    ws.send(error('not logged in'))
                } else {
                    const npc = NPCS.find(n => n.pos.x === user.pos.x && n.pos.y === user.pos.y)
                    if(!npc) {
                        ws.send(make({
                            t: ServerMessageTypes.TalkReply,
                            m: "there's nobody there"
                        }))
                    } else {
                        ws.send(make({
                            t: ServerMessageTypes.TalkReply,
                            m: npc.message
                        }))
                    }
                }
                break
            }
            case(null): {
                ws.send(error('invalid message'))
                break
            }
        }
    })

    ws.on('close', () => {
        let user = connections[id]
        if(user.status === ConnectionStatus.LoggedIn) {
            broadcast({
                t: ServerMessageTypes.LogOut,
                id,
                n: user.name
            })
        }
        delete connections[id]
    })
}