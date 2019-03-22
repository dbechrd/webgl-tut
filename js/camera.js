import { gl } from './globals.js'
import { Transform } from './transform.js'
import { Matrix4 } from './math.js'

class Camera {
    /**
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {number} fov - Field of view.
     * @param {number} near - Near plane.
     * @param {number} far- Far plane.
     */
    constructor(fov, near, far) {
        this.updateProjectionMatrix();
        this.transform = new Transform();
        this.viewMatrix = new Float32Array(16);
        this.mode = Camera.MODE_ORBIT;
    }

    panX(v) {
        if (this.mode == Camera.MODE_ORBIT) return;
        this.updateViewMatrix();
        this.transform.position.x += this.transform.right[0] * v;
        this.transform.position.y += this.transform.right[1] * v;
        this.transform.position.z += this.transform.right[2] * v;
    }
    panY(v) {
        this.updateViewMatrix();
        this.transform.position.y += this.transform.up[1] * v;
        if (this.mode == Camera.MODE_ORBIT) return;
        this.transform.position.x += this.transform.up[0] * v;
        this.transform.position.z += this.transform.up[2] * v;
    }
    panZ(v) {
        this.updateViewMatrix();
        if (this.mode == Camera.MODE_ORBIT) {
            this.transform.position.z += v;
            return;
        }
        this.transform.position.x += this.transform.forward[0] * v;
        this.transform.position.y += this.transform.forward[1] * v;
        this.transform.position.z += this.transform.forward[2] * v;
    }

    updateProjectionMatrix(fov, near, far) {
        this.projectionMatrix = new Float32Array(16);
        let ratio = gl.canvas.width / gl.canvas.height;
        Matrix4.perspective(this.projectionMatrix, fov || 45, ratio, near || 0.1, far || 100.0);
    }

    updateViewMatrix() {
        if (this.mode == Camera.MODE_FREE) {
            this.transform.matView.reset()
                .vtranslate(this.transform.position)
                .rotateX(this.transform.rotation.x * Transform.deg2rad)
                .rotateY(this.transform.rotation.y * Transform.deg2rad);
        } else {
            this.transform.matView.reset()
                .rotateX(this.transform.rotation.x * Transform.deg2rad)
                .rotateY(this.transform.rotation.y * Transform.deg2rad)
                .vtranslate(this.transform.position);
        }

        this.transform.updateDirection();

        Matrix4.invert(this.viewMatrix, this.transform.matView.raw);
        return this.viewMatrix;
    }

    viewMatrixOrigin() {
        let mat = new Float32Array(this.viewMatrix);
        mat[12] = mat[13] = mat[14] = 0.0;
        return mat;
    }
}

Camera.MODE_FREE = 0;
Camera.MODE_ORBIT = 1;

class CameraController {
    /**
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {Camera} camera - The camera to control.
     */
    constructor(camera) {
        let oThis = this;
        let box = gl.canvas.getBoundingClientRect();
        this.canvas = gl.canvas;
        this.camera = camera;

        this.rotateRate = -300;
        this.panRate = 5;
        //this.zoomRate = 200;
        this.zoomRate = 1;

        this.offsetX = box.left;
        this.offsetY = box.top;

        this.initX = 0;
        this.initY = 0;
        this.prevX = 0;
        this.prevY = 0;

        this.onUpHandler = function(e) { oThis.onMouseUp(e); }
        this.onMoveHandler = function(e) { oThis.onMouseMove(e); }

        this.canvas.addEventListener("mousedown", function(e) { oThis.onMouseDown(e); });
        this.canvas.addEventListener("mousewheel", function(e) { oThis.onMouseWheel(e); });
    }

    getMouseVec2(e) {
        return {
            x: e.pageX - this.offsetX,
            y: e.pageY - this.offsetY
        };
    }

    onMouseDown(e) {
        this.initX = this.prevX = e.pageX - this.offsetX;
        this.initY = this.prevY = e.pageY - this.offsetY;

        this.canvas.addEventListener("mouseup", this.onUpHandler);
        this.canvas.addEventListener("mousemove", this.onMoveHandler);
    }

    onMouseUp(e) {
        this.canvas.removeEventListener("mouseup", this.onUpHandler);
        this.canvas.removeEventListener("mousemove", this.onMoveHandler);
    }

    onMouseWheel(e) {
        let delta = -Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        //this.camera.panZ(delta * (this.zoomRate / this.canvas.height));
        this.camera.panZ(delta * this.zoomRate);
    }

    onMouseMove(e) {
        let x = e.pageX - this.offsetX;
        let y = e.pageY - this.offsetY;
        let dx = x - this.prevX;
        let dy = y - this.prevY;

        if (!e.shiftKey) {
            this.camera.transform.rotation.y += dx * (this.rotateRate / this.canvas.width);
            this.camera.transform.rotation.x += dy * (this.rotateRate / this.canvas.height);
        } else {
            this.camera.panX(-dx * (this.panRate / this.canvas.width));
            this.camera.panY(-dy * (this.panRate / this.canvas.height));
        }

        this.prevX = x;
        this.prevY = y;
    }
}

export { Camera, CameraController };
