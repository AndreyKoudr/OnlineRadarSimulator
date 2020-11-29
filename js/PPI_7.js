/**
 * @fileoverview PPI.js - Radar PPI
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
	
	math.js
	geo.js
	string.js
	transform.js
	ship.js
*/

								// range rings
var RANGERINGS_OFF = 0;
var RANGERINGS_ON = 1;
								// motion
var MOTION_RELATIVE = 0;
var MOTION_TRUE = 1;
								// heading mode
var HMODE_NUP = 0;
var HMODE_CUP = 1;
var HMODE_HUP = 2;
								// heading line
var HEADINGLINE_OFF = 0;
var HEADINGLINE_ON = 1;
								// ERBL
var EBLVRM_OFF = 0;
var EBLVRM_ON = 1;
								// drawn in dashed line
var EBLVRM_ACTIVE = 2;
								// EBL and VRM are separate
var EBLOFF_VRMON = 3;
var EBLON_VRMOFF = 4;
								// guard zones
var GRD_OFF = 0;
var GRD_ON = 1;
								// drawn in dashed line
var GRD_ACTIVE = 2;
								// ERBL origin type
var FLOAT_OFF = 0;
var FLOAT_ON = 1;
								// bearing type
var BEARING_RELATIVE = 0;
var BEARING_TRUE = 1;
								// to draw PPI scales
var MARK_COEF = 0.01;
var MARK_COEF5 = 0.02;
var MARK_COEF10 = 0.02;
var RINGS_TEXTWIDTH = 10;
								// coefficient to enlarge lengths when drawing
								// on PPI screen
var ENLARGE_COEF = 2.0;
								// exact mile length in metres
var MILE_LENGTH = 1851.8518519;
								// convert knots to m/s
var KNOTS2MS = MILE_LENGTH / 3600.0;
								// check CPA, distance in metres
var TARGETsafedistance = 0.2 * MILE_LENGTH;
								// check TCPA, time in seconds
var TARGETsafetime = 24.0 * 60.0;
								// target vectors
var TARGETvectormode = BEARING_TRUE;
								// target vector length
var TARGETvectorlengthsec = 3.0 * 60.0;
								// min rect size to draw targets
var TARGET_RECTSIZE = 10;


								// radar PPI
function PPIInit(ppi,width,height)
{
								// transform between area x,y and screen coordinates
	ppi.transform = new Object();
	TransformInit(ppi.transform);
								// screen parameters
	ppi.rangerings = RANGERINGS_ON;	
	ppi.motion = MOTION_RELATIVE;
	ppi.headingmode = HMODE_HUP;
	ppi.headingline = HEADINGLINE_ON;
	ppi.bearing = BEARING_RELATIVE;
	
	ppi.centerdx = 0.0;
	ppi.centerdy = 0.0;
	ppi.motionstartx = 0.0;
	ppi.motionstarty = 0.0;
	
	ppi.width = width;
	ppi.height = height;
	
	ppi.range = 4.0 * 1852.0;
	
	ppi.beamwidth = 5.0;
	ppi.beamheight = 20.0;
	
	ppi.cursorx = width / 2;
	ppi.cursory = height / 2;
	ppi.cursorsize = 20;
	
	
	ppi.brilliance = 0.5;
	ppi.color = "#00" + byteToHex(ppi.brilliance * 255) + "00";
	ppi.inactivecolor = "#00" + byteToHex(ppi.brilliance * 127) + "00";
	
	ppi.gain = 0.5;
	ppi.tune = 0.5;
	ppi.sea = 0.0;
	ppi.rain = 0.0;
	ppi.FTC = 0.0;
	
	ppi.targetexpansion = 1.0;
	
	ppi.EV1 = new Object();
	EBLVRMInit(ppi.EV1);
	
	ppi.GZ1 = new Object();
	GuardZoneInit(ppi.GZ1);
	
	ppi.wakes = false;
	ppi.wakelengthsec = 180.0;
	ppi.wakeaddinterval = 2.5;
}

function PPIUpdateTransform(ppi,ship)
{
                              // load identity matrix
  TransformIdentity(ppi.transform);
                              // move to origin
  if (ppi.motion == MOTION_RELATIVE)
  {
    TransformTranslate(ppi.transform,-ship.x + ppi.centerdx,-ship.y + ppi.centerdy,0);
                                // rotate if HUP
    if (ppi.headingmode == HMODE_HUP) TransformRotate(ppi.transform,0,ship.course * CPi,0);
      else if (ppi.headingmode == HMODE_CUP) TransformRotate(ppi.transform,0,ship.courseup * CPi,0);
  } else
  {
    TransformTranslate(ppi.transform,-ppi.motionstartx,-ppi.motionstarty,0);
  }
								// convert to screen coordinates
  TransformResize(ppi.transform,ppi.width / 2.0 / ppi.range,-ppi.height / 2.0 / ppi.range,1.0);
  TransformTranslate(ppi.transform,ppi.width / 2.0,ppi.height / 2.0,0.0);
}
								// convert linear x,y into screen coordinates
function PPIMeters2Screen(ppi,x,y)
{
  var screenpos = GetTransform(ppi.transform,[x,y,0,1]);
  return screenpos;
}
								// convert screen coordinates into linear x,y
function PPIScreen2Meters(ppi,xi,yi)
{
  var pos = GetBackTransform(ppi.transform,[xi,yi,0,1]);
  return pos;
}
								// is PPI centre offset?
function PPICenterOffset(ppi)
{
	return (Math.abs(ppi.centerdx) > 0.001 || Math.abs(ppi.centerdy) > 0.001 || ppi.motion == MOTION_TRUE);
}
								// force angle to 0..360
function TrimAngle(angle)
{
  while (angle < 0.0) angle += 360.0;
  while (angle >= 360.0) angle -= 360.0;
  
  return angle;
}
								// get bearing (degrees) and range (nm)
								// bearingmode is BEARING_...
function GetBearingAndRange(x1,y1,x2,y2,bearingmode,ship)
{
  var dx = x2 - x1;
  var dy = y2 - y1;
  var rangenm = Math.sqrt(dx * dx + dy * dy) / 1852.0;
  var bearing = GetSlopeDeg(dy,dx);

  if (bearingmode == BEARING_RELATIVE)
  {
    bearing -= ship.course;
  }

  bearing = TrimAngle(bearing);
  
  return [bearing,rangenm];
}
								// convert bearing/range to metres
function GetBearingRangeMeters(EBL,VRM,bearingmode,EVx,EVy,ship)
{
  if (bearingmode == BEARING_RELATIVE) EBL += ship.course;

  var x = EVx + VRM * Math.sin(EBL * CPi);
  var y = EVy + VRM * Math.cos(EBL * CPi);
  
  return [x,y];
}


function PPIDrawScale(ppi,ctx,ship)
{
	var testa,markcoef,str,coef;
	var offset = PPICenterOffset(ppi);
	var Sbeam = new Float32Array([ship.x,ship.y,0.0,1.0]);
	
	for (i = 0; i < 360; i += 1)
	{
								// get beam
		var a = i * CPi;
		var Dbeam = new Float32Array([Math.sin(a),Math.cos(a),0.0,1.0]);
								// get mark length
		if ((i % 10) == 0) markcoef = MARK_COEF10;
		  else if ((i % 5) == 0) markcoef = MARK_COEF5;
		  else markcoef = MARK_COEF;

		if (ppi.headingmode == HMODE_HUP)
		{
		  testa = i - Math.round(ship.course);
		} else if (ppi.headingmode == HMODE_CUP)
		{
		  testa = i - Math.round(ship.courseup);
		} else
		{
		  testa = i;
		};
		testa = TrimAngle(testa);
						
		var intr0,intr1;
		var v20,v21;

		var r = ppi.range * (1.0 - 2.0 / ppi.width);
		var t = r;
		if (offset)
		{
			var dx = ppi.centerdx;
			var dy = ppi.centerdy;
			if (ppi.motion == MOTION_TRUE)
			{
				dx = ship.x - ppi.motionstartx;
				dy = ship.y - ppi.motionstarty;
			};
						  // solve quadratic equation
			var a = Dbeam[0] * Dbeam[0] + Dbeam[1] * Dbeam[1];
			var b = 2.0 * (Dbeam[0] * dx + Dbeam[1] * dy);
			var c = dx * dx + dy * dy - r * r;
			t = (-b + Math.sqrt(b * b - 4.0 * a * c)) / (a + a);

			intr0 = Sbeam[0] + Dbeam[0] * t;
			intr1 = Sbeam[1] + Dbeam[1] * t;
		} else
		{
			intr0 = Sbeam[0] + Dbeam[0] * r;
			intr1 = Sbeam[1] + Dbeam[1] * r;
		}
								// another point
		v20 = intr0 + (Sbeam[0] - intr0) * markcoef;
		v21 = intr1 + (Sbeam[1] - intr1) * markcoef;
								// get point 1
		var s1 = PPIMeters2Screen(ppi,intr0,intr1);
								// get point 2
		var s2 = PPIMeters2Screen(ppi,v20,v21);
								// draw mark
		ctx.beginPath();
		ctx.strokeStyle = ppi.color;
		ctx.lineWidth = 1;
		ctx.moveTo(s1[0],s1[1]);
		ctx.lineTo(s2[0],s2[1]);
		ctx.stroke(); 
								// draw text
		if ((i % 10) == 0)
		{
			str = i.toString();
			coef = 1.0 - RINGS_TEXTWIDTH * 3.0 / ppi.width; 
			if (offset)
			{ 
			  intr0 = Sbeam[0] + Dbeam[0] * t * coef;
			  intr1 = Sbeam[1] + Dbeam[1] * t * coef;
			} else
			{
			  intr0 = Sbeam[0] + Dbeam[0] * (ppi.range * coef);
			  intr1 = Sbeam[1] + Dbeam[1] * (ppi.range * coef);
			};
								// get central text point
			var sc = PPIMeters2Screen(ppi,intr0,intr1);
			
			ctx.font = "10px Arial";
			ctx.strokeStyle = ppi.color;
			ctx.lineWidth = 1;
			ctx.textAlign = "center"; 
			ctx.strokeText(str,sc[0],sc[1]);
		}
	}
}

function PPIOffset(ppi)
{
	return (Math.abs(ppi.centerdx) > 1.0 || Math.abs(ppi.centerdy) > 1.0);
}

								// draw ring around point, offsets are measured 
								// from ship position, if text is true, radius
								// value is output
function DrawRing(ppi,ctx,offsetx,offsety,radius,text)
{
								// get centre
	var screencentre = PPIMeters2Screen(ppi,offsetx,offsety);
								// get screen radius
	var r = ctx.canvas.width / 2 * radius / ppi.range;
								// draw
	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.arc(screencentre[0],screencentre[1],r,0,2 * Math.PI);
	ctx.stroke(); 
								// draw text
	if (text)
	{
		var str = radius / 1852.0;
		var x = screencentre[0] + r * 0.7071;
		var y = screencentre[1] - r * 0.7071;
		
		ctx.font = "10px Arial";
		ctx.strokeStyle = ppi.color;
		ctx.lineWidth = 1;
		ctx.textAlign = "center"; 
		ctx.strokeText(str,x,y);
	}
}

function PPIDrawRings(ppi,ctx,ship,numrings)
{
	var dr = ppi.range / numrings;
	var r = dr;
	var num = PPIOffset(ppi) ? numrings : (numrings - 1);
	for (i = 0; i < num; i++)
	{
		DrawRing(ppi,ctx,ship.x,ship.y,r,false);
		r += dr;
	}
}
                              // draw line from offset
function DrawLine(ppi,ctx,offsetx,offsety,angledeg)
{
	var rangeenlarged = ppi.range * ENLARGE_COEF;
                              // get centre
	var point0 = PPIMeters2Screen(ppi,offsetx,offsety);
                              // get second point
	var xx = offsetx + rangeenlarged * Math.sin(angledeg * CPi);
	var yy = offsety + rangeenlarged * Math.cos(angledeg * CPi);
	var point1 = PPIMeters2Screen(ppi,xx,yy);
	
	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.moveTo(point0[0],point0[1]);
	ctx.lineTo(point1[0],point1[1]);
	ctx.stroke(); 

	var result = [point0[0],point0[1],point1[0],point1[1]];
	return result;
};
								// hading line marker
function PPIDrawHeadingLine(ppi,ctx,ship)
{
	DrawLine(ppi,ctx,ship.x,ship.y,ship.course);
}
								// draw cross (for cursor)
function PPIDrawCross(ppi,ctx,x,y,size)
{
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x - size / 2,y);
	ctx.lineTo(x + size / 2,y);
	ctx.stroke(); 
	ctx.beginPath();
	ctx.moveTo(x,y - size / 2);
	ctx.lineTo(x,y + size / 2);
	ctx.stroke(); 
}
								// check cursor position and draw
function PPIDrawCursor(ppi,ctx)
{
								// check position
	var dx = ppi.cursorx - ppi.width / 2;
	var dy = ppi.cursory - ppi.height / 2;
	var r = Math.sqrt(dx * dx + dy * dy);
	if (r > ppi.width / 2)
	{
		ppi.cursorx = ppi.width / 2;
		ppi.cursory = ppi.height / 2;
	}
								// draw
	PPIDrawCross(ppi,ctx,ppi.cursorx,ppi.cursory,ppi.cursorsize);
}
								// init EBL/VRM
function EBLVRMInit(eblvrm)
{
	eblvrm.EV = EBLVRM_OFF;
	eblvrm.EVbearingmode = BEARING_RELATIVE;
	eblvrm.EBL = 0.0;
	eblvrm.VRM = 0.0;
	eblvrm.EVx = 0.0;
	eblvrm.EVy = 0.0;
	eblvrm.EVfloating = FLOAT_OFF;
								// last time it was drawn on screen
	eblvrm.screenx = -1;
	eblvrm.screeny = -1;
}
								// get relative angle
function GetRelativeAngle(ppi,a,ship)
{
  if (ppi.headingmode == HMODE_CUP)
  {
    return a + ship.courseup;
  } else if (ppi.headingmode == HMODE_HUP)
  {
    return a + ship.course;
  } else
  {
    return a + ship.course;
  }
}
								// get angle up screen
function GetUpAngle(ppi,a,ship)
{
  if (ppi.headingmode == HMODE_CUP)
  {
    return a + ship.courseup;
  } else if (ppi.headingmode == HMODE_HUP)
  {
    return a + ship.course;
  } else
  {
    return a;
  }
}
								// convert dynamic to maritime course in degrees
function DynToMarineCourse(coursedeg)
{
	var a = 90.0 - coursedeg;
	return TrimAngle(a);
}
								// convert maritime to dynamic course in degrees
function MarineToDynCourse(coursedeg)
{
	return 90.0 - coursedeg;
}
								// draw EBL/VRM
function PPIDrawEBLVRM(ppi,eblvrm,ctx,ship)
{
	if (eblvrm.EV == EBLVRM_ACTIVE)
	{
		ctx.setLineDash([5,5]);
	} else
	{
		ctx.setLineDash([0,0]);
	}
	
	var angledeg = (eblvrm.EVbearingmode == BEARING_RELATIVE) ? GetRelativeAngle(ppi,eblvrm.EBL,ship) : eblvrm.EBL;						

	if (eblvrm.EVfloating == FLOAT_OFF)
	{
		if (eblvrm.EV == EBLOFF_VRMON)
		{
			DrawRing(ppi,ctx,ship.x,ship.y,eblvrm.VRM,false);
		} else if (eblvrm.EV == EBLON_VRMOFF)
		{
			DrawLine(ppi,ctx,ship.x,ship.y,angledeg);
		} else
		{
			DrawRing(ppi,ctx,ship.x,ship.y,eblvrm.VRM,false);
			DrawLine(ppi,ctx,ship.x,ship.y,angledeg);
		}
	} else
	{
		DrawRing(ppi,ctx,ship.x + eblvrm.EVx,ship.y + eblvrm.EVy,eblvrm.VRM,false);
		DrawLine(ppi,ctx,ship.x + eblvrm.EVx,ship.y + eblvrm.EVy,angledeg);
	}
	
	ctx.setLineDash([0,0]);
								// draw circle at line intersections
								// get second point
	var xx = ship.x + eblvrm.EVx + eblvrm.VRM * Math.sin(angledeg * CPi);
	var yy = ship.y + eblvrm.EVy + eblvrm.VRM * Math.cos(angledeg * CPi);
	var point1 = PPIMeters2Screen(ppi,xx,yy);

	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.arc(point1[0],point1[1],3,0,2 * Math.PI);
	ctx.stroke(); 
	
	eblvrm.screenx = point1[0];
	eblvrm.screeny = point1[1];
}

								// init guard zone
function GuardZoneInit(gz)
{
	gz.GZ = GRD_OFF;
	gz.r1 = 0.0;
	gz.r2 = 0.0;
	gz.angle = 0.0;
	gz.screenx = 0;
	gz.screeny = 0;
}
								// draw guard zone
function PPIDrawGuardZone(ppi,gz,ctx,ship)
{
	if (gz.GZ == GRD_ACTIVE)
	{
		ctx.setLineDash([5,5]);
	} else
	{
		ctx.setLineDash([0,0]);
	}
								// get two points
	xy0 = GetBearingRangeMeters(-gz.angle * 0.5,gz.r2,BEARING_RELATIVE,ship.x,ship.y,ship);
	xy1 = GetBearingRangeMeters(gz.angle * 0.5,gz.r2,BEARING_RELATIVE,ship.x,ship.y,ship);
	
	var point = PPIMeters2Screen(ppi,ship.x,ship.y);
	var point0 = PPIMeters2Screen(ppi,xy0[0],xy0[1]);
	var point1 = PPIMeters2Screen(ppi,xy1[0],xy1[1]);
								// two rays
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(point[0],point[1]);
	ctx.lineTo(point0[0],point0[1]);
	ctx.stroke(); 
	ctx.beginPath();
	ctx.moveTo(point[0],point[1]);
	ctx.lineTo(point1[0],point1[1]);
	ctx.stroke(); 
								// arc between two points
	var r0 = GetUpAngle(ppi,gz.angle * 0.5,ship);
	var r1 = GetUpAngle(ppi,-gz.angle * 0.5,ship);
	var a0 = MarineToDynCourse(r0);
	var a1 = MarineToDynCourse(r1);
	var idx = point0[0] - point[0];
	var idy = point0[1] - point[1];
	var ir = Math.sqrt(idx * idx + idy * idy);
	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.arc(point[0],point[1],ir,a0 * CPi,a1 * CPi);
	ctx.stroke(); 
								// small circle for dragging
	ctx.setLineDash([0,0]);

	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.arc(point1[0],point1[1],3,0,2 * Math.PI);
	ctx.stroke(); 
	
	gz.screenx = point1[0];
	gz.screeny = point1[1];
}
								// get center in pixels
function GetPixelCenter(ppi,target)
{
	var pos = PPIMeters2Screen(ppi,target.x,target.y);
	return pos;
}
								// construct rectangle in pixels
function GetPixelRect(ppi,x,y,size)
{
	var pos = PPIMeters2Screen(ppi,x,y);
	size /= 2;
	return [pos[0] - size,pos[1] - size,pos[0] + size,pos[1] + size];
}
								// get rectangle on PPI screen
function GetPPIRect(ppi,target)
{
  var pixsize = (ppi.width / 2) * target.L / ppi.range;
  if (pixsize < TARGET_RECTSIZE) pixsize = TARGET_RECTSIZE;
  if (pixsize > 100) pixsize = 100;

  return GetPixelRect(ppi,target.x,target.y,pixsize);
}
								// get velocity direction in pixels
function GetPixelDirection(ppi,ship,target)
{
	var rotangle = -target.course;
	if (ppi.motion == MOTION_RELATIVE)
	{
		if (ppi.headingmode == HMODE_HUP) rotangle += ship.course;
		else if (ppi.headingmode == HMODE_CUP) rotangle += ship.courseup;
	} else
	{
		if (ppi.headingmode == HMODE_HUP) rotangle += ship.course;
		else if (ppi.headingmode == HMODE_CUP) rotangle += ship.courseup;
	}
								// y downwards
	rotangle += 180.0;

	var pixdirection = [];
	pixdirection[0] = Math.sin(rotangle * CPi);
	pixdirection[1] = Math.cos(rotangle * CPi);
	pixdirection[2] = 0.0;

	return pixdirection;
}

								// draw as being acquired target (square)
function PPIDrawBeingAcquired(ppi,ctx,target)
{
	var rect = GetPPIRect(ppi,target);
	
	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.moveTo(rect[0],rect[1]);
	ctx.lineTo(rect[0],rect[3]);
	ctx.lineTo(rect[2],rect[3]);
	ctx.lineTo(rect[2],rect[1]);
	ctx.lineTo(rect[0],rect[1]);
	ctx.stroke(); 
}
								// draw as safe target (circle)
function PPIDrawSafe(ppi,ctx,target)
{
	var rect = GetPPIRect(ppi,target);
	var r = (rect[2] - rect[0]) / 2;
	
	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.arc((rect[0] + rect[2]) / 2,(rect[1] + rect[3]) / 2,r,0,2 * Math.PI);
	ctx.stroke(); 
}
                              // draw dangerous target (directed triangle)
function PPIDrawDangerous(ppi,ctx,ship,target)
{
	var center = GetPixelCenter(ppi,target);
	var direction = GetPixelDirection(ppi,ship,target);

	r = GetPPIRect(ppi,target);
	size = r[2] - r[0];

	var back = addVectors(center, vectorByScalar(direction, (- size * 0.5)));
	var for0 = addVectors(center, vectorByScalar(direction, (size * 0.5)));
	var perp = cross(direction,[0.0,0.0,1.0]);
	var left = addVectors(back, vectorByScalar(perp, (size * 0.5)));
	var right = addVectors(back, vectorByScalar(perp, (-size * 0.5)));

  	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.moveTo(for0[0],for0[1]);
	ctx.lineTo(left[0],left[1]);
	ctx.lineTo(right[0],right[1]);
	ctx.lineTo(for0[0],for0[1]);
	ctx.stroke(); 
}
								// draw target speed vector
function PPIDrawTargetVector(ppi,ctx,ship,target)
{
								// starting point
	var center = GetPixelCenter(ppi,target);
								// get own velocity vector
	var ownvector = [0.0,0.0,0.0];
	if (TARGETvectormode == BEARING_RELATIVE) ownvector = vectorByScalar([Math.sin(ship.course * CPi),
		Math.cos(ship.course * CPi),0], ship.speed * KNOTS2MS);
								// get target velocity vector
	var targetvector = vectorByScalar([Math.sin(target.course * CPi),
		Math.cos(target.course * CPi),0], target.speed * KNOTS2MS);
								// get difference
	var relativevector = subtractVectors(targetvector,ownvector);
	var length = vectorLength(relativevector) * TARGETvectorlengthsec;
								// rescale vector to pixels
	relativevector = vectorByScalar(normalize(relativevector),length);	
								// get central point in meters
	var p1 = [target.x,target.y,0.0];	
	var p2 = addVectors(p1,relativevector);
	
	var point2 = PPIMeters2Screen(ppi,p2[0],p2[1]);
	
	ctx.beginPath();
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.moveTo(center[0],center[1]);
	ctx.lineTo(point2[0],point2[1]);
	ctx.stroke(); 
}

								// draw target number
function PPIDrawTargetNumber(ppi,ctx,target,number)
{
	var rect = GetPPIRect(ppi,target);

	var str = number.toString();
	ctx.font = "10px Arial";
	ctx.strokeStyle = ppi.color;
	ctx.lineWidth = 1;
	ctx.textAlign = "left"; 
	ctx.strokeText(str,rect[2],rect[3]);
}
								// get CPA and TCPA, returns [CPA(metres),TCPA(seconds),dangerous];
								// course in degrees, speed in knots; time in seconds
function GetCPA(x1,y1,course1,speed1,x2,y2,course2,speed2,dangerousdist)
{
	speed1 = speed1 * KNOTS2MS;
	speed2 = speed2 * KNOTS2MS;

	var s1 = Math.sin(course1 * CPi);
	var c1 = Math.cos(course1 * CPi);
	var s2 = Math.sin(course2 * CPi);
	var c2 = Math.cos(course2 * CPi);

	var A = s1 * speed1 - s2 * speed2;
	var B = c1 * speed1 - c2 * speed2;

	var denom = A * A + B * B;

	if (denom < 0.0000001)
	{
		return [-1.0,-1.0,false];
	} else
	{
		var tcpa = (A * (x2 - x1) + B * (y2 - y1)) / denom;
		var st1 = speed1 * tcpa;
		var st2 = speed2 * tcpa;

		var p1x = x1 + s1 * st1;
		var p1y = y1 + c1 * st1;

		var p2x = x2 + s2 * st2;
		var p2y = y2 + c2 * st2;

		var dx = p2x - p1x;
		var dy = p2y - p1y;

		var cpa = Math.sqrt(dx * dx + dy * dy);

		var dangerous = false;

		if (tcpa < 0)
		{
		  dangerous = false;
		} else
		{
		  dangerous = (cpa < dangerousdist);
		}

		return [cpa,tcpa,dangerous];
	}
}

