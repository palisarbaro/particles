let prev_time = new Date()
let showFPS = true;
export function FPS(){
    if(showFPS){
        let curr_time = new Date()
        let dt = curr_time - prev_time
        let FPS = 1000 / dt
        console.log('FPS: ', FPS)
        prev_time = curr_time
    }
}
