import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"
import {prismaClient} from "@repo/db/client"

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket,
    rooms: String[],
    userId: String
}

const users: User[] = [];

function checkUser(token: string): string | null {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string") {
        return null;
    }
    if (!decoded || !decoded.userId) {
        return null
    }
    return decoded.userId;
}

wss.on("connection", function (ws, request) {
    const url = request.url;
    if (!url) {
        return
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);

    if (!userId) {
        ws.close();
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws
    })
    ws.on("message", async(data) => {
        const parsedData = JSON.parse(data as unknown as string);
        if (parsedData.type == "join_room") {
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        if (parsedData.type === "leave_room") {
            const user = users.find(x => x.ws === ws);
            if (!user) {
                ws.close();
                return;
            }
            user.rooms = user.rooms.filter(x => x === parsedData.roomId);
        }
        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type : "chat",
                        message : message,
                        userId
                    }))
                }
            })
        }

    })
}
)