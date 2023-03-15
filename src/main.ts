import 'dotenv/config'
import express from 'express'
import expressWs from 'express-ws'
import path from 'path'
import { handleConnection } from './ws'

const app = express()
const wsInstance = expressWs(app)

wsInstance.app.ws('/ws', (ws, req) => handleConnection(ws, req))

app.use(express.static(path.join(__dirname, 'public')))

const port = Number(process.env.PORT) || 3000

app.listen(port, () => console.log(`listening on ${port}`))