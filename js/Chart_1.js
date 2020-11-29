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
	
	geo.js
	transform.js
*/

								// chart
function ChartInit(chart,name,latmin,lonmin,latmax,lonmax,width,height)
{
	if (name.length > 0)
	{
		if (name.length == 7)
			name = name + "001001";
		else if (name.length > 13)
			name = name.substr(0,13);
		chart.name = name;
	}
	chart.latmin = latmin;
	chart.lonmin = lonmin;
	chart.latmax = latmax;
	chart.lonmax = lonmax;
	chart.width = width;
	chart.height = height;
	chart.cursorx = width / 2;
	chart.cursory = height / 2;
	chart.cursorsize = 20;
	chart.cursorcolor = "#00FF00";
								// screen parameters
	chart.flatcoord = new Object();
	FlatCoordInit(chart.flatcoord,(latmin + latmax) * 0.5,(lonmin + lonmax) * 0.5);
								// transform between x,y and screen coordinates
	chart.transform = new Object();
	TransformInit(chart.transform);
								// set xmin,ymin,xmax,ymax for whole area
	ChartUpdateTransform(chart,latmin,lonmin,latmax,lonmax);
}
								// update transform parameters, lat/lon min/max must be
								// within whole chart
function ChartUpdateTransform(chart,latmin,lonmin,latmax,lonmax)
{
								// get linear corner coordinates
	var xy = LatLon2XY(chart.flatcoord,latmin,lonmin);
	chart.xmin = xy[0];
	chart.ymin = xy[1];
	xy = LatLon2XY(chart.flatcoord,latmax,lonmax);
	chart.xmax = xy[0];
	chart.ymax = xy[1];
								// load identity matrix
	TransformIdentity(chart.transform);
								// convert to screen coordinates
	var dx = chart.xmax - chart.xmin;
	var dy = chart.ymax - chart.ymin;
	var cx = (chart.xmax + chart.xmin) * 0.5;
	var cy = (chart.ymax + chart.ymin) * 0.5;
	TransformTranslate(chart.transform,-cx,-cy,0);
	TransformResize(chart.transform,chart.width / dx,-chart.height / dy,1.0);
	TransformTranslate(chart.transform,chart.width / 2.0,chart.height / 2.0,0.0);
								// check cursor coordinates, move cursor inside if
								// it is currently out
	var xy = ChartScreen2XY(chart,chart.cursorx,chart.cursory);
	if (xy[0] < chart.xmin || xy[0] > chart.xmax || xy[1] < chart.ymin || xy[1] > chart.ymax)
	{
		chart.cursorx = chart.width / 2;
		chart.cursory = chart.height / 2;
	}
}
								// convert x/y into screen coordinates
function ChartXY2Screen(chart,x,y)
{
	var screenpos = GetTransform(chart.transform,[x,y,0,1]);
	return screenpos;
}
								// convert screen coordinates into x/y
function ChartScreen2XY(chart,xi,yi)
{
	var pos = GetBackTransform(chart.transform,[xi,yi,0,1]);
	return pos;
}
								// convert lat/lon into screen coordinates
function ChartLatLon2Screen(chart,lat,lon)
{
	var xy = LatLon2XY(chart.flatcoord,lat,lon);
	var screenpos = GetTransform(chart.transform,[xy[0],xy[1],0,1]);
	return screenpos;
}
								// convert screen coordinates into lat/lon
function ChartScreen2LatLon(chart,xi,yi)
{
	var pos = GetBackTransform(chart.transform,[xi,yi,0,1]);
	var latlon = XY2LatLon(chart.flatcoord,pos[0],pos[1]);
	return latlon;
}
