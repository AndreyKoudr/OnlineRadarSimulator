/**
 * @fileoverview Transform.js - coordinate transforms
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
	
	gl-matrix-min.js
	vectormatrix.js
*/
								// initialise
function TransformInit(transform)
{
	transform.M = mat4.create();
	transform.Mback = mat4.create();
	transform.BackTransformReady = false;
	mat4.identity(transform.M);
	mat4.identity(transform.Mback);
}
								// reset to identity matrix
function TransformIdentity(transform)
{
	mat4.identity(transform.M);
	transform.BackTransformReady = false;
}
								// translate by x,y,z
function TransformTranslate(transform,x,y,z)
{
	var temp = mat4.create();
	mat4.identity(temp);
	
	temp[0+3*4] = x;
    temp[1+3*4] = y;
    temp[2+3*4] = z;
	
	mat4.multiply(transform.M,temp,transform.M);
	transform.BackTransformReady = false;
}
								// resize by x,y,z
function TransformResize(transform,x,y,z)
{
	var temp = mat4.create();
	mat4.identity(temp);
	
	temp[0+0*4] = x;
    temp[1+1*4] = y;
    temp[2+2*4] = z;
    temp[3+3*4] = 1.0;

	mat4.multiply(transform.M,temp,transform.M);
	transform.BackTransformReady = false;
}
								// x,y,z are angles (roll,course,different?) in radians
								// y - definitely around Z (course)
function TransformRotate(transform,x,y,z)
{
	var temp = mat4.create();
	mat4.identity(temp);
	
	sincourse = Math.sin(-x);
	coscourse = Math.cos(-x);
	sindifferent = Math.sin(-y);
	cosdifferent = Math.cos(-y);
	sinroll = Math.sin(-z);
	cosroll = Math.cos(-z);
	SBCA = sindifferent*coscourse;
	SBSA = sindifferent*sincourse;

    temp[0+0*4] = cosdifferent*coscourse;
    temp[0+1*4] = sindifferent;
    temp[0+2*4] = cosdifferent*sincourse;

    temp[1+0*4] = -SBCA*cosroll+sincourse*sinroll;
    temp[1+1*4] = cosdifferent*cosroll;
    temp[1+2*4] = -SBSA*cosroll-sinroll*coscourse;

    temp[2+0*4] = -SBCA*sinroll-sincourse*cosroll;
    temp[2+1*4] = cosdifferent*sinroll;
    temp[2+2*4] = -SBSA*sinroll+coscourse*cosroll;

    temp[3+3*4] = 1.0;

	mat4.multiply(transform.M,temp,transform.M);
	transform.BackTransformReady = false;
}
								// apply transform to vec3
function GetTransform(transform,v)
{
	//var r = [0,0,0];
	//mat4.multiplyVec3(transform.M,v,r);
	var r = matrixVectorMultiply(v,transform.M);
	return r;
}
								// apply back transform to vec3
function GetBackTransform(transform,v)
{
	if (!transform.BackTransformReady)
	{
		mat4.invert(transform.Mback,transform.M);
		transform.BackTransformReady = true;
	}

	//var r = [0,0,0];
	//mat4.multiplyVec3(transform.Mback,v,r);
	var r = matrixVectorMultiply(v,transform.Mback);
	return r;
}
