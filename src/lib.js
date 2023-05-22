import { GPU } from 'gpu.js'
import { initKernels } from './kernels'

const PARTICLE_COUNT = 500

const CANVAS_SIZE = 1500
const VISIBLE_SIZE = 5
// const BLOCKS_COUNT = 16

// const BLOCK_SIZE = Math.floor(CANVAS_SIZE / BLOCKS_COUNT) // 50

// //assert
// if (BLOCKS_COUNT * BLOCK_SIZE != CANVAS_SIZE) {
//     throw new Error('CANVAS_SIZE and BLOCKS_COUNT are not compatible')
// }

let gpu = null
let kernels = null

let canvas = null
let ctx = null

let pos = null
let speed = null
let acc = null

export function init(_canvas) {
    canvas = _canvas
    gpu = new GPU()
    window.gpu = gpu
    kernels = initKernels(gpu, PARTICLE_COUNT)
    ctx = canvas.getContext('2d', { alpha: false })
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    let pos_x = []
    let pos_y = []
    let speed_x = []
    let speed_y = []
    let acc_x = []
    let acc_y = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos_x.push(Math.floor(Math.random() * CANVAS_SIZE))
        pos_y.push(Math.floor(Math.random() * CANVAS_SIZE))
        speed_x.push(0)
        speed_y.push(0)
        acc_x.push(0)
        acc_y.push(0)
    }
    pos = kernels.initVec2(pos_x, pos_y)
    speed = kernels.initVec2(speed_x, speed_y)
    acc = kernels.initVec2(acc_x, acc_y)
    //console.log(acc)
    //throw 123;
}

export function step(io) {
    //Brownian motion
    
    // for(let i=0;i<PARTICLE_COUNT;i++){
    //     let dsx = Math.random()*2-1
    //     let dsy = Math.random()*2-1
    //     dsx/=10
    //     dsy/=10
    //     speed[i] = new Float32Array([speed[i][0]+dsx, speed[i][1]+dsy])
    // }

    
    let lastKernel = null
    // try {
        lastKernel = kernels.updateSpeed
        //console.log(pos, speed, PARTICLE_COUNT, CANVAS_SIZE)
        //console.log(gpu)
        speed = kernels.updateSpeed(pos, speed, PARTICLE_COUNT, CANVAS_SIZE, io.mouse)
        lastKernel = kernels.updatePos
        pos = kernels.updatePos(pos, speed)
    // } catch (e) {
    //     console.log(lastKernel)
    //     console.log(lastKernel.compiledFragmentShader)
    //     throw e
    // }
    //console.log(kernels.updateSpeed.compiledFragmentShader)
}

export function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let [x, y] = pos[i]

        //console.log(x,y)
        ctx.fillStyle = i%2==0?'green':'red'
        ctx.fillRect(
            x - VISIBLE_SIZE / 2,
            y - VISIBLE_SIZE / 2,
            VISIBLE_SIZE,
            VISIBLE_SIZE
        )
        // throw 123;
    }

    ctx.fill();

}
