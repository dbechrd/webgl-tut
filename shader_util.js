const SHADER_ATTR = {
    position: { name: "attr_position", location: 0 },
    normal:   { name: "attr_normal"  , location: 1 },
    uv:       { name: "attr_uv"      , location: 2 },
}

class ShaderUtil {
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

        gl.bindAttribLocation(prog, SHADER_ATTR["position"]["location"], SHADER_ATTR["position"]["name"]);
        gl.bindAttribLocation(prog, SHADER_ATTR["normal"]["location"]  , SHADER_ATTR["normal"]["name"]);
        gl.bindAttribLocation(prog, SHADER_ATTR["uv"]["location"]      , SHADER_ATTR["uv"]["name"]);

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
            position: gl.getAttribLocation(program, SHADER_ATTR["position"]["name"]),
            normal:   gl.getAttribLocation(program, SHADER_ATTR["normal"]["name"]),
            uv:       gl.getAttribLocation(program, SHADER_ATTR["uv"]["name"]),
        };
    }
}

export {
    SHADER_ATTR,
    ShaderUtil,
};
