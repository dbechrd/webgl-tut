class DefaultShader {
    static vert() {
        return `#version 300 es
        in vec3 attr_position;

        uniform float u_point_size;

        void main(void) {
            gl_PointSize = u_point_size;
            gl_Position = vec4(attr_position, 1.0);
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

export default DefaultShader;
