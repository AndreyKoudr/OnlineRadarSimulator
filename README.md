# OnlineRadarSimulator

Online radar simulator
----------------------
This is a simplified part of my former online radar simulator. This produces a nice fading radar PPI picture
with all marine radar controls (WebGL), the only things missing here being targets and own ship controls (it moves at constant speed with 178 deg course).

Language
--------
Javascript, WebGL

Important problems
------------------
CORS, see

https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default

It means that it is no longer allowed to load binary files from local<B>(!)</B> computer with an http (not https) page.
It means that debugging of Javascripts can be only done with browsers with some "web-security" configuration options turned OFF.
These are two files in the >I>areas</I> folder - they contain Earth surface geometry for an SRTM tile around Rio de Janeiro in
the form convenient to supply data to WebGL.

Format of the files can be understood from FillGLBuffers2() in LoadVBO.js.

The solution (tested in Firefox, Chrome, Opera)
-----------------------------------------------
  <B>Firefox</B>
  
  - go to <I>about:config</I>
  - find <I>privacy.file_unique_origin</I>
  - change it to <I>false</I>
	
  <B>Chrome</B>
  
    C:\Program Files\Google\Chrome\Application>chrome.exe --allow-file-access-from-files
 
 (change directory of chrome.exe).

  <B>Opera</B>  
  
    C:\Users\andre\AppData\Local\Programs\Opera>launcher.exe --allow-file-access-from-files
    
 (change directory of Opera launcher.exe).

    
Tests
-----
- Firefox
- Chrome
- Opera

Licencing
---------
The files Barrett.js, BigInt.js, webgl-utils.js are third-party ones, they contain copyrights of their authors. Other files contain MI Simulators copyright - this is me.



