// https://www.youtube.com/watch?v=LtFujAtKM5I&list=PLMinhigDWz6emRKVkVIEAaePW7vtIkaIF
// https://github.com/airbnb/javascript#modules--use-them
// http://usejsdoc.org/tags-param.html

// Notes:
// glUniform3fv to set 4 color palette via uniform, then use vertex array attribute to index into that palette

import { App } from './app.js'
import { Model } from './model.js'
import { Primitives } from './primitives.js'
import { DefaultShader } from './shaders/default_shader.js'
import { Camera, CameraController } from './camera.js';

let app;
let gl;
let shader;
let model;
let camera;
let cameraCtrl;

window.addEventListener("load", function() {
    app = new App("glcanvas");
    app.setSize(500, 500);
    app.clear();

    gl = app.context();

    camera = new Camera(gl, 45, 0.1, 1000);
    camera.transform.position.set(0, 0, 3);
    cameraCtrl = new CameraController(gl, camera);

    shader = new DefaultShader(gl, true);
    shader.bind().setProjectionMatrix(camera.projectionMatrix).unbind();

    // let arrVerts = new Float32Array([
    //     -0.4, 0.3, 0,
    //      0.4, 0.3, 0,
    //     -0.30, -0.5, 0,
    //     -0.20, -0.3, 0,
    //      0.00, -0.1, 0,
    //      0.20, -0.3, 0,
    //      0.30, -0.5, 0,
    // ]);

    let radius = 4;
    let verts = [];
    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            verts.push(x / radius, y / radius, 0);
        }
    }
    let arrVerts = new Float32Array(verts);
    let mesh = app.createMeshVAO("creeper", null, arrVerts);
    mesh.drawMode = gl.POINTS;

    model = new Model(mesh)
        //.setScale(1, 1, 1)
        //.setRotation(0, 0, 45)
        //.setPosition(0.8, 0.8, 0.0)

    let loop = new RenderLoop(onRender, 30);
    loop.start();
});

let point_size = 0;
let point_step = 3;
let angle = 0;
let angle_step = 30;

function onRender(dt) {
    point_size += point_step * dt;
    angle += angle_step * dt;
    let size = (Math.sin(point_size) * 2.0) + 8.0;

    //model.setRotation(0, 0, angle);

    camera.updateViewMatrix();
    app.clear();
    shader.bind()
        .setPointSize(size)
        .setAngle(angle)
        .setCameraMatrix(camera.viewMatrix)
        .setProjectionMatrix(camera.projectionMatrix)
        .renderModel(model.preRender())
        .unbind();
}

class RenderLoop {
    constructor(callback, fps) {
        let oThis = this;
        this.msLastFrame = null;
        this.callback = callback;
        this.active = false;
        this.fps = 0;

        if (!fps && fps > 0) {
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
