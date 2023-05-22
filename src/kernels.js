// |f| = coef/dp**pow
function getForce(pos1, pos2, pow, coef) {
    let dp = pos2
    dp -= pos1
    let r = len(dp)
    let force = [0, 0]
    if (r > 0.01 && r<50) {
        dp = my_norm(dp)
        force = dp
        force /= Math.pow(r, pow)
    }
    force *= coef
    return force
}

function len(a) {
    let sqr = a[0] * a[0] + a[1] * a[1]
    return Math.sqrt(sqr)
}

function my_norm(a) {
    a /= len(a)
    return a
}

export function initKernels(gpu, PARTICLE_COUNT) {
    gpu.addFunction(len, {
        argumentTypes: { a: 'Array(2)' },
        returnType: 'Float',
    })

    gpu.addFunction(my_norm, {
        argumentTypes: { a: 'Array(2)' },
        returnType: 'Array(2)',
    })

    gpu.addFunction(getForce, {
        argumentTypes: {
            pos1: 'Array(2)',
            pos2: 'Array(2)',
            pow: 'Float',
            coef: 'Float',
        },
        returnType: 'Array(2)',
    })

    let initVec2 = gpu
        .createKernel(function (x, y) {
            let i = this.thread.x
            return [x[i], y[i]]
        })
        .setOutput([PARTICLE_COUNT])

    let updateSpeed = gpu
        .createKernel(
            function (_pos, _speed, PARTICLE_COUNT, CANVAS_SIZE, mouse) {
                const TYPES = this.constants.TYPES
                let i = this.thread.x
                let type = i%TYPES
                let acc = [0, 0]
                let speed = _speed[i]
                let pos = _pos[i]
                for (let j = 0; j < PARTICLE_COUNT; j++) {
                    let type2 = j%TYPES
                    let pos2 = _pos[j]
                    // let speed2 = _speed[j]
                    let repulsion = -getForce(pos, pos2, 3, 10000)
                    let coef = type==type2 ? -1:1
                    coef *= 300
                    if(type==0){
                        coef*=2
                    }
                    let attraction = getForce(pos, pos2, 2, coef)
                    let mouseForce = [0, 0]
                    let dmouse = pos
                    dmouse -= mouse
                    if (mouse[0] > 0 && len(dmouse) < 200)
                        mouseForce = getForce(pos, mouse, 0, 0.0005)
                    acc += repulsion
                    acc += attraction
                    acc += mouseForce
                }
                // acc = [1,0]
                speed += acc
                const MAX_SPEED = 20
                speed = Math.max(Math.min(speed, [MAX_SPEED, MAX_SPEED]), [
                    -MAX_SPEED,
                    -MAX_SPEED,
                ])
                //friction
                speed *= 0.9
                // borders checks
                let right = pos[0] > CANVAS_SIZE && speed[0] > 0
                let left = pos[0] < 0 && speed[0] < 0
                let bottom = pos[1] > CANVAS_SIZE && speed[1] > 0
                let top = pos[1] < 0 && speed[1] < 0
                if (right || left) {
                    speed = [-speed[0], speed[1]]
                }

                if (bottom || top) {
                    speed = [speed[0], -speed[1]]
                }

                return speed
            },
            {
                argumentTypes: {
                    _pos: 'Array1D(2)',
                    _speed: 'Array1D(2)',
                    PARTICLE_COUNT: 'Integer',
                    CANVAS_SIZE: 'Float',
                    mouse: 'Array(2)',
                },
                constants:{
                    TYPES: 2,
                }
            }
        )
        .setOutput([PARTICLE_COUNT])

    let updatePos = gpu
        .createKernel(
            function (pos, speed) {
                const dt = 1
                let i = this.thread.x
                let res = pos[i]
                let sp = speed[i]
                sp *= dt
                res += sp
                return res
            },
            {
                argumentTypes: {
                    pos: 'Array1D(2)',
                    speed: 'Array1D(2)',
                },
            }
        )
        .setOutput([PARTICLE_COUNT])
    return { updatePos, updateSpeed, initVec2 }
}
