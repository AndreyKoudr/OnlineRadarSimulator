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
	Math
	
	none
*/
								// Const
var NEARLY_ZERO = 0.000001;
								// Pi / 180.0
var CPi = Math.PI / 180.0;
								// 180.0 / Pi
var PCi = 180.0 / Math.PI;

								// Compute slope of Y on X in radians
function GetSlope(Xt,Yt)
{
  if (Math.abs(Xt) > NEARLY_ZERO)
    {
      if (Xt > 0) return Math.atan(Yt / Xt); 
		else return (Math.atan(Yt / Xt) + Math.PI);
    }
      else
    {
      if (Yt > 0) return Math.PI * 0.5; 
		else return -Math.PI * 0.5;
    }
}
								// Compute slope of Y on X in degrees
function GetSlopeDeg(Xt,Yt)
{
  return (GetSlope(Xt,Yt) * PCi);
}

								// Convert byte to hex
var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"]; 
function byteToHex(b) {
	return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
} 
