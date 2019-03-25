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
import { SkyboxShader } from "./shaders/skybox_shader.js"
import { Camera, CameraController } from "./camera.js";
import { gl, Globals } from "./globals.js";
import { Texture } from "./texture.js";
import { CubeMap } from "./cubemap.js";
import { CubeMesh } from "./meshes/cube_mesh.js"

/** @type {AudioContext} */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const audioElement = document.querySelector("audio");
const track = audioCtx.createMediaElementSource(audioElement);

let app;
let gridShader;
let pointShader;
let quadShader;
let pointGridModel;
let gridModel;
let quadModels = [];
let cubeModel;
/** @type {Camera} */
let camera;
let cameraCtrl;
let skyboxModel;
let skyboxShader;

window.addEventListener("resize", function(e) {
    app.fitScreen();
    camera.updateProjectionMatrix();
});

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

    camera = new Camera(45, 0.1, 1000);
    camera.transform.position.set(0, 0, 3);
    cameraCtrl = new CameraController(camera);

    let texture = new Texture("texture1", document.getElementById("texture1"));
    let tex_black = new Texture("tex_black", document.getElementById("tex_black"));

    let skyboxCubemap = new CubeMap("skybox1",
        document.getElementById("skybox_posx"),
        document.getElementById("skybox_negx"),
        document.getElementById("skybox_posy"),
        document.getElementById("skybox_negy"),
        document.getElementById("skybox_posz"),
        document.getElementById("skybox_negz"),
    );
    skyboxModel = new Model(Primitives.Cube.createMesh("skybox1", 100, 100, 100, 0, 0, 0));
    skyboxShader = new SkyboxShader(true)
    skyboxShader.bind()
        .setProjectionMatrix(camera.projectionMatrix)
        .setTexture(skyboxCubemap)
        .unbind()

    gridShader = new DefaultShader(true);
    gridShader.bind()
        .setProjectionMatrix(camera.projectionMatrix)
        .setTexture(tex_black)
        .unbind();

    pointShader = new DefaultShader(true);
    pointShader.bind()
        .setProjectionMatrix(camera.projectionMatrix)
        .setTexture(tex_black)
        .unbind();

    quadShader = new DefaultShader(true);
    quadShader.bind()
        .setProjectionMatrix(camera.projectionMatrix)
        .setTexture(texture)
        .unbind();

    ///////////////////////////////////////////////////////////////////
    // Grid
    let radius = 4;
    let radmax = radius*2;
    let verts = [];
    let colors = [];
    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            verts.push(x / radius, y / radius, 0);
            colors.push((x+radius) / radmax, (y+radius) / radmax, 1.0);
        }
    }
    let arrVerts = new Float32Array(verts);
    let arrColor = new Float32Array(colors);
    let pointGridMesh = new Mesh("point_grid", 3, 2, null, arrVerts, null, null, arrColor);

    pointGridMesh.drawMode = gl.POINTS;
    pointGridModel = new Model(pointGridMesh)
        .setRotation(-60, 0, 30)

    gridModel = Primitives.GridAxis.createModel(true);
    ///////////////////////////////////////////////////////////////////

    let quadModel = Primitives.Quad.createModel();
    quadModels.push(quadModel);

    let cubeMesh = Mesh.parseObjText("cube_obj", CubeMesh.data());
    cubeMesh.disableCull = true;
    cubeModel = new Model(cubeMesh)
        .setScale(5.0, 5.0, 5.0);

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

    let time = performance.now();

    skyboxShader.bind()
        .setTime(time)
        .setCameraMatrix(camera.viewMatrixOrigin())
        .setProjectionMatrix(camera.projectionMatrix)
        .preRender()
        .renderModel(skyboxModel);

    gridShader.bind()
        .setTime(time)
        .setCameraMatrix(camera.viewMatrix)
        .setProjectionMatrix(camera.projectionMatrix)
        .preRender()
        .renderModel(gridModel.preRender());

    pointShader.bind()
        .setTime(time)
        .setCameraMatrix(camera.viewMatrix)
        .setProjectionMatrix(camera.projectionMatrix)
        .setPointSize(size)
        .setAngle(angle)
        .preRender()
        .renderModel(pointGridModel.preRender())

    quadShader.bind()
        .setTime(time)
        .setCameraMatrix(camera.viewMatrix)
        .setProjectionMatrix(camera.projectionMatrix)
        .preRender()
        // quadModels.forEach(quadModel => {
        //     quadShader.renderModel(quadModel.preRender());
        // });
    quadShader.renderModel(cubeModel.preRender());
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
