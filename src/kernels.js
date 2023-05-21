export function initKernels(gpu, PARTICLE_COUNT) {
    gpu.addFunction(
        function len(a) {
            let sqr = a[0] * a[0] + a[1] * a[1]
            return Math.sqrt(sqr)
        },
        {
            argumentTypes: { a: 'Array(2)' },
            returnType: 'Float',
        }
    )

    gpu.addFunction(
        function my_norm(a) {
            a /= len(a)
            return a
        },
        {
            argumentTypes: { a: 'Array(2)' },
            returnType: 'Array(2)',
        }
    )

    gpu.addFunction(
        // |f| = coef/dp**pow 
        function getForce(pos1, pos2, pow, coef) {
            let dp = pos2
            dp -= pos1
            let r = len(dp)
            let force = [0, 0]
            if (r > 0.01) {
                dp = my_norm(dp)
                force = dp
                force /= Math.pow(r, pow)
                
            }
            force *= coef
            return force
        },
        {
            argumentTypes: { pos1: 'Array(2)', pos2: 'Array(2)' },
            returnType: 'Array(2)',
        }
    )

    let initVec2 = gpu
        .createKernel(function (x, y) {
            let i = this.thread.x
            return [x[i], y[i]]
        })
        .setOutput([PARTICLE_COUNT])

    let updateSpeed = gpu
        .createKernel(
            function (_pos, _speed, PARTICLE_COUNT, CANVAS_SIZE) {
                let i = this.thread.x
                let acc = [0, 0]
                let speed = _speed[i]
                let pos = _pos[i]
                for (let j = 0; j < PARTICLE_COUNT; j++) {
                    let pos2 = _pos[j]
                    // let speed2 = _speed[j]
                    let repulsion = -getForce(pos, pos2, 3,10000)
                    let attraction = getForce(pos, pos2, 2,100)
                    acc += repulsion
                    acc += attraction
                }
                // acc = [1,0]
                speed += acc
                const MAX_SPEED = 20
                speed = Math.max(Math.min(speed,[MAX_SPEED,MAX_SPEED]),[-MAX_SPEED,-MAX_SPEED])
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
                },
            }
        )
        .setOutput([PARTICLE_COUNT])
    let updatePos = gpu
        .createKernel(
            function (pos, speed) {
                let i = this.thread.x
                let res = pos[i]
                res += speed[i]
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
