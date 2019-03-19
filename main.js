// https://www.youtube.com/watch?v=LtFujAtKM5I&list=PLMinhigDWz6emRKVkVIEAaePW7vtIkaIF
// https://github.com/airbnb/javascript#modules--use-them
// http://usejsdoc.org/tags-param.html

// Notes:
// glUniform3fv to set 4 color palette via uniform, then use vertex array attribute to index into that palette

import { App } from "./app.js"
import { Mesh } from "./mesh.js"
import { Model } from "./model.js"
import { Primitives } from "./primitives.js"
import { DefaultShader } from "./shaders/default_shader.js"
import { Camera, CameraController } from "./camera.js";
import { gl, Globals } from "./globals.js";
import { Texture } from "./texture.js";

/** @type {AudioContext} */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const audioElement = document.querySelector("audio");
const track = audioCtx.createMediaElementSource(audioElement);

let app;
let shader;
let pointGridModel;
let gridModel;
let quadModels = [];
let camera;
let cameraCtrl;

Globals.Canvas.addEventListener("click", function(e) {
    if (e.offsetX > 20 || e.offsetY > 20)
        return;

    if (audioCtx.state === "suspended") {
        audioCtx.resume();
        audioElement.play();
    } else {
        audioCtx.suspend();
    }
});

window.addEventListener("load", function() {
    app = new App();
    app.fitScreen();
    app.clear();

    let gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;

    // TODO: PannerNode for spatial

    // let oscNode = new OscillatorNode(audioCtx);
    // oscNode.frequency.setValueAtTime(261.6, 0.0);
    // osc.connect(gain).connect(audioCtx.destination);
    // osc.start();
    track.connect(gainNode).connect(audioCtx.destination);
    let promise;// = audioElement.play();
    if (promise !== undefined) {
        promise.then(_ => {
            // Autoplay started!
        }).catch(error => {
            // Autoplay was prevented.
            // Show a "Play" button so that user can start playback.
        });
    }

    camera = new Camera(gl, 45, 0.1, 1000);
    camera.transform.position.set(0, 0, 3);
    cameraCtrl = new CameraController(gl, camera);

    let texture = new Texture("texture1", document.getElementById("texture1"));

    shader = new DefaultShader(gl, true);
    shader.bind()
        .setProjectionMatrix(camera.projectionMatrix)
        .setTexture(texture)
        .unbind();

    // Grid
    let radius = 4;
    let verts = [];
    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            verts.push(x / radius, y / radius, 0);
        }
    }
    let arrVerts = new Float32Array(verts);
    let pointGridMesh = new Mesh("point_grid", null, arrVerts);

    pointGridMesh.drawMode = gl.POINTS;
    pointGridModel = new Model(pointGridMesh)
        .setRotation(-60, 0, 30)

    gridModel = Primitives.GridAxis.createModel(gl, true);

    let quadModel = Primitives.Quad.createModel(gl);
    quadModels.push(quadModel);

    let loop = new RenderLoop(onRender, 30);
    loop.start();
});

let point_size = 0;
let point_step = 3;
let angle_step = 30;

function onRender(dt) {
    point_size += point_step * dt;
    let angle = angle_step * dt;
    let size = (Math.sin(point_size) * 10.0) + 20.0;

    pointGridModel.addRotation(0, 0, angle);

    camera.updateViewMatrix();
    app.clear();
    shader.bind()
        .setPointSize(size)
        .setAngle(angle)
        .setCameraMatrix(camera.viewMatrix)
        .setProjectionMatrix(camera.projectionMatrix)
        .preRender()
        .renderModel(pointGridModel.preRender())
        .renderModel(gridModel.preRender());
    quadModels.forEach(quadModel => {
        shader.renderModel(quadModel.preRender());
    });
    shader.unbind();
}

class RenderLoop {
    constructor(callback, fps) {
        let oThis = this;
        this.msLastFrame = null;
        this.callback = callback;
        this.active = false;
        this.fps = 0;

        if (fps != undefined && fps > 0) {
            this.msFpsLimit = 1000 / fps;

            this.run = function() {
                let msCurrent = performance.now();
                let msDelta = msCurrent - oThis.msLastFrame;
                let deltaTime = msDelta / 1000.0;

                if (msDelta >= oThis.msFpsLimit) {
                    oThis.fps = Math.floor(1 / deltaTime);
                    oThis.msLastFrame = msCurrent;
                    oThis.callback(deltaTime);
                }

                if (oThis.active) {
                    window.requestAnimationFrame(oThis.run);
                }
            }
        } else {
            this.run = function() {
                let msCurrent = performance.now();
                let deltaTime = (msCurrent - oThis.msLastFrame) / 1000.0;

                oThis.fps = Math.floor(1 / deltaTime);
                oThis.msLastFrame = msCurrent;

                oThis.callback(deltaTime);
                if (oThis.active) {
                    window.requestAnimationFrame(oThis.run);
                }
            }
        }
    }

    start() {
        this.active = true;
        this.msLastFrame = performance.now();
        window.requestAnimationFrame(this.run);
    }

    stop() {
        this.active = false;
    }
}
