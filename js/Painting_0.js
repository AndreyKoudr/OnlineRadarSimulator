/**
 * @fileoverview Painting.js - painting
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

/*
	Dependency
	
*/

							// load bitmap to canvas
function LoadBitmapToCanvasObject(canvas, filename)
{
	var ctx = canvas.getContext('2d');
	var img = new Image();  
	img.onload = function() 
	{ 
		var dx = (ctx.canvas.width - img.width) / 2;
		var dy = (ctx.canvas.height - img.height) / 2;
		ctx.drawImage(img,dx,dy); 
	}  
	img.src = filename; 
}
							// load bitmap to canvas element
function LoadBitmapToCanvasName(canvasname, filename)
{
	var canvas = document.getElementById(canvasname);
	LoadBitmapToCanvasObject(canvas,filename);
}
