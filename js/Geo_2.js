/**
 * @fileoverview Math.js - math routines
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
	String.js

	none
*/
								// 53°34.034'N into [53,34.034,"N"]
function SplitLat(value)
{
	var letter = "N";
	if (value < 0.0)
		letter = "S";
	value = Math.abs(value);
	var deg = Math.floor(value);
	var min = (value - deg) * 60.0;
	var result = [deg,min,letter];
	return result;
}
								// 053°34.034'E into [53,34.034,"E"]
function SplitLon(value)
{
	var letter = "E";
	if (value < 0.0)
		letter = "W";
	value = Math.abs(value);
	var deg = Math.floor(value);
	var min = (value - deg) * 60.0;
	var result = [deg,min,letter];
	return result;
}
								// make lat/lon value from deg/min/letter split
function LatLonFromSplit(deg,min,letter)
{
	var neg = (letter == 'S' || letter == 's' || letter == 'W' || letter == 'w');
	var value = (deg + min / 60.0) * (neg ? -1.0 : 1.0);
}
								// 53°34.034'N
function LatString(value)
{
	var split = SplitLat(value);
	var result = String(split[0]).lpad("0",2) + String('\xB0') + split[1].toFixed(3).lpad("0",6) + "'" + split[2];
	return result;
}
								// 053°34.034'E
function LonString(value)
{
	var split = SplitLon(value);
	var result = String(split[0]).lpad("0",3) + String('\xB0') + split[1].toFixed(3).lpad("0",6) + "'" + split[2];
	return result;
}
								// init flat geodetic coordinates
function FlatCoordInit(flatcoord,lat,lon)
{
	lat = lat * 60.0;
	lon = lon * 60.0;

    flatcoord.CentreLat = lat;
    flatcoord.CentreLon = lon;

    var latangle = (lat * 0.01666666666667) * Math.PI / 180.0;
    flatcoord.CentreCos = Math.cos(latangle);
    flatcoord.CosMileLength = 1851.8518519 * flatcoord.CentreCos;
    flatcoord.LatCentreBase = GetDLat(lat);
}
								// aux functions
function GetDLat(lat)
{
	return Math.log(Math.tan((lat * 0.5 + 2700.0) * Math.PI / 10800.0)) * 10800.0 / Math.PI;
}

function GetDY(lat)
{
  return (Math.atan(Math.exp(lat * Math.PI / 10800.0)) * 10800.0 / Math.PI - 2700.0) * 2.0;
}
								// lat,lon to x,y
function LatLon2XY(flatcoord,lat,lon)
{
	lat = lat  * 60.0;
	lon = lon  * 60.0;
	var dlat = GetDLat(lat) - flatcoord.LatCentreBase;
	var dlon = lon - flatcoord.CentreLon;
		 
	var x = dlon * flatcoord.CosMileLength;
	var y = dlat * flatcoord.CosMileLength;
	
	return [x,y];
}
								// x,y to lat,lon
function XY2LatLon(flatcoord,x,y)
{
	var lat = GetDY((y / flatcoord.CosMileLength) + flatcoord.LatCentreBase);
	var lon = (x / flatcoord.CosMileLength) + flatcoord.CentreLon;
	
	return [lat * 0.01666666666667,lon * 0.01666666666667];
}

