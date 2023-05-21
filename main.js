import './style.css'
import { init, render, step } from './src/lib.js'
import { FPS } from './src/fps'

document.body.style.zoom = '100%'
init(document.getElementById('canvas'))

let mouseDown = false

let io = {
    mouse: [-1,-1]
}

document.addEventListener("mousemove", (e)=>{
    if(mouseDown) io.mouse = [e.pageX, e.pageY]
})
document.addEventListener("mousedown", (e)=>{
    mouseDown = true
    io.mouse = [e.pageX, e.pageY]
})
document.addEventListener("mouseup", (e)=>{
    mouseDown = false
    io.mouse = [-1,-1]
})
function loop() {
    for (let i = 0; i < 15; i++) step(io)

    render()
    FPS()
    requestAnimationFrame(loop)
}

loop()
