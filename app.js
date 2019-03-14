import { ATTR_POSITION, ATTR_NORMAL, ATTR_UV, Shader } from './shaders/shader.js'

/** @type {WebGL2RenderingContext} */
let gl;
let vertCount;
let meshCache = [];

class App {
    constructor(canvasId) {
        /** @type {HTMLCanvasElement} */
        let canvas = document.getElementById(canvasId);
        gl = canvas.getContext("webgl2");
        if (!gl) {
            console.error("WebGL 2 context is not supported in this browser.");
            return null;
        }
        gl.clearColor(0.2, 0.8, 0.0, 1.0);
    }

    context() {
        return gl;
    }

    clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    setSize(w, h) {
        gl.canvas.style.width = w + "px";
        gl.canvas.style.height = h + "px";
        gl.canvas.width = w;
        gl.canvas.height = h;

        gl.viewport(0, 0, w, h);
    }

    createMeshVAO(name, arrIdx, arrVert, arrNorm, arrUV) {
        var rtn = { drawMode: gl.TRIANGLES };

        rtn.vao = gl.createVertexArray();
        gl.bindVertexArray(rtn.vao);

        if (arrIdx !== undefined && arrIdx !== null) {
            rtn.bufIndex = gl.createBuffer();
            rtn.indexCount = arrIdx.length;

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrIdx), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        if (arrVert !== undefined && arrVert !== null) {
            rtn.bufVertices = gl.createBuffer();
            rtn.vertexComponentLen = 3;
            rtn.vertexCount = arrVert.length / rtn.vertexComponentLen;

            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.bufVertices);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrVert), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_POSITION["location"]);
            gl.vertexAttribPointer(ATTR_POSITION["location"], 3, gl.FLOAT, false, 0, 0);
        }

        if (arrNorm !== undefined && arrNorm !== null) {
            rtn.bufNormals = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.bufNormals);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrNorm), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_NORMAL["location"]);
            gl.vertexAttribPointer(ATTR_NORMAL["location"], 3, gl.FLOAT, false, 0, 0);
        }

        if (arrUV !== undefined && arrUV !== null) {
            rtn.bufUV = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.bufUV);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrUV), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_UV["location"]);
            gl.vertexAttribPointer(ATTR_UV["location"], 2, gl.FLOAT, false, 0, 0);
        }

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        meshCache[name] = rtn;
        return rtn;
    }

    draw(shader, mesh) {
        shader.bind();
        gl.uniform1f(shader.uniformLoc["u_point_size"], 100.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVertices);
        gl.enableVertexAttribArray(shader.attribLoc["position"]);
        gl.vertexAttribPointer(shader.attribLoc["position"], 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.drawArrays(mesh.drawMode, 0, mesh.vertexCount);
        shader.unbind();
    }
}

export default App;
