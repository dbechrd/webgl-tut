import { Globals } from "./globals.js"
import { Mesh } from "./mesh.js"
import { Model } from "./model.js"
import { ATTR_POSITION, ATTR_NORMAL, ATTR_UV, ATTR_COLOR } from './shaders/shader.js'

var Primitives = {};

Primitives.Quad = class {
	static MESH_NAME() { return "_Primitives.Quad"; }
	static createModel(gl) {
        let mesh = Globals.MeshCache[this.MESH_NAME()] || Primitives.Quad.createMesh(gl);
        mesh.disableCull = true;
        mesh.enableBlend = true;
        let model = new Model(mesh);
        return model;
	}
	static createMesh(gl) {
		let verts = [
			-0.5, 0.5, 0,
			-0.5,-0.5, 0,
			 0.5,-0.5, 0,
			 0.5, 0.5, 0
		];
		let uvs = [
			0, 0,
			0, 1,
			1, 1,
			1, 0
		];
		let indices = [
			0, 1, 2,
			2, 3, 0
		];
		let mesh = new Mesh(this.MESH_NAME(), indices, verts, null, uvs);
		return mesh;
	}
}

Primitives.GridAxis = class {
	static MESH_NAME() { return "_Primitives.GridAxis"; }
    static createModel(gl, incAxis) {
		return new Model(Globals.MeshCache[this.MESH_NAME()] || Primitives.GridAxis.createMesh(gl, incAxis));
	}
    static createMesh(gl, incAxis) {
        //Dynamiclly create a grid
        var verts = [],
            size = 2,            // W/H of the outer box of the grid, from origin we can only go 1 unit in each direction, so from left to right is 2 units max
            div = 10.0,            // How to divide up the grid
            step = size / div,    // Steps between each line, just a number we increment by for each line in the grid.
            half = size / 2;    // From origin the starting position is half the size.

        var p;    //Temp variable for position value.
        for(var i=0; i <= div; i++){
            //Vertical line
            p = -half + (i * step);
            verts.push(p, 0, half);
            verts.push(0.8, 0.8, 0.8);

            verts.push(p, 0, -half);
            verts.push(0.8, 0.8, 0.8);

            //Horizontal line
            p = half - (i * step);
            verts.push(-half, 0, p);
            verts.push(0.8, 0.8, 0.8);

            verts.push(half, 0, p);
			verts.push(0.8, 0.8, 0.8);
        }

        if(incAxis){
            //x axis
            verts.push(-1.1, 0, 0);
            verts.push(1, 0, 0);

            verts.push(1.1, 0, 0);
            verts.push(1, 0, 0);

            //y axis
            verts.push(0, -1.1, 0);
            verts.push(0, 1, 0);

            verts.push(0, 1.1, 0);
            verts.push(0, 1, 0);

            //z axis
            verts.push(0, 0, -1.1);
            verts.push(0, 0, 1);

            verts.push(0, 0, 1.1);
            verts.push(0, 0, 1);
        }

        //Setup
		let mesh = { drawMode:gl.LINES, vao:gl.createVertexArray() };

        //Do some math
        mesh.vertexComponentLen = 6;
        mesh.vertexCount = verts.length / mesh.vertexComponentLen;
        let strideLen = Float32Array.BYTES_PER_ELEMENT * mesh.vertexComponentLen;

        //Setup our Buffer
        mesh.bufVertices = gl.createBuffer();
        gl.bindVertexArray(mesh.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ATTR_POSITION["location"]);
        gl.enableVertexAttribArray(ATTR_COLOR["location"]);

        gl.vertexAttribPointer(ATTR_POSITION["location"], 3, gl.FLOAT, false, strideLen, 0);
        gl.vertexAttribPointer(   ATTR_COLOR["location"], 3, gl.FLOAT, false, strideLen, Float32Array.BYTES_PER_ELEMENT * 3);

        //Cleanup and Finalize
        gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		Globals.MeshCache[this.MESH_NAME()] = mesh;
        return mesh;
    }
}

export { Primitives };
