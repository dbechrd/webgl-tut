import { gl, Globals } from "./globals.js"
import { ATTR_POSITION, ATTR_NORMAL, ATTR_UV, ATTR_COLOR } from './shader.js'

class Mesh {
    constructor(name, vertCompLen, uvCompLen, arrIdx, arrPos, arrNorm, arrUV, arrColor) {
        this.drawMode = gl.TRIANGLES;
        this.disableCull = false;
        this.enableBlend = false;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        if (arrIdx !== undefined && arrIdx !== null) {
            this.bufIndex = gl.createBuffer();
            this.indexCount = arrIdx.length;

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrIdx), gl.STATIC_DRAW);
        }

        if (arrPos !== undefined && arrPos !== null) {
            this.bufVertices = gl.createBuffer();
            this.vertexComponentLen = vertCompLen;
            this.vertexCount = arrPos.length / this.vertexComponentLen;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufVertices);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrPos), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_POSITION["location"]);
            gl.vertexAttribPointer(ATTR_POSITION["location"], this.vertexComponentLen,
                gl.FLOAT, false, 0, 0);
        }

        if (arrNorm !== undefined && arrNorm !== null) {
            this.bufNormals = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNormals);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrNorm), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_NORMAL["location"]);
            gl.vertexAttribPointer(ATTR_NORMAL["location"], 3, gl.FLOAT, false, 0, 0);
        }

        if (arrUV !== undefined && arrUV !== null) {
            this.bufUV = gl.createBuffer();
            this.uvComponentLen = uvCompLen;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrUV), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_UV["location"]);
            gl.vertexAttribPointer(ATTR_UV["location"], this.uvComponentLen, gl.FLOAT, false, 0, 0);
        }

        if (arrColor !== undefined && arrColor !== null) {
            this.bufColors = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufColors);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrColor), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_COLOR["location"]);
            gl.vertexAttribPointer(ATTR_COLOR["location"], 3, gl.FLOAT, false, 0, 0);
        }

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (arrIdx !== undefined && arrIdx !== null) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        Globals.MeshCache[name] = this;
    }

    static parseObjText(name, txt) {
        txt = txt.trim() + "\n";  //add newline to be able to access last line in the for loop

        let line;            // Line text from obj file
        let itm;             // Line split into an array
        let ary;             // Itm split into an array, used for faced decoding
        let i;
        let ind;             // used to calculate index of the cache arrays
        let isQuad = false;  // Determine if face is a quad or not
        let aCache = [];     // Cache Dictionary key = itm array element, val = final index of the vertice
        let cVert = [];      // Cache Vertice array read from obj
        let cNorm = [];      // Cache Normal array ...
        let cUV = [];        // Cache UV array ...
        let fVert = [];      // Final Index Sorted Vertice Array
        let fNorm = [];      // Final Index Sorted Normal Array
        let fUV = [];        // Final Index Sorted UV array
        let fIndex = [];     // Final Sorted index array
        let fIndexCnt = 0;   // Final count of unique vertices
        let posA = 0;
        let posB = txt.indexOf("\n", 0);

        while (posB > posA) {
            line = txt.substring(posA, posB).trim();

            switch (line.charAt(0)) {
                //......................................................
                // Cache Vertex Data for Index processing when going through face data
                // Sample Data (x,y,z)
                // v -1.000000 1.000000 1.000000
                // vt 0.000000 0.666667
                // vn 0.000000 0.000000 -1.000000
                case "v":
                    itm = line.split(" "); itm.shift();
                    switch (line.charAt(1)) {
                        case " ": cVert.push(parseFloat(itm[0]), parseFloat(itm[1]), parseFloat(itm[2])); break;  //VERTEX
                        case "t": cUV.push(parseFloat(itm[0]), parseFloat(itm[1])); break;                        //UV
                        case "n": cNorm.push(parseFloat(itm[0]), parseFloat(itm[1]), parseFloat(itm[2])); break;  //NORMAL
                    }
                    break;

                //......................................................
                // Process face data
                // All index values start at 1, but javascript array index start at 0. So need to always subtract 1 from index to match things up
                // Sample Data [Vertex Index, UV Index, Normal Index], Each line is a triangle or quad.
                // f 1/1/1 2/2/1 3/3/1 4/4/1
                // f 34/41/36 34/41/35 34/41/36
                // f 34//36 34//35 34//36
                case "f":
                    itm = line.split(" ");
                    itm.shift();
                    isQuad = false;

                    for (i = 0; i < itm.length; i++) {
                        //--------------------------------
                        //In the event the face is a quad
                        if (i == 3 && !isQuad) {
                            i = 2; //Last vertex in the first triangle is the start of the 2nd triangle in a quad.
                            isQuad = true;
                        }

                        //--------------------------------
                        //Has this vertex data been processed?
                        if (itm[i] in aCache) {
                            fIndex.push(aCache[itm[i]]); //it has, add its index to the list.
                        } else {
                            //New Unique vertex data, Process it.
                            ary = itm[i].split("/");

                            //Parse Vertex Data and save final version ordred correctly by index
                            ind = (parseInt(ary[0]) - 1) * 3;
                            fVert.push(cVert[ind], cVert[ind + 1], cVert[ind + 2]);

                            //Parse Normal Data and save final version ordered correctly by index
                            ind = (parseInt(ary[2]) - 1) * 3;
                            fNorm.push(cNorm[ind], cNorm[ind + 1], cNorm[ind + 2]);

                            //Parse Texture Data if available and save final version ordered correctly by index
                            if (ary[1] != "") {
                                ind = (parseInt(ary[1]) - 1) * 2;
                                fUV.push(cUV[ind],
                                    //(!flipYUV) ? cUV[ind + 1] : 1 - cUV[ind + 1]
                                    cUV[ind + 1]
                                );
                            }

                            //Cache the vertex item value and its new index.
                            //The idea is to create an index for each unique set of vertex data base on the face data
                            //So when the same item is found, just add the index value without duplicating vertex,normal and texture.
                            aCache[itm[i]] = fIndexCnt;
                            fIndex.push(fIndexCnt);
                            fIndexCnt++;
                        }

                        //--------------------------------
                        //In a quad, the last vertex of the second triangle is the first vertex in the first triangle.
                        if (i == 3 && isQuad) fIndex.push(aCache[itm[0]]);
                    }
                    break;
            }

            //Get Ready to parse the next line of the obj data.
            posA = posB + 1;
            posB = txt.indexOf("\n", posA);
        }

        let mesh = new Mesh(name, 3, 2, fIndex, fVert, fNorm, fUV);
        return mesh
    }
}

export { Mesh };
