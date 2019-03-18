import { gl, Globals } from "./globals.js"
import { ATTR_POSITION, ATTR_NORMAL, ATTR_UV, ATTR_COLOR } from './shaders/shader.js'

class Mesh {
    constructor(name, arrIdx, arrPos, arrNorm, arrUV, arrColor) {
        this.drawMode = gl.TRIANGLES;
        this.disableCull = false;
        this.enableBlend = false;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        if (arrIdx !== undefined && arrIdx !== null) {
            this.bufIndex = gl.createBuffer();
            this.indexCount = arrIdx.length;

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrIdx), gl.STATIC_DRAW);
        }

        if (arrPos !== undefined && arrPos !== null) {
            this.bufVertices = gl.createBuffer();
            this.vertexComponentLen = 3;
            this.vertexCount = arrPos.length / this.vertexComponentLen;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufVertices);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrPos), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_POSITION["location"]);
            gl.vertexAttribPointer(ATTR_POSITION["location"], 3, gl.FLOAT, false, 0, 0);
        }

        if (arrNorm !== undefined && arrNorm !== null) {
            this.bufNormals = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNormals);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrNorm), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_NORMAL["location"]);
            gl.vertexAttribPointer(ATTR_NORMAL["location"], 3, gl.FLOAT, false, 0, 0);
        }

        if (arrUV !== undefined && arrUV !== null) {
            this.bufUV = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrUV), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_UV["location"]);
            gl.vertexAttribPointer(ATTR_UV["location"], 2, gl.FLOAT, false, 0, 0);
        }

        if (arrColor !== undefined && arrColor !== null) {
            this.bufColors = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufColors);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrColor), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_COLOR["location"]);
            gl.vertexAttribPointer(ATTR_COLOR["location"], 3, gl.FLOAT, false, 0, 0);
        }

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (arrIdx !== undefined && arrIdx !== null) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        Globals.MeshCache[name] = this;
    }
}

export { Mesh };
