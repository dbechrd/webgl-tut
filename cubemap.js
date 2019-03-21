import { gl, Globals } from "./globals.js"

class CubeMap {
    constructor(name, posX, negX, posY, negY, posZ, negZ) {
        return this.build(name, [posX, negX, posY, negY, posZ, negZ]);
    }

    build(name, images) {
        if (images.length != 6) {
            console.error("Tried to create cubemap with wrong number of images; expected 6");
            return null;
        }

        let tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

        for (let i = 0; i < 6; i++) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        Globals.TextureCache[name] = tex;
        return tex;
    }
}

export { CubeMap };
