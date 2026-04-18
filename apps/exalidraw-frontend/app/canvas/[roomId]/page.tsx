"use client"

import { useEffect, useRef } from "react";
import initDraw from "@/app/draw";
export default function canavs() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if(canvasRef.current){
            const canvas = canvasRef.current;
            initDraw(canvas);
        }
    }, [canvasRef]);
    return <div>
        <canvas ref={canvasRef} width={2000} height={1000}></canvas>
    </div>
}