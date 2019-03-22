/** @type {WebGL2RenderingContext} */
let gl;

let Globals = {}
Globals.MeshCache = [];
Globals.TextureCache = [];
/** @type {HTMLCanvasElement} */
Globals.Canvas;

export { gl, Globals };

(function() {
    let canvas = document.getElementById("glcanvas");
    let ctx = canvas.getContext("webgl2");
    if (!ctx) {
        console.error("WebGL 2 context is not supported in this browser.");
        return null;
    }
    gl = ctx;
    Globals.Canvas = canvas;
})();
