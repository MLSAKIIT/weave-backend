import {createBunWebSocket} from 'hono/bun'
import type { ServerWebSocket } from "bun";

const {upgradeWebSocket, websocket}=createBunWebSocket()


export {upgradeWebSocket, websocket}