import { GPU } from 'gpu.js'
import { initKernels } from './kernels'

const PARTICLE_COUNT = 1000

const CANVAS_SIZE = 800
const VISIBLE_SIZE = 3
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
        speed_x.push(10)
        speed_y.push(10)
        acc_x.push(0)
        acc_y.push(0)
    }
    pos = kernels.initVec2(pos_x, pos_y)
    speed = kernels.initVec2(speed_x, speed_y)
    acc = kernels.initVec2(acc_x, acc_y)
    //console.log(acc)
    //throw 123;
}

export function step() {
    let lastKernel = null
    try {
        lastKernel = kernels.updateSpeed
        speed = kernels.updateSpeed(
            pos,
            speed,
            acc,
            PARTICLE_COUNT,
            CANVAS_SIZE
        )
        lastKernel = kernels.updatePos
        pos = kernels.updatePos(pos, speed)
    } catch (e) {
        console.log(lastKernel)
        console.log(lastKernel.compiledFragmentShader)
        throw e
    }
}

export function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        ctx.fillStyle = 'green'
        let [x, y] = pos[i]
        //console.log(x,y)
        ctx.fillRect(x, y, VISIBLE_SIZE, VISIBLE_SIZE)
        // throw 123;
    }
}
