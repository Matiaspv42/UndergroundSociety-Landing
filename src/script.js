import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import planeVertexShader from './shaders/vertex.glsl'
import planeFragmentShader from './shaders/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { lerp } from 'three/src/math/MathUtils'


function avg(arr) {
    var total = arr.reduce(function (sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr) {
    return arr.reduce(function (a, b) { return Math.max(a, b); })
}
function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}
function fractionate(val, minVal, maxVal) {
    return (val - minVal) / (maxVal - minVal);
}

let countDownRunning = false
function countdown(){
    // Set the date we're counting down to
 var countDownDate = new Date("Jan 5, 2024 15:37:25").getTime();
        
 // Update the count down every 1 second
 var x = setInterval(function() {
 
   // Get today's date and time
   var now = new Date().getTime();
 
   // Find the distance between now and the count down date
   var distance = countDownDate - now;
 
   // Time calculations for days, hours, minutes and seconds
   var days = Math.floor(distance / (1000 * 60 * 60 * 24));
   var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
   var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
   var seconds = Math.floor((distance % (1000 * 60)) / 1000);
 
   // Display the result in the element with id="demo"
   document.getElementById("countdown").innerHTML = days + "d " + hours + "h "
   + minutes + "m " + seconds + "s ";
    
   countDownRunning = true
   // If the count down is finished, write some text
   if (distance < 0) {
     clearInterval(x);
     document.getElementById("countdown").innerHTML = "EXPIRED";
   }
 }, 1000);

}




// Countdown
 countdown()
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a0e11)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // effectComposer.setSize(sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 3
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Points with plane
 */

const planeGeometry = new THREE.PlaneGeometry(100,20,64,64)
const planeMaterial = new THREE.ShaderMaterial({
    wireframe:true,
    vertexShader: planeVertexShader,
    fragmentShader: planeFragmentShader,
    uniforms:{
        uTime:{value:0},
        uInterp:{value:0}
    }
})
const plane = new THREE.Mesh(planeGeometry,planeMaterial)
plane.position.x = 0
plane.position.y = -8.5
plane.position.z = -10
plane.rotation.x = -Math.PI * 0.4
scene.add(plane)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    // alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post processing
 */
// const effectComposer = new EffectComposer(renderer)
// effectComposer.setSize(sizes.width, sizes.height)
// effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// const renderPass = new RenderPass(scene, camera)
// effectComposer.addPass(renderPass)
// // const rgbShiftPass = new ShaderPass(RGBShiftShader)
// // effectComposer.addPass(rgbShiftPass)
// // const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
// // effectComposer.addPass(gammaCorrectionPass)
// const unrealBloomPass = new UnrealBloomPass()
// unrealBloomPass.strength = 1.5
// effectComposer.addPass(unrealBloomPass)

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0


 

const tick = () =>
{
    
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // update uTime
    planeMaterial.uniforms.uTime.value = elapsedTime


    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)
    // effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    
}

tick()