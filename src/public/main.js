
const ws = new WebSocket(`ws://${location.host}/ws`)

console.log(ws)

const color = color => text => `<span class="${color}">${text}</span>`

const green = color('green')
const blue = color('blue')
const yellow = color('yellow')

let pos = {
    x: 0,
    y: 0
}
let map = []

ws.onopen = _ => {
    const game = document.getElementById('game')
    if(!game) throw new Error('oepsie woepsie de trein is fukkie wukkie')
    const messagebox = document.getElementById('messages')

    let id = null
    let name_ = null
   
    
    let players = []
    let npcs = []

    const messages = []

    const updateScreen = m => {
        map = m
        game.innerHTML = ''
        let y = 0
        for(let row of m) {
            let x = 0
            for(let column of row) {
                let player = players.filter(p =>
                    (p.pos.x === x) && (p.pos.y === y)
                )
                let npc = npcs.filter(n => (n.pos.x === x) && (n.pos.y === y))
                let weAreAtPosition = player.find(p => p.id === id)
                if(weAreAtPosition && npc.length) {
                    game.innerHTML += yellow('@')
                } else if(weAreAtPosition) {
                    game.innerHTML += green('@')
                } else if(npc.length) {
                    game.innerHTML += yellow('&')
                } else if(player.length) {
                    game.innerHTML += blue('*')
                } else {
                    switch(column) {
                        case 0:
                            game.innerHTML += ' '
                            break
                        case 1:
                            game.innerHTML += '.'
                            break
                    }
                }
                
                x++
            }
            y++
            game.innerHTML += '\n'
        }
        messagebox.innerHTML = ''
        if(messages[0]) {
            messagebox.innerHTML += messages[0]
        }
    }
    
    const updatePlayers = u => {
        players = u
    }
    
    const removeMessage = () => {
        if(messages.length) {
            messages.shift()
            updateScreen(map)
        }
        setTimeout(removeMessage, 5000)
    }
    
    const tempMessage = text => {
        console.log(text)
        messages.push(text)
        setTimeout(removeMessage, 5000)
    }

    console.log('open')
    name_ = prompt('enter name:')

    ws.send(JSON.stringify({
        t: 0,
        n: name_
    }))

    ws.onmessage = e => {
        const data = JSON.parse(e.data)
        switch(data.t) {
            case 0: {
                console.error(data.e)
                break
            }
            case 1: {
                players.push({
                    id: data.id,
                    n: data.n,
                    pos: data.pos
                })
                tempMessage(`${data.n} logged in`)
                updateScreen(map)
                break
            }
            case 2: {
                let i = players.findIndex(p => p.id === data.id)
                players = players.splice(i, 1)
                break
            }
            case 3: {
                let i = players.findIndex(p => p.id === data.id)
                players[i].pos = data.to
                updateScreen(map)
                break
            }
            case 4:
                id = data.id
                pos = data.u.find(p => p.id === id).pos
                npcs = data.n
                tempMessage(`welcome, ${name_}!`)
                updatePlayers(data.u)
                updateScreen(data.m)
            break
            case 5:
                tempMessage(data.m)
                updateScreen(map)
            break
        }
    }
}



ws.onclose = _ => {
    game.innerHTML = "[DISCONNECTED]"
}

const move = direction => {
    let p = pos
    switch(direction) {
        case 'up': {
            if(map[pos.y-1][pos.x] === 1) {
                return
            }
            p.y -= 1
            break
        }
        case 'down': {
            if(map[pos.y+1][pos.x] === 1) {
                return
            }
            p.y += 1
            break
        }
        case 'left': {
            if(map[pos.y][pos.x-1] === 1) {
                return
            }
            p.x -= 1
            break
        }
        case 'right': {
            if(map[pos.y][pos.x+1] === 1) {
                return
            }
            p.x += 1
            break
        }
    }
    ws.send(JSON.stringify({
        t: 1,
        to: p,
    }))
}

const talk = () => {
    ws.send(JSON.stringify({
        t: 2
    }))
}

window.onkeydown = e => {
    switch(e.code) {
        case 'ArrowUp': {
            move('up')
            break
        }
        case 'ArrowDown': {
            move('down')
            break
        }
        case 'ArrowLeft': {
            move('left')
            break
        }
        case 'ArrowRight': {
            move('right')
            break
        }
        case 'Space': {
            talk()
        }
    }
}