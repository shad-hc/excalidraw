import axios from "axios";

type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "circle",
    center: number,
    radius: number
}

export default async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

    let existingShapes: Shape[] = await getExistingShapes(roomId);
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "chat") {
            const parshedShape = message.message;
            existingShapes.push(parshedShape.shape);
            clearCanvas(existingShapes, canvas, ctx);
        }
    }

    // ctx.fillStyle = "rgba(0,0,0)";
    // ctx.fillRect(0,0,canvas.width,canvas.height);

    clearCanvas(existingShapes, canvas, ctx);

    let startX = 0;
    let startY = 0;
    let clicked = false;
    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    })
    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;

        const shape: Shape = {
            type: "rect",
            x: startX,
            y: startY,
            width,
            height
        }
        existingShapes.push(shape);
        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId
        }))
    })

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(startX, startY, width, height);
        }
    })
}



function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0)";

    existingShapes.map((Shape) => {
        if (Shape.type === "rect") {
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(Shape.x, Shape.y, Shape.width, Shape.height);
        }
    })
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get("http://localhost:3001/chats/roomId");
    const messages = res.data.messges;

    const Shapes = messages.map((x: { message: string }) => {
        const ShapeData = JSON.parse(x.message);
        return ShapeData.shape;
    })
    return Shapes;
}

