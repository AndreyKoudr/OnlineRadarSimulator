/**
 * @fileoverview PolarGrid.js - polar grid for online simulators
 * @author MI Simulators
 * @version 2.2.0
 */
/* Copyright (c) April 2015, MI Simulators. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

								// Make polar grid of n (along radius) by m (along azimuth)
								// cells (each cell is two triangles) from r0 to r1 with
								// centre at xcentre,ycentre. Cell size increase from r0 with
								// power. Texture coordinates vary from -1 to +1 - it means
								// we need a self-aligned bitmap inited with WRAP_S and WRAP_T 
								// (4 of them will cover whole area)
function CreatePolarVBO(gl,r0,r1,n,m,xcentre,ycentre,power,vbo)
{
	vbo.r0 = r0;
	vbo.r1 = r1;
	vbo.n = n;
	vbo.m = m;
	vbo.xcentre = xcentre;
	vbo.ycentre = ycentre;
	vbo.power = power;
	vbo.numtriangles = n * m * 2;
	vbo.A1 = (r1 - r0) / Math.pow(n,power);
	
	var dr = r1 - r0;
	var da = Math.PI * 2.0 / m;
	
	vbo.vertexData = new Float32Array(vbo.numtriangles * (3 + 3 + 2) * 3); 
								// float count
	var count = 0;
	var tricount = 0;
	for (i = 0; i < n; i++)
	{
		var rmin = r0 + vbo.A1 * Math.pow(i,power);
		var rmax = r0 + vbo.A1 * Math.pow(i + 1,power);

		for (j = 0; j < m; j++)
		{
			var a0 = da * j;
			var a1 = da * (j + 1);
			var smin = Math.sin(a0);
			var cmin = Math.cos(a0);
			var smax = Math.sin(a1);
			var cmax = Math.cos(a1);
								// four vertices
			var x0 = xcentre + rmin * cmin;
			var y0 = ycentre + rmin * smin;
			var x1 = xcentre + rmax * cmin;
			var y1 = ycentre + rmax * smin;
			var x2 = xcentre + rmax * cmax;
			var y2 = ycentre + rmax * smax;
			var x3 = xcentre + rmin * cmax;
			var y3 = ycentre + rmin * smax;
								// four texture coords
			var u0 = (x0 - xcentre) / r1;
			var v0 = (y0 - ycentre) / r1;
			var u1 = (x1 - xcentre) / r1;
			var v1 = (y1 - ycentre) / r1;
			var u2 = (x2 - xcentre) / r1;
			var v2 = (y2 - ycentre) / r1;
			var u3 = (x3 - xcentre) / r1;
			var v3 = (y3 - ycentre) / r1;
								// store two triangles
								// vertex
			vbo.vertexData[count++] = x0;
			vbo.vertexData[count++] = y0;
			vbo.vertexData[count++] = 0.0;
								// normal
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 1.0;
								// texture coords
			vbo.vertexData[count++] = u0;
			vbo.vertexData[count++] = v0;
			
			vbo.vertexData[count++] = x1;
			vbo.vertexData[count++] = y1;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 1.0;
			vbo.vertexData[count++] = u1;
			vbo.vertexData[count++] = v1;
			
			vbo.vertexData[count++] = x2;
			vbo.vertexData[count++] = y2;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 1.0;
			vbo.vertexData[count++] = u2;
			vbo.vertexData[count++] = v2;
			
			tricount++;
								// second triangle
			vbo.vertexData[count++] = x2;
			vbo.vertexData[count++] = y2;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 1.0;
			vbo.vertexData[count++] = u2;
			vbo.vertexData[count++] = v2;
			
			vbo.vertexData[count++] = x3;
			vbo.vertexData[count++] = y3;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 1.0;
			vbo.vertexData[count++] = u3;
			vbo.vertexData[count++] = v3;
			
			vbo.vertexData[count++] = x0;
			vbo.vertexData[count++] = y0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 0.0;
			vbo.vertexData[count++] = 1.0;
			vbo.vertexData[count++] = u0;
			vbo.vertexData[count++] = v0;
			
			tricount++;
		}
	}
	
	vbo.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,vbo.vertexData,gl.STATIC_DRAW);

    console.log("Polar grid created, num triangles " + vbo.numtriangles + " should be equal to " + tricount);
}

function DrawPolarVBO(shaderProgram,gl,vbo,drawnormal,drawtexture)
{
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	if (drawnormal) gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
		else gl.disableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	if (drawtexture) gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
		else gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);

	gl.bindBuffer(gl.ARRAY_BUFFER,vbo.vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,3,gl.FLOAT,false,32,0);
	if (drawnormal) gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,3,gl.FLOAT,false,32,12);
	if (drawtexture) gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,2,gl.FLOAT,false,32,24);

	gl.drawArrays(gl.TRIANGLES,0,vbo.numtriangles * 3);

	gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	gl.disableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
}