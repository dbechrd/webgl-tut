import { gl } from "../globals.js"
import { Shader } from "../shader.js"

class DefaultShader extends Shader {
    /**
     * Construct (link and compile) a new DefaultShader.
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

        out vec2 vert_uv;
        out vec3 vert_color;

        uniform mediump float u_time;
        uniform mat4 u_projection_matrix;
        uniform mat4 u_model_matrix;
        uniform mat4 u_camera_matrix;

        uniform float u_point_size;
        uniform float u_angle;

        void main(void) {
            gl_PointSize = u_point_size;
            gl_Position = u_projection_matrix * u_camera_matrix * u_model_matrix * vec4(attr_position, 1.0);
            vert_uv = attr_uv;
            vert_color = attr_color;
        }`;
    }

    static frag() {
        return `#version 300 es
        precision mediump float;

        in vec2 vert_uv;
        in vec3 vert_color;

        uniform mediump float u_time;
        uniform sampler2D u_main_texture;

        out vec4 final_color;

        void main(void) {
            vec2 delta = vert_uv - vec2(0.5, 0.5);
            float len = length(delta);
            float alpha = step(0.3, len) * (1.0 - step(0.4, len));

            float use_tex = 1.0 - step(0.01, length(vert_color));
            final_color = mix(vec4(vert_color, 1.0), texture(u_main_texture, vert_uv), use_tex);
        }`;
    }
}

export { DefaultShader };
