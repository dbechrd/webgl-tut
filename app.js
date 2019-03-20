import { gl } from "./globals.js"

class App {
    /**
     * @param {HTMLCanvasElement} canvas - The WebGL canvas element.
    */
    constructor() {
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.depthFunc(gl.LEQUAL);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(1, 1, 1, 1);
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

    fitScreen() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        this.setSize(width, height);
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

export { App };
