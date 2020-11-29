/**
 * @fileoverview Ship.js - vehicle for online simulators
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
	
	transform.js
	vectormatrix.js
*/

								// target states
var TARGET_FREE = 0;
var TARGET_ACQUIRE = 1;
var TARGET_SAFE = 2;
var TARGET_DANGEROUS = 3;

var SHIP_AFLOAT = 0;
var SHIP_AGROUND = 1;
var SHIP_COLLIDED = 2;

								// initialise own ship
function ShipInit(ship,name,L,B,T,D,antennaheight,maxspeed,speed,course,x,y,state)
{
	ship.name = name;
	
	ship.L = L;
	ship.B = B;
	ship.T = T;
	ship.D = D;
	
	ship.antennaheight = antennaheight;
								// knots
	ship.maxspeed = maxspeed;
	ship.speed = speed;
								// degrees
	ship.course = course;
	ship.courseup = course;
								// position
	ship.x = x;
	ship.y = y;
	ship.z = 0.0;
								// ship state - afloat...
	ship.state = state;
}
								// initialise target, T - overwater height for radar, D - draft
function TargetInit(target,name,L,B,T,D,antennaheight,maxspeed,speed,course,x,y,state)
{
								// standard ship init
	ShipInit(target,name,L,B,T,D,antennaheight,maxspeed,speed,course,x,y,state);
								// not acquired
	target.radarstate = TARGET_FREE;
	target.acqureendtick = -1;
								// aux flag to exclude not used
	target.flag = true;
								// normal components
	var nx = B / L;
	var ny = Math.sqrt(1.0 - nx * nx);
	var nz = 0.0;
	var L2 = L * 0.5;
	var B2 = B * 0.5;

	target.vertices = [
	 -L2,	0.0,	0.0,   -1.0,	0.0,	nz,
	 0.0,   -B2,	0.0,	0.0,   -1.0,	nz,
	 0.0,	0.0,	  T,	-nx,	-ny,	nz,
	
	 0.0,   -B2,	0.0,	0.0,   -1.0,	nz,
	  L2,   0.0,	0.0,	1.0,    0.0,    nz,
	 0.0,   0.0,	  T,	 nx,	-ny,	nz,

	  L2,   0.0,	0.0,	1.0,	0.0,	nz,
	 0.0,    B2,	0.0,	0.0,	1.0,	nz,
	 0.0,   0.0,	  T,	 nx,	 ny,	nz,
	  
	 0.0,    B2,	0.0,	1.0,	0.0,	nz,
	 -L2,   0.0,	0.0,   -1.0,	0.0,	nz,
	 0.0,   0.0,	  T,	-nx,	 ny,	nz
	];
								// array of time(sec),course,x,y,z; 5 elements per step
	target.wakes = new Array();
}
								// add new element to wake as time(sec),course,x,y,z; 5 elements per step;
								// wakelengthsec - length wake in seconds;
								// wakeaddinterval - new wake is added each wakeaddinterval seconds
function TargetAddWake(target,wakelengthsec,wakeaddinterval,time,course,x,y,z)
{
	if (target.wakes.length == 0)
	{
		target.wakes.push(time);
		target.wakes.push(course);
		target.wakes.push(x);
		target.wakes.push(y);
		target.wakes.push(z);
	} else
	{
		var lasttime = target.wakes[target.wakes.length - 5];
		var dt = time - lasttime;
		if (dt >= wakeaddinterval)
		{
			var starttime = target.wakes[0];
			var endtime = starttime + wakelengthsec;
			if (time > endtime)
			{
				target.wakes.shift();
				target.wakes.shift();
				target.wakes.shift();
				target.wakes.shift();
				target.wakes.shift();
			}
			
			target.wakes.push(time);
			target.wakes.push(course);
			target.wakes.push(x);
			target.wakes.push(y);
			target.wakes.push(z);
		}
	}
}
								// clear target wakes
function TargetClearWakes(target)
{
	target.wakes = [];
}
								// change target parameters such as position/state
function TargetMove(target,speed,course,x,y,state)
{
	target.speed = speed;
	target.course = target.courseup = course;
	target.x = x;
	target.y = y;
	target.state = state;
	target.flag = true;
}
								// apply transform to ship coordinates
function TargetTransform(gl,target,scalecoef,vertexBuffer)
{
								// prepare transform
	var transform = new Object();
	TransformInit(transform);
	TransformResize(transform,scalecoef,scalecoef,scalecoef);
	TransformRotate(transform,0.0,(90.0 - target.course) * Math.PI / 180.0,0.0);
	TransformTranslate(transform,target.x,target.y,target.z);
								// transform coordinates
	var vertexData = new Float32Array(target.vertices);
	var count = 0;
	for (i = 0; i < vertexData.length; i += 6)
	{
		var trans = GetTransform(transform,[vertexData[count],vertexData[count + 1],vertexData[count + 2],1.0]);
		vertexData[count] = trans[0];
		vertexData[count + 1] = trans[1];
		vertexData[count + 2] = trans[2];
		count += 6;
	}
								
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertexData,gl.STATIC_DRAW);
}
								// apply transform to ship coordinates; scaleZcoef can be less than 1.0
								// to lower brilliance for target wakes
function TargetWakeTransform(gl,target,course,x,y,z,scaleZcoef,vertexBuffer)
{
								// prepare transform
	var transform = new Object();
	TransformInit(transform);
	TransformResize(transform,1.0,1.0,scaleZcoef);
	TransformRotate(transform,0.0,(90.0 - course) * Math.PI / 180.0,0.0);
	TransformTranslate(transform,x,y,z);
								// transform coordinates
	var vertexData = new Float32Array(target.vertices);
	var count = 0;
	for (i = 0; i < vertexData.length; i += 6)
	{
		var trans = GetTransform(transform,[vertexData[count],vertexData[count + 1],vertexData[count + 2],1.0]);
		vertexData[count] = trans[0];
		vertexData[count + 1] = trans[1];
		vertexData[count + 2] = trans[2];
		count += 6;
	}
								
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertexData,gl.STATIC_DRAW);
}
								// find target by name; the array must be sorted
								// to use starting index during search
function FindTarget(targets,name,startindex)
{
	for (var i = startindex; i < targets.length; i++)
	{
		if (targets[i].name == name)
		{
			return i;
		}
	}
	
	return -1;
}
								// set flag for all targets
function SetTargetsFlag(targets,flag)
{
	for (var i = 0; i < targets.length; i++)
	{
		targets[i].flag = flag;
	}
}
								// delete (only first) inactive target;
								// others will be deleted next time
function DeleteTargetsUnflagged(targets,flag)
{
	for (var i = 0; i < targets.length; i++)
	{
		if (!targets[i].flag)
		{
			targets.splice(i,1);
			break;
		}	
	}
}

