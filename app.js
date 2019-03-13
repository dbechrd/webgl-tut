import { SHADER_ATTR, ShaderUtil } from './shader_util.js'

/** @type {WebGL2RenderingContext} */
let gl;
let prog_default;
let position_loc;
let point_size_loc;
let bufVerts;
let arrVerts;
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

    loadProgram(vert, frag, validate) {
        let vshader = ShaderUtil.compile(gl, vert, gl.VERTEX_SHADER);
        if (!vshader) {
            return null;
        }
        let fshader = ShaderUtil.compile(gl, frag, gl.FRAGMENT_SHADER);
        if (!fshader) {
            gl.deleteShader(vshader);
            return null;
        }
        let prog = ShaderUtil.link(gl, vshader, fshader, validate);
        if (!prog) {
            gl.deleteShader(vshader);
            gl.deleteShader(fshader);
            return null;
        }

        gl.useProgram(prog);
        //ATTR_POSITION["location"] = gl.getAttribLocation(prog, ATTR_POSITION["name"]);
        point_size_loc = gl.getUniformLocation(prog, "u_point_size");
        gl.useProgram(null);

        prog_default = prog;
    }

    initDataBuffers() {
        arrVerts = new Float32Array([
            -0.4, 0.3, 0,
             0.4, 0.3, 0,
            -0.30, -0.5, 0,
            -0.20, -0.3, 0,
             0.00, -0.1, 0,
             0.20, -0.3, 0,
             0.30, -0.5, 0,
        ]);
        bufVerts = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, bufVerts);
        gl.bufferData(gl.ARRAY_BUFFER, arrVerts, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
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
            gl.enableVertexAttribArray(SHADER_ATTR["position"]["location"]);
            gl.vertexAttribPointer(SHADER_ATTR["position"]["location"], 3, gl.FLOAT, false, 0, 0);
        }

        if (arrNorm !== undefined && arrNorm !== null) {
            rtn.bufNormals = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.bufNormals);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrNorm), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(SHADER_ATTR["normal"]["location"]);
            gl.vertexAttribPointer(SHADER_ATTR["normal"]["location"], 3, gl.FLOAT, false, 0, 0);
        }

        if (arrUV !== undefined && arrUV !== null) {
            rtn.bufUV = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.bufUV);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrUV), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(SHADER_ATTR["uv"]["location"]);
            gl.vertexAttribPointer(SHADER_ATTR["uv"]["location"], 2, gl.FLOAT, false, 0, 0);
        }

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        meshCache[name] = rtn;
        return rtn;
    }

    draw() {
        gl.useProgram(prog_default);
        gl.uniform1f(point_size_loc, 100.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufVerts);
        gl.enableVertexAttribArray(position_loc);
        gl.vertexAttribPointer(position_loc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.drawArrays(gl.POINTS, 0, 7);
    }
}

export default App;
