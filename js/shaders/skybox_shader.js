import { gl } from "../globals.js"
import { Shader } from "../shader.js"

class SkyboxShader extends Shader {
    /**
     * Construct (link and compile) a new SkyboxShader.
     * @param {Matrix4} gl - The projection matrix.
     * @param {Texture} skyboxTex - The skybox texture.
     * @param {boolean} validate - Validate shader program after compiling.
     */
    constructor(validate) {
        let vert = SkyboxShader.vert();
        let frag = SkyboxShader.frag();
        super(vert, frag, validate);
    }

    preRender() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.mainTexture);
        gl.uniform1i(this.uniformLoc.mainTexture, 0);
        return this;
    }

    static vert() {
        return `#version 300 es

        in vec4 attr_position;
        in vec3 attr_uv;

        out highp vec3 vert_uv;

        uniform mediump float u_time;
        uniform mat4 u_projection_matrix;
        uniform mat4 u_model_matrix;
        uniform mat4 u_camera_matrix;

        void main(void) {
            vert_uv = attr_uv;
            vert_uv = attr_position.xyz;
            vert_uv.z *= -1.0;
            gl_Position = u_projection_matrix * u_camera_matrix * vec4(attr_position.xyz, 1.0);
        }`;
    }

    static frag() {
        return `#version 300 es
        precision mediump float;

        in highp vec3 vert_uv;

        uniform mediump float u_time;
        uniform samplerCube u_main_texture;

        out vec4 final_color;

        void main(void) {
            final_color = texture(u_main_texture, vert_uv);
        }`;
    }
}

export { SkyboxShader };
