import { gl, Globals } from "./globals.js"

class Texture {
    constructor(name, img, flipY) {
        let tex = gl.createTexture();
        if (flipY) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
        Globals.TextureCache[name] = tex;

        if (flipY) {
            this.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        }
        return tex;
    }
}

export { Texture }
