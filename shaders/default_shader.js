import { Shader } from "./shader.js"

class DefaultShader extends Shader {
    /**
     * Construct (link and compile) a new DefaultShader.
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {boolean} validate - Validate shader program after compiling.
     */
    constructor(gl, validate) {
        let vert = DefaultShader.vert();
        let frag = DefaultShader.frag();
        super(gl, vert, frag, validate);

        this.bind();
        this.uniformLoc.point_size = this.gl.getUniformLocation(this.program, "u_point_size");
        this.uniformLoc.angle      = this.gl.getUniformLocation(this.program, "u_angle");
        this.unbind();
    }

    setPointSize(point_size) {
        this.gl.uniform1f(this.uniformLoc.point_size, point_size);
        return this;
    }

    setAngle(angle) {
        this.gl.uniform1f(this.uniformLoc.angle, angle);
        return this;
    }

    static vert() {
        return `#version 300 es
        in vec3 attr_position;

        uniform mat4 u_projection_matrix;
        uniform mat4 u_model_matrix;
        uniform mat4 u_camera_matrix;

        uniform float u_point_size;
        uniform float u_angle;

        void main(void) {
            gl_PointSize = u_point_size;
            gl_Position = u_projection_matrix * u_camera_matrix * u_model_matrix * vec4(attr_position, 1.0);
            //gl_Position = u_model_matrix * vec4(attr_position, 1.0);

            // gl_Position = vec4(
            //     cos(u_angle) * 0.2 + attr_position.x,
            //     sin(u_angle) * 0.2 + attr_position.y,
            //     attr_position.z,
            //     1.0
            // );
        }`;
    }

    static frag() {
        return `#version 300 es
        precision mediump float;

        out vec4 out_color;

        void main(void) {
            out_color = vec4(0.0, 0.0, 0.0, 1.0);
        }`;
    }
}

export { DefaultShader };
