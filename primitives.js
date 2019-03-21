import { gl, Globals } from "./globals.js"
import { Mesh } from "./mesh.js"
import { Model } from "./model.js"
import { ATTR_POSITION, ATTR_NORMAL, ATTR_UV, ATTR_COLOR } from './shaders/shader.js'

var Primitives = {};

Primitives.Quad = class {
    static MESH_NAME() { return "_Primitives.Quad"; }
    static createModel() {
        let mesh = Globals.MeshCache[this.MESH_NAME()] ||
            Primitives.Quad.createMesh(this.MESH_NAME());
        return new Model(mesh);
    }
    static createMesh(name) {
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

        let mesh = new Mesh(name, 3, 2, indices, verts, null, uvs);
        mesh.disableCull = true;
        mesh.enableBlend = true;
        Globals.MeshCache[name] = mesh;
        return mesh;
    }
}

Primitives.Cube = class {
    static MESH_NAME() { return "_Primitives.Cube"; }
    static createModel() {
        let mesh = Globals.MeshCache[this.MESH_NAME()] ||
            Primitives.Cube.createMesh(this.MESH_NAME(), 1, 1, 1, 0, 0, 0);
        return new Model(mesh);
    }
    static createMesh(name,width,height,depth,x,y,z){
        var w = width*0.5, h = height*0.5, d = depth*0.5;
        var x0 = x-w, x1 = x+w, y0 = y-h, y1 = y+h, z0 = z-d, z1 = z+d;

        /*
        //Starting bottom left corner, then working counter clockwise to create the front face.
        //Backface is the first face but in reverse (3,2,1,0)
        //keep each quad face built the same way to make index and uv easier to assign
        var aVert = [
            x0, y1, z1, 0,    //0 Front
            x0, y0, z1, 0,    //1
            x1, y0, z1, 0,    //2
            x1, y1, z1, 0,    //3

            x1, y1, z0, 1,    //4 Back
            x1, y0, z0, 1,    //5
            x0, y0, z0, 1,    //6
            x0, y1, z0, 1,    //7

            x0, y1, z0, 2,    //7 Left
            x0, y0, z0, 2,    //6
            x0, y0, z1, 2,    //1
            x0, y1, z1, 2,    //0

            x0, y0, z1, 3,    //1 Bottom
            x0, y0, z0, 3,    //6
            x1, y0, z0, 3,    //5
            x1, y0, z1, 3,    //2

            x1, y1, z1, 4,    //3 Right
            x1, y0, z1, 4,    //2
            x1, y0, z0, 4,    //5
            x1, y1, z0, 4,    //4

            x0, y1, z0, 5,    //7 Top
            x0, y1, z1, 5,    //0
            x1, y1, z1, 5,    //3
            x1, y1, z0, 5    //4
        ];

        //Build the index of each quad [0,1,2, 2,3,0]
        var aIndex = [];
        for(var i=0; i < aVert.length / 4; i+=2) aIndex.push(i, i+1, (Math.floor(i/4)*4)+((i+2)%4));

        //Build UV data for each vertex
        var aUV = [];
        for(var i=0; i < 6; i++) aUV.push(0,0,    0,1,  1,1,  1,0);

        //Build Normal data for each vertex
        var aNorm = [
             0, 0, 1,     0, 0, 1,     0, 0, 1,     0, 0, 1,  //Front
             0, 0,-1,     0, 0,-1,     0, 0,-1,     0, 0,-1,  //Back
            -1, 0, 0,    -1, 0, 0,    -1, 0,0 ,    -1, 0, 0,  //Left
             0,-1, 0,     0,-1, 0,     0,-1, 0,     0,-1, 0,  //Bottom
             1, 0, 0,     1, 0, 0,     1, 0, 0,     1, 0, 0,  //Right
             0, 1, 0,     0, 1, 0,     0, 1, 0,     0, 1, 0   //Top
        ]
        */

        var aVert = [
            x1, y0, z0, 0,    //3 posx
            x1, y0, z1, 0,    //2
            x1, y1, z1, 0,    //5
            x1, y1, z0, 0,    //4

            x0, y0, z1, 1,    //7 negx
            x0, y0, z0, 1,    //6
            x0, y1, z0, 1,    //1
            x0, y1, z1, 1,    //0

            x0, y1, z0, 2,    //7 posy
            x1, y1, z0, 2,    //0
            x1, y1, z1, 2,    //3
            x0, y1, z1, 2,    //4

            x0, y0, z1, 3,    //1 negy
            x1, y0, z1, 3,    //6
            x1, y0, z0, 3,    //5
            x0, y0, z0, 3,    //2

            x1, y0, z1, 4,    //4 posz
            x0, y0, z1, 4,    //5
            x0, y1, z1, 4,    //6
            x1, y1, z1, 4,    //7

            x0, y0, z0, 5,    //0 negz
            x1, y0, z0, 5,    //1
            x1, y1, z0, 5,    //2
            x0, y1, z0, 5,    //3
        ];

        //Build the index of each quad [0,1,2, 2,3,0]
        var aIndex = [];
        for(var i=0; i < aVert.length / 4; i+=2) {
            aIndex.push(i, i+1, (Math.floor(i/4)*4)+((i+2)%4));
        }

        //Build UV data for each vertex
        var aUV = [
            1, 0, 0,
            1, 0, 1,
            1, 1, 1,
            1, 1, 0,

            0, 0, 1,
            0, 0, 0,
            0, 1, 0,
            0, 1, 1,

            0, 1, 0,
            1, 1, 0,
            1, 1, 1,
            0, 1, 1,

            0, 0, 1,
            1, 0, 1,
            1, 0, 0,
            0, 0, 0,

            1, 0, 1,
            0, 0, 1,
            0, 1, 1,
            1, 1, 1,

            0, 0, 0,
            1, 0, 0,
            1, 1, 0,
            0, 1, 0,
        ];

        //Build Normal data for each vertex
        var aNorm = [
            -1, 0, 0,    -1, 0, 0,    -1, 0, 0,    -1, 0, 0,  //posx
             1, 0, 0,     1, 0, 0,     1, 0, 0,     1, 0, 0,  //negx
             0,-1, 0,     0,-1, 0,     0,-1, 0,     0,-1, 0,  //posy
             0, 1, 0,     0, 1, 0,     0, 1, 0,     0, 1, 0,  //negy
             0, 0,-1,     0, 0,-1,     0, 0,-1,     0, 0,-1,  //posz
             0, 0, 1,     0, 0, 1,     0, 0, 1,     0, 0, 1,  //negz
        ]

        //let mesh = new Mesh(name, 4, 3, aIndex, aVert, aNorm, aUV);
        let mesh = new Mesh(name, 4, 3, aIndex, aVert, null, aUV);
        mesh.disableCull = true;
        Globals.MeshCache[name] = mesh;
        return mesh;
    }
}

Primitives.GridAxis = class {
    static MESH_NAME() { return "_Primitives.GridAxis"; }
    static createModel(incAxis) {
        return new Model(Globals.MeshCache[this.MESH_NAME()] ||
            Primitives.GridAxis.createMesh(this.MESH_NAME(), incAxis));
    }
    static createMesh(name, incAxis) {
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
            verts.push(-1.0, 0, 0);
            verts.push(1, 0, 0);

            verts.push(1.5, 0, 0);
            verts.push(1, 0, 0);

            //y axis
            verts.push(0, -1.0, 0);
            verts.push(0, 1, 0);

            verts.push(0, 1.5, 0);
            verts.push(0, 1, 0);

            //z axis
            verts.push(0, 0, -1.0);
            verts.push(0, 0, 1);

            verts.push(0, 0, 1.5);
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

        Globals.MeshCache[name] = mesh;
        return mesh;
    }
}

export { Primitives };
