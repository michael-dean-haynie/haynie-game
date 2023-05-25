"use strict"
let canvas
let context

let oldTimeStamp

let rectX = 0;
let rectY = 0;

window.onload = init

function init(){
    canvas = document.getElementById('canvas')
    context = canvas.getContext('2d')

    // Start the first frame request
    window.requestAnimationFrame(gameLoop)
}

function gameLoop(timeStamp) {
    const fps = calculateFPS(timeStamp);
    update()
    draw(fps)

    // The loop function has reached it's end. Keep requesting new frames
    window.requestAnimationFrame(gameLoop)
}

function calculateFPS(timeStamp) {
    // Calculate the number of seconds passed since the last frame
    const secondsPassed = (timeStamp - oldTimeStamp) / 1000
    oldTimeStamp = timeStamp

    // Calculate fps
    const fps = Math.round(1 / secondsPassed)
    return fps
}

function update() {
    rectX += 1;
    rectY += 1;
}

function draw(fps){
    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = '#ff8080'
    context.fillRect(rectX, rectY, 100, 100)
    drawFPS(fps)
}

function drawFPS(fps) {
    // Draw number to the screen
    context.font = '25px Arial'
    context.fillStyle = 'black'
    context.fillText("FPS: " + fps, 10, 30)
}
