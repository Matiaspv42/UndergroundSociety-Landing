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


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

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
    effectComposer.setSize(sizes.width, sizes.height)
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

/**
 * Audio
 */
 const audioContext = new AudioContext();
 // get the audio element
 const audioElement = document.querySelector('audio');
 // pass it into the audio context
 const track = audioContext.createMediaElementSource(audioElement);

 // Create analyser
var analyser = audioContext.createAnalyser();
track.connect(analyser)
analyser.connect(audioContext.destination)
analyser.fftSize = 1024;
const bufferLength = analyser.frequencyBinCount

var dataArray = new Float32Array(bufferLength);
analyser.getFloatFrequencyData(dataArray)


// select our play button
const playButton = document.querySelector('button');
playButton.addEventListener('click', function() {
    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audioElement.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
    }
}, false);

var interp =0.0

const tick = () =>
{
    
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // update uTime
    planeMaterial.uniforms.uTime.value = elapsedTime

    // // audio
    // if (playButton.dataset.playing === 'true') {
    //     interp+=0.001
    //     analyser.getFloatFrequencyData(dataArray)
    //     var lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
    //     var upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

    //     var overallAvg = avg(dataArray);
    //     var lowerMax = max(lowerHalfArray);
    //     var lowerAvg = avg(lowerHalfArray);
    //     var upperMax = max(upperHalfArray);
    //     var upperAvg = avg(upperHalfArray);

        

    //     var lowerMaxFr = lowerMax / lowerHalfArray.length;
    //     var lowerAvgFr = lowerAvg / lowerHalfArray.length;
    //     var upperMaxFr = upperMax / upperHalfArray.length;
    //     var upperAvgFr = upperAvg / upperHalfArray.length;


    //     var scalingRate = Math.tanh(lowerAvgFr) * 4 + 1;
    //     plane.scale.set(1+(scalingRate*0.05),1+(scalingRate*0.05));

    //     const count = planeGeometry.attributes.position.count
    //     const randoms = new Float32Array(count)
    //     randoms.fill(modulate(upperAvgFr, 0, 1, 0, 4)*0.5)
    //     const randoms2 = new Float32Array(count)
    //     randoms2.fill(lowerMaxFr)
    //     planeGeometry.setAttribute('aBass', new THREE.BufferAttribute(randoms2,1))
    //     planeGeometry.setAttribute('aTreble', new THREE.BufferAttribute(randoms,1))
    // }

    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)
    // effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()