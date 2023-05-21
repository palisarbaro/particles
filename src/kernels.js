export function initKernels(gpu, PARTICLE_COUNT) {
    let initVec2 = gpu
        .createKernel(function (x, y) {
            let i = this.thread.x
            return [x[i], y[i]]
        })
        .setOutput([PARTICLE_COUNT])

    let updateSpeed = gpu
        .createKernel(
            function (_pos, _speed, _acc, PARTICLE_COUNT, CANVAS_SIZE) {
                let i = this.thread.x
                // for (let j = 0; j < PARTICLE_COUNT; j++) {}
                let speed = _speed[i]
                let pos = _pos[i]
                speed += _acc[i]

                // borders checks
                let right = pos[0]>CANVAS_SIZE && speed[0]>0
                let left = pos[0]<0 && speed[0]<0
                let bottom = pos[1]>CANVAS_SIZE && speed[1]>0 
                let top = pos[1]<0 && speed[1]<0 
                if( right || left){
                    speed = [-speed[0], speed[1]]
                }

                if(bottom||top){
                    speed = [speed[0], -speed[1]]
                }

                return speed
            },
            {
                argumentTypes: {
                    pos: 'Array1D(2)',
                    speed: 'Array1D(2)',
                    acc: 'Array1D(2)',
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
                let res = pos[i];
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
