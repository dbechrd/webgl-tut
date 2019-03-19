import { gl } from "../globals.js"
import { Model } from '../model.js'

const ATTR_POSITION = { name: "attr_position", location: 0 };
const ATTR_NORMAL   = { name: "attr_normal"  , location: 1 };
const ATTR_UV       = { name: "attr_uv"      , location: 2 };
const ATTR_COLOR    = { name: "attr_color"   , location: 3 };

class Shader {
    /**
     * Construct (link and compile) a new shader.
     * @param {string} vertShaderSrc - The vertex shader source code.
     * @param {string} fragShaderSrc - The fragment shader source code.
     * @param {boolean} validate - Validate shader program after compiling.
     */
    constructor(vertShaderSrc, fragShaderSrc, validate) {
        let vert = Shader.compile(gl, vertShaderSrc, gl.VERTEX_SHADER);
        if (!vert) {
            return null;
        }
        let frag = Shader.compile(gl, fragShaderSrc, gl.FRAGMENT_SHADER);
        if (!frag) {
            gl.deleteShader(vert);
            return null;
        }
        let prog = Shader.link(gl, vert, frag, validate);
        if (!prog) {
            gl.deleteShader(vert);
            gl.deleteShader(frag);
            return null;
        }

        gl.useProgram(prog);
        this.attribLoc = Shader.getStandardAttribLocations(gl, prog);
        this.uniformLoc = Shader.getStandardUniformLocations(gl, prog);
        gl.useProgram(null);

        this.program = prog;
        this.mainTexture = -1;
    }

    dispose() {
        if (gl.getParameter(gl.CURRENT_PROGRAM) === this.program) {
            unbind();
        }
        gl.deleteProgram(this.program);
    }

    bind() {
        gl.useProgram(this.program);
        return this;
    }

    unbind() {
        gl.useProgram(null);
        return this;
    }

    setProjectionMatrix(matData) {
        gl.uniformMatrix4fv(this.uniformLoc.projectionMatrix, false, matData);
        return this;
    }
    setModelMatrix(matData) {
        gl.uniformMatrix4fv(this.uniformLoc.modelMatrix, false, matData);
        return this;
    }
    setCameraMatrix(matData) {
        gl.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData);
        return this;
    }
    setTexture(texId) {
        this.mainTexture = texId;
        return this;
    }

    preRender() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.mainTexture);
        gl.uniform1i(this.uniformLoc.mainTexture, 0);
        return this;
    }

    /**
     * Render a model using this shader.
     * @param {Model} model - An instance of the model class.
     */
    renderModel(model) {
        this.setModelMatrix(model.transform.getViewMatrix());
        gl.bindVertexArray(model.mesh.vao);

        if (model.mesh.disableCull) { gl.disable(gl.CULL_FACE); }
        if (model.mesh.enableBlend) { gl.enable(gl.BLEND); }

        if (model.mesh.indexCount) {
            gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);
        }

        if (model.mesh.disableCull) { gl.enable(gl.CULL_FACE); }
        if (model.mesh.enableBlend) { gl.disable(gl.BLEND); }

        gl.bindVertexArray(null);
        return this;
    }

    /**
     * Compile the shader
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {string} src - The shader source code.
     * @param {number} type - GL shader type.
     */
    static compile(gl, src, type) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Error while compiling shader " + src, gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    /**
     * Link the shader program
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {string} vert_shader - The vertex shader source.
     * @param {string} frag_shader - The fragmenet shader source.
     * @param {boolean} validate - Validate shader program after compiling.
     */
    static link(gl, vert_shader, frag_shader, validate) {
        let prog = gl.createProgram();
        gl.attachShader(prog, vert_shader);
        gl.attachShader(prog, frag_shader);

        gl.bindAttribLocation(prog, ATTR_POSITION["location"], ATTR_POSITION["name"]);
        gl.bindAttribLocation(prog,   ATTR_NORMAL["location"],   ATTR_NORMAL["name"]);
        gl.bindAttribLocation(prog,       ATTR_UV["location"],       ATTR_UV["name"]);
        gl.bindAttribLocation(prog,    ATTR_COLOR["location"],    ATTR_COLOR["name"]);

        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("Error linking shader program.", gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog);
            return null;
        }

        if (validate) {
            gl.validateProgram(prog);
            if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
                console.error("Error validating shader program.", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog);
                return null;
            }
        }

        gl.detachShader(prog, vert_shader);
        gl.detachShader(prog, frag_shader);
        gl.deleteShader(vert_shader);
        gl.deleteShader(frag_shader);
        return prog;
    }

    /**
     * Get location of standard attribs (or -1 if attrib not used by shader)
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {WebGLProgram} program - The WebGL shader program.
     */
    static getStandardAttribLocations(gl, program) {
        return {
            position: gl.getAttribLocation(program, ATTR_POSITION["name"]),
            normal:   gl.getAttribLocation(program,   ATTR_NORMAL["name"]),
            uv:       gl.getAttribLocation(program,       ATTR_UV["name"]),
            color:    gl.getAttribLocation(program,    ATTR_COLOR["name"]),
        };
    }

    /**
     * Get location of standard uniforms (or -1 if uniform not used by shader)
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {WebGLProgram} program - The WebGL shader program.
     */
    static getStandardUniformLocations(gl, program) {
        return {
            projectionMatrix: gl.getUniformLocation(program, "u_projection_matrix"),
            modelMatrix:      gl.getUniformLocation(program, "u_model_matrix"),
            cameraMatrix:     gl.getUniformLocation(program, "u_camera_matrix"),
            mainTexture:      gl.getUniformLocation(program, "u_main_texture")
        };
    }
}

export {
    ATTR_POSITION,
    ATTR_NORMAL,
    ATTR_UV,
    ATTR_COLOR,
    Shader,
};
