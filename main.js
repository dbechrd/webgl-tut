// https://www.youtube.com/watch?v=LtFujAtKM5I&list=PLMinhigDWz6emRKVkVIEAaePW7vtIkaIF
// https://github.com/airbnb/javascript#modules--use-them
// http://usejsdoc.org/tags-param.html

import App from './app.js'
import Model from './model.js'
import DefaultShader from './shaders/default_shader.js'

let app;
let gl;
let shader;
let model;

window.addEventListener("load", function() {
    app = new App("glcanvas");
    app.setSize(500, 500);
    app.clear();

    gl = app.context();
    shader = new DefaultShader(gl, true);

    let arrVerts = new Float32Array([
        -0.4, 0.3, 0,
         0.4, 0.3, 0,
        -0.30, -0.5, 0,
        -0.20, -0.3, 0,
         0.00, -0.1, 0,
         0.20, -0.3, 0,
         0.30, -0.5, 0,
    ]);
    let mesh = app.createMeshVAO("creeper", null, arrVerts);
    mesh.drawMode = gl.POINTS;

    model = new Model(mesh);

    let loop = new RenderLoop(onRender, 30);
    loop.start();
});

let point_size = 0;
let point_step = 3;
let angle = 0;
let angle_step = (Math.PI / 180.0) * 90;

function onRender(dt) {
    point_size += point_step * dt;
    angle += angle_step * dt;
    let size = (Math.sin(point_size) * 10.0) + 80.0;

    app.clear();
    shader.bind()
    shader.setPointSize(size)
    shader.setAngle(angle)
    shader.renderModel(model)
    shader.unbind();
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
