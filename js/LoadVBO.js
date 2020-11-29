/**
 * @fileoverview LoadVBO.js - loading files by Ajax
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

                              // loading?
var vboLoading = false;
                              // copy binary data from VBO to GL buffers
function FillGLBuffers(gl, buffer, vbo) 
{
    var reader = new DataView(buffer);
    var version = reader.getInt32(4,true);
                              // read only version 1, without 16-bit connectivity
                              // array
    if (version !== 1)
    {
      console.log("Wrong VBO file version " + version);
      alert("Wrong VBO file version " + version);
    };

    var floatsize = reader.getInt32(8,true);
    var numfaces = reader.getInt32(16,true);
    vbo.numVertices = numfaces * 3;
    vbo.numFaces = numfaces;
    var vsize = vbo.numVertices * 6;
	var xmin = reader.getFloat32(20,true);
	var xmax = reader.getFloat32(24,true);
	var ymin = reader.getFloat32(28,true);
	var ymax = reader.getFloat32(32,true);
	var zmin = reader.getFloat32(36,true);
	var zmax = reader.getFloat32(40,true);
	vbo.xmin = xmin;
	vbo.xmax = xmax;
	vbo.ymin = ymin;
	vbo.ymax = ymax;
	vbo.zmin = zmin;
	vbo.zmax = zmax;
	
    console.log("Model loaded, num faces " + numfaces);
    
    vbo.vertexData = new Float32Array(buffer,60,vsize);
                              // copy data to video
    vbo.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vbo.vertexData, gl.STATIC_DRAW);
}
	
function LoadVBO(url, vbo, gl) 
{
		var reader = new FileReader();
		reader.onload = function (e) {
				// binary data
				FillGLBuffers(gl, e, vbo);
		};
		reader.onerror = function (e) {
				// error occurred
				console.log('Error : ' + e.type);
		};
		reader.readAsBinaryString(url);

//    var xhr = new XMLHttpRequest();

//    xhr.onreadystatechange = function () 
//    { 
//        if (xhr.readyState == xhr.DONE) 
//        {
//            if (xhr.status == 200 && xhr.response) 
//            {
//                FillGLBuffers(gl,xhr.response,vbo);
//				vboLoading = false;
//            } else 
//            {
//                console.log("Failed to download:" + xhr.status + " " + xhr.statusText);
//				//alert("File not found");
//            }
//        }
//    } 
	
////	xhr.onprogress = function(event) 
////    {
////		vbo.loaded = event.loaded * 100.0 / vbo.total;
////	}

//    xhr.open("GET",url,true);

//		xhr.responseType = "arraybuffer";	 
//		//xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
//		//xhr.setRequestHeader("Access-Control-Allow-Methods", "GET");
//    xhr.send();
//		vboLoading = true;
}

function LoadVBOWithEvent(url, vbo, gl, scanvas, event) 
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () 
    { 
        if (xhr.readyState == xhr.DONE) 
        {
            if (xhr.status == 200 && xhr.response) 
            {
                FillGLBuffers(gl,xhr.response,vbo);
				vboLoading = false;
							  // call function
				event();			  
				//scanvas.dispatchEvent(event);
            } else 
            {
                console.log("Failed to download:" + xhr.status + " " + xhr.statusText);
				//alert("File not found");
            }
        }
    } 
	
//	xhr.onprogress = function(event) 
//    {
//		vbo.loaded = event.loaded * 100.0 / vbo.total;
//	}

    xhr.open("GET",url,true);

    xhr.responseType = "arraybuffer";	 
    xhr.send();
	vboLoading = true;
}

function LoadVBOsync(url, vbo, gl) 
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);  
    //xhr.responseType = "arraybuffer";	 not supported in sync
    xhr.send();
	
    if (xhr.status == 200 && xhr.response) 
    {
        FillGLBuffers(gl,xhr.response,vbo);
    } else 
	{
        console.log("Failed to download:" + xhr.status + " " + xhr.statusText);
		//alert("File not found");
    } 
}
                              // read VBO file (simple version)
function LoadVBOSimple(url, vbo, gl) 
{
    var xhr = new XMLHttpRequest();
 
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == xhr.DONE) 
        {
            if (xhr.status == 200 && xhr.response) 
            {
                FillGLBuffers(gl,xhr.response,vbo);
            } else 
            {
                console.log("Failed to download : " + xhr.status + " " + xhr.statusText);
            }
        }
    }

    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";   
    xhr.send();
}

function initGL(canvas) 
{
	var gl;
	try 
	{
		gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }) 
			|| canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true }); 
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) 
	{
	}
		
	if (!gl) {
		canvas.display = "GL failed to initialise";
	}

	return gl;
}
						// compile shader
function getShader(gl, id) 
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}
                            // load composite file of bitmaps in BMP format 
							// (.bms) and create textures from them
function FillGLTextures(gl, buffer, header, textures) 
{
    var reader = new DataView(buffer);
	var offset = 0;
							// read header
	var text = "";
	for (var i = 0; i < header.length; i++) {
		text += String.fromCharCode(reader.getUint8(offset));
		offset++;
	}
							// compare actual and required headers
	if (text != header)
		return false;
							// read header section //!!! endianness?
	textures.numentries = reader.getInt16(offset,true);
	offset += 2;
	
	textures.bitmaps = new Array();
	
	for (var i = 0; i < textures.numentries; i++) 
	{
		textures.bitmaps.push(new Object);
	
		var position = reader.getInt32(offset,true);
		offset += 4;
		var length = reader.getInt32(offset,true);
		offset += 4;
							// go to this position and create texture
		var width = reader.getInt32(position + 18,true);					
		var height = reader.getInt32(position + 22,true);	
		height = Math.abs(height);
		textures.bitmaps[i] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D,textures.bitmaps[i]);
		var data = new Uint8Array(buffer,position + 54,length - 54);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,width,height,0,gl.RGB,gl.UNSIGNED_BYTE,data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	
	return true;
}
	
function LoadTextures(url, header, textures, gl) 
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () 
    { 
        if (xhr.readyState == xhr.DONE) 
        {
            if (xhr.status == 200 && xhr.response) 
            {
                FillGLTextures(gl,xhr.response,header,textures);
				vboLoading = false;
            } else 
            {
                console.log("Failed to download:" + xhr.status + " " + xhr.statusText);
				//alert("File not found");
            }
        }
    } 
	
//	xhr.onprogress = function(event) 
//    {
//		vbo.loaded = event.loaded * 100.0 / vbo.total;
//	}

    xhr.open("GET",url,true);

    xhr.responseType = "arraybuffer";	 
    xhr.send();
	vboLoading = true;
}

                              // copy binary data from VBO2 to GL buffers
function FillGLBuffers2(gl, buffer, vbo) 
{
    var reader = new DataView(buffer);
    var version = reader.getInt32(4,true);
                              // read only version 1, without 16-bit connectivity
                              // array
    if (version !== 2)
    {
      console.log("Wrong VBO file version " + version);
      alert("Wrong VBO file version " + version);
    };

    vbo.numStructures = reader.getInt32(16,true);
	vbo.xmin = reader.getFloat32(20,true);
	vbo.xmax = reader.getFloat32(24,true);
	vbo.ymin = reader.getFloat32(28,true);
	vbo.ymax = reader.getFloat32(32,true);
	vbo.zmin = reader.getFloat32(36,true);
	vbo.zmax = reader.getFloat32(40,true);
	vbo.size = reader.getFloat32(44,true);
	
	var offset = 48 + 16;
	
	vbo.structures = new Array();
	
	for (var i = 0; i < vbo.numStructures; i++)
	{
		vbo.structures.push(new Object);
		
		vbo.structures[i].numpatches = reader.getInt32(offset,true); offset += 4;
		vbo.structures[i].xmin = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].xmax = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].ymin = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].ymax = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].zmin = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].zmax = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].size = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].numbitmappatches = reader.getInt32(offset,true); offset += 4;
		vbo.structures[i].numcolorpatches = reader.getInt32(offset,true); offset += 4;
		offset += 16;
								// bitmap patches
		vbo.structures[i].bitmappatches = new Array();
		
		for (var j = 0; j < vbo.structures[i].numbitmappatches; j++)
		{
			vbo.structures[i].bitmappatches.push(new Object);
		
			vbo.structures[i].bitmappatches[j].numtriangles = reader.getInt32(offset,true); offset += 4;
			vbo.structures[i].bitmappatches[j].xmin = reader.getFloat32(offset,true); offset += 4;
			vbo.structures[i].bitmappatches[j].xmax = reader.getFloat32(offset,true); offset += 4;
			vbo.structures[i].bitmappatches[j].ymin = reader.getFloat32(offset,true); offset += 4;
			vbo.structures[i].bitmappatches[j].ymax = reader.getFloat32(offset,true); offset += 4;
			vbo.structures[i].bitmappatches[j].zmin = reader.getFloat32(offset,true); offset += 4;
			vbo.structures[i].bitmappatches[j].zmax = reader.getFloat32(offset,true); offset += 4;
			vbo.structures[i].bitmappatches[j].size = reader.getFloat32(offset,true); offset += 4;
			vbo.structures[i].bitmappatches[j].bitmapindex = reader.getInt32(offset,true); offset += 4;
			offset += 20;
			vbo.structures[i].bitmappatches[j].noNormals = reader.getInt8(offset,true); offset += 1;
			offset += 15;
			vbo.structures[i].bitmappatches[j].vsize = vbo.structures[i].bitmappatches[j].noNormals ? 
				vbo.structures[i].bitmappatches[j].numtriangles * 3 * 5 * 4 :
				vbo.structures[i].bitmappatches[j].numtriangles * 3 * 8 * 4;
			vbo.structures[i].bitmappatches[j].vertexData = new Float32Array(buffer,offset,vbo.structures[i].bitmappatches[j].vsize / 4); 
			vbo.structures[i].bitmappatches[j].vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER,vbo.structures[i].bitmappatches[j].vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,vbo.structures[i].bitmappatches[j].vertexData,gl.STATIC_DRAW);
			offset += vbo.structures[i].bitmappatches[j].vsize;
		}
								// color patches (read single combined patch)
		vbo.structures[i].colorpatch = new Object;
		vbo.structures[i].colorpatch.numtriangles = reader.getInt32(offset,true); offset += 4;
		vbo.structures[i].colorpatch.xmin = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].colorpatch.xmax = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].colorpatch.ymin = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].colorpatch.ymax = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].colorpatch.zmin = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].colorpatch.zmax = reader.getFloat32(offset,true); offset += 4;
		vbo.structures[i].colorpatch.size = reader.getFloat32(offset,true); offset += 4;
		offset += 24;
		vbo.structures[i].colorpatch.noNormals = reader.getInt8(offset,true); offset += 1;
		vbo.structures[i].colorpatch.noColors = reader.getInt8(offset,true); offset += 1;
		offset += 14;
		
		if (vbo.structures[i].numcolorpatches)
		{
			if (vbo.structures[i].colorpatch.noColors)
			{
				vbo.structures[i].colorpatch.vsize = vbo.structures[i].colorpatch.noNormals ?
					vbo.structures[i].colorpatch.numtriangles * 3 * 3 * 4 :
					vbo.structures[i].colorpatch.numtriangles * 3 * 6 * 4;
			} else
			{
				vbo.structures[i].colorpatch.vsize = vbo.structures[i].colorpatch.noNormals ?
					vbo.structures[i].colorpatch.numtriangles * 3 * 7 * 4 :
					vbo.structures[i].colorpatch.numtriangles * 3 * 10 * 4;
			}
			vbo.structures[i].colorpatch.vertexData = new Float32Array(buffer,offset,vbo.structures[i].colorpatch.vsize / 4); 
			vbo.structures[i].colorpatch.vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER,vbo.structures[i].colorpatch.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,vbo.structures[i].colorpatch.vertexData,gl.STATIC_DRAW);
			offset += vbo.structures[i].colorpatch.vsize;
		}
	}
	
    console.log("Model loaded, num structures " + vbo.numStructures);
}
	
function LoadVBO2(url, vbo, gl) 
{
		//let response = await fetch(url);

		//if (response.ok) { // if HTTP-status is 200-299
		//		// get the response body (the method explained below)
		//		let r = await response.arrayBuffer();
		//		FillGLBuffers2(gl, r, vbo);
		//} else {
		//		alert("HTTP-Error: " + response.status);
		//}

		//var reader = new FileReader();
		//reader.onload = function () {
		//		// binary data
		//		FillGLBuffers2(gl, reader.result, vbo);
		//};
		//reader.onerror = function (e) {
		//		// error occurred
		//		console.log('Error : ' + e.type);
		//};
		//reader.readAsArrayBuffer(url);

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () 
    { 
        if (xhr.readyState == xhr.DONE) 
        {
            if (xhr.status == 200 && xhr.response) 
            {
                FillGLBuffers2(gl,xhr.response,vbo);
								vboLoading = false;
            } else 
            {
                console.log("Failed to download:" + xhr.status + " " + xhr.statusText);
				//alert("File not found");
            }
        }
    } 
	
//	xhr.onprogress = function(event) 
//    {
//		vbo.loaded = event.loaded * 100.0 / vbo.total;
//	}

    xhr.open("GET",url,true);

		xhr.responseType = "arraybuffer";	 
		//xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
		//xhr.setRequestHeader("Access-Control-Allow-Methods", "GET");

    xhr.send();
		vboLoading = true;
}

function HandleTextureLoaded(gl, image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); 
  gl.generateMipmap(gl.TEXTURE_2D);
}

function InitTexture(gl, texture, filename) {
  var image = new Image();
  image.onload = function() { HandleTextureLoaded(gl, image, texture); }
  image.src = filename;
}

function LoadBitmapToCanvas(canvasname, filename)
{
	var canvas = document.getElementById(canvasname);
	var ctx = canvas.getContext('2d');
	var img = new Image();  
	img.onload = function() { ctx.drawImage(img,0,0); }  
	img.src = filename; 
}

function InitOffscreenTexture(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function UpdateTexture(gl, texture, image) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}