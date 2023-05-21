import './style.css'
import { init, render, step } from './src/lib.js'
import { FPS } from './src/fps'
init(document.getElementById('canvas'))

function loop() {
    step();
    render()
    FPS()
    requestAnimationFrame(loop)
}

loop()
