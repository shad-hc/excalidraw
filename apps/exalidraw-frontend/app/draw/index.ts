import axios from "axios";

type shape = {
    type : "rect",
    x : number,
    y : number,
    width : number,
    height : number
} | {
    type : "circle",
    center : number,
    radius : number
}

export default function initDraw(canvas : HTMLCanvasElement){
        const ctx = canvas.getContext("2d");

        if(!ctx){
            return;
        }

        ctx.fillStyle = "rgba(0,0,0)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        let existingShapes : shape[] = [];

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

                existingShapes.push({
                    type : "rect",
                    x: startX,
                    y: startY,
                    width,
                    height
                })
                clearCanvas(existingShapes,canvas,ctx);
            })

        canvas.addEventListener("mousemove",(e) => {
                if(clicked){
                 const width = e.clientX - startX;
                 const height = e.clientY - startY;
                 ctx.strokeStyle = "rgba(255,255,255)";
                 ctx.strokeRect(startX,startY,width,height);
                }
            })
        }
    


function clearCanvas(existingShapes :shape[],canvas : HTMLCanvasElement,ctx :CanvasRenderingContext2D){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "rgba(0,0,0)";

    existingShapes.map((shape) => {
        if(shape.type === "rect"){
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);
        }
    })
}

// async function getExistingShapes(roomId : string){
//    const res = await axios.get("http;//localhost;3001");
//    const messges = res.data.messges;

//    const shapes = messages.map
// }

