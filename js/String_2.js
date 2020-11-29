/**
 * @fileoverview String.js - string operations
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
	Strings
	
	none
*/
								// pad string from left
String.prototype.lpad = function(ch,length) {
    var str = this;
    while (str.length < length)
        str = ch + str;
    return str;
}
								// pad string from right
String.prototype.rpad = function(ch,length) {
    var str = this;
    while (str.length < length)
        str = str + ch;
    return str;
}
								// e.g. S23W044001001c.vbo2, parsed are
								// ONLY first 7 characters : are lower left
								// corner [lat,lon] is returned
function ParseTerrainFileName(name)
{
	name = name.toUpperCase();
	var lat = parseFloat(name.substr(1,2));
	if (name.charAt(0) == 'S')
		lat = -lat;
	var lon = parseFloat(name.substr(4,3));
	if (name.charAt(3) == 'W')
		lon = -lon;
		
	return [lat,lon];
}
								// make first 7 characters of terrain file name
								// e.g. S23W044
function MakeTerrainFileName(lat,lon)
{
	var NS = (lat < 0.0) ? 'S' : 'N';
	var EW = (lon < 0.0) ? 'W' : 'E';
	lat = Math.abs(lat);
	lon = Math.abs(lon);
	var name = NS + lat.toString().lpad('0',2) + EW + lon.toString().lpad('0',3);
		
	return name;
}
								// return just file name
function JustFileName(name)
{
	var pos0 = name.lastIndexOf('/');
	if (pos0 != -1)
		return name.substr(pos0 + 1);
	var pos1 = name.lastIndexOf('\\');
	return name.substr(pos1 + 1);
}