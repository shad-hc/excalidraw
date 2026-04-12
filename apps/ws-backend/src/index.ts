import { WebSocketServer} from "ws";
import jwt from "jsonwebtoken"

const wss = new WebSocketServer({port : 8080});

wss.on("connection",function(ws,request){
    const url = request.url;
    ws.on("message",() => {
        ws.send('pong')
    })
})