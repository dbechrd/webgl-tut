import { gl } from "../globals.js"
import { Shader } from "./shader.js"

class DefaultShader extends Shader {
    /**
     * Construct (link and compile) a new DefaultShader.
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {boolean} validate - Validate shader program after compiling.
     */
    constructor(validate) {
        let vert = DefaultShader.vert();
        let frag = DefaultShader.frag();
        super(vert, frag, validate);

        this.bind();
        this.uniformLoc.point_size = gl.getUniformLocation(this.program, "u_point_size");
        this.uniformLoc.angle      = gl.getUniformLocation(this.program, "u_angle");
        this.unbind();
    }

    setPointSize(point_size) {
        gl.uniform1f(this.uniformLoc.point_size, point_size);
        return this;
    }

    setAngle(angle) {
        gl.uniform1f(this.uniformLoc.angle, angle);
        return this;
    }

    static vert() {
        return `#version 300 es

        in vec3 attr_position;
        in vec3 attr_normal;
        in vec2 attr_uv;
        in vec3 attr_color;

        out vec3 vert_color;

        uniform mat4 u_projection_matrix;
        uniform mat4 u_model_matrix;
        uniform mat4 u_camera_matrix;

        uniform float u_point_size;
        uniform float u_angle;

        void main(void) {
            gl_PointSize = u_point_size;
            gl_Position = u_projection_matrix * u_camera_matrix * u_model_matrix * vec4(attr_position, 1.0);
            vert_color = attr_color;
        }`;
    }

    static frag() {
        return `#version 300 es
        precision mediump float;

        in vec3 vert_color;
        out vec4 final_color;

        void main(void) {
            final_color = vec4(vert_color, 1.0); //vec4(0.0, 0.0, 0.0, 1.0);
        }`;
    }
}

export { DefaultShader };
