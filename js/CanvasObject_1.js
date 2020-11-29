/**
 * @fileoverview CanvasObject.js - controls and indicators for online simulators
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
	
	none
*/
								// canvas object types
var OBJECT_BUTTON = 0;
var OBJECT_HORSLIDER = 1;
var OBJECT_TEXT = 2;
								// special fill rectangle
function fillRect(ctx,x0,y0,x1,y1)
{
	ctx.fillRect(x0,y0,x1 - x0 + 1,y1 - y0 + 1);
}
								// initialise
function CanvasObjectInit(object,type,name,left,top,right,bottom)
{
	object.type = type;
	object.active = true;
	object.left = left;
	object.top = top;
	object.right = right;
	object.bottom = bottom;
	object.name = name;
								// for sliders etc.
	object.value = 0.0;
								// background color
	object.background = "#000000";
}

function DrawCanvasObject(object,ctx,color,fontsize)
{
	if (object.type == OBJECT_BUTTON)
	{
								// clear
		ctx.fillStyle = object.background;
		fillRect(ctx,object.left,object.top,object.right,object.bottom);		
								// contour
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.moveTo(object.left,object.top);
		ctx.lineTo(object.left,object.bottom);
		ctx.lineTo(object.right,object.bottom);
		ctx.lineTo(object.right,object.top);
		ctx.lineTo(object.left,object.top);
		ctx.stroke(); 
								// name
		ctx.font = fontsize + "px Arial";
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.textAlign = "center"; 
		ctx.strokeText(object.name,(object.left + object.right) / 2,(object.top + object.bottom) / 2 + fontsize / 2);
	} else if (object.type == OBJECT_HORSLIDER)
	{
								// contour
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.moveTo(object.left,object.top);
		ctx.lineTo(object.left,object.bottom);
		ctx.lineTo(object.right,object.bottom);
		ctx.lineTo(object.right,object.top);
		ctx.lineTo(object.left,object.top);
		ctx.stroke(); 
								// fill part of slider with solid color
		if (object.value < 0.0) object.value = 0.0;						
		if (object.value > 1.0) object.value = 1.0;						
		var x = object.left + (object.right - object.left) * object.value;		

		ctx.fillStyle = color;
		fillRect(ctx,object.left,object.top,x,object.bottom);		
		ctx.fillStyle = object.background;
		fillRect(ctx,x + 1,object.top + 1,object.right - 1,object.bottom - 1);		
	} else if (object.type == OBJECT_TEXT)
	{
		ctx.fillStyle = object.background;
		fillRect(ctx,object.left,object.top,object.right,object.bottom);		
								// name
		if (object.name.length > 0)
		{
			ctx.font = fontsize + "px Arial";
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.textAlign = "left"; 
			ctx.strokeText(object.name,object.left,(object.top + object.bottom) / 2 + fontsize / 2);
		}
	} else
	{
	}
}
                               // draws text at the canvas centre
function DrawCanvasText(canvasname,text,bckcolor,color,font)
{
	var canvas = document.getElementById(canvasname);
	var ctx = canvas.getContext("2d");
							// clear background
	ctx.fillStyle = bckcolor;
	ctx.fillRect(0,0,canvas.width,canvas.height);
							// set font
	ctx.font = font;
	ctx.fillStyle = color;
							// place it at the centre
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	var x = canvas.width / 2;
	var y = canvas.height / 2;
	
	ctx.fillText(text,x,y);
}
