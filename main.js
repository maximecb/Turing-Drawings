/*****************************************************************************
*
*  This file is part of the Turing-Drawings project. The project is
*  distributed at:
*  https://github.com/maximecb/Turing-Drawings
*
*  Copyright (c) 2012, Maxime Chevalier-Boisvert. All rights reserved.
*
*  This software is licensed under the following license (Modified BSD
*  License):
*
*  Redistribution and use in source and binary forms, with or without
*  modification, are permitted provided that the following conditions are
*  met:
*   1. Redistributions of source code must retain the above copyright
*      notice, this list of conditions and the following disclaimer.
*   2. Redistributions in binary form must reproduce the above copyright
*      notice, this list of conditions and the following disclaimer in the
*      documentation and/or other materials provided with the distribution.
*   3. The name of the author may not be used to endorse or promote
*      products derived from this software without specific prior written
*      permission.
*
*  THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED
*  WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
*  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
*  NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
*  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
*  NOT LIMITED TO PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
*  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
*  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
*  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
*****************************************************************************/

//============================================================================
// Page interface code
//============================================================================

/**
Called after page load to initialize needed resources
*/
function init()
{
    // Get a reference to the canvas
    canvas = document.getElementById("canvas");

    // Set the canvas size
    canvas.width = 512;
    canvas.height = 512;

    // Get a 2D context for the drawing canvas
    canvas.ctx = canvas.getContext("2d");

    // Create an image data array
    canvas.imgData = canvas.ctx.createImageData(canvas.width, canvas.height);

    // If a location hash is specified
    if (location.hash !== '')
    {
        console.log('parsing program');

        program = Program.fromString(
            location.hash.substr(1),
            canvas.width,
            canvas.height
        );
    }
    else
    {
        // Create a random program
        randomProg();
    }

    // Set the update function to be called regularly
    updateInterv = setInterval(
        updateRender,
        UPDATE_TIME
    );
}
window.addEventListener("load", init, false);

/**
Pause the program
*/
function pauseProg()
{
    if(updateInterv)
    {
        clearInterval(updateInterv);
        updateInterv = false;
    }
    else
    {
        updateInterv = setInterval(
            updateRender,
            UPDATE_TIME
        );
    }
}

/**
Generate a new random program
*/
function randomProg()
{
    var numStates = parseInt(document.getElementById("numStates").value);
    var numSymbols = parseInt(document.getElementById("numSymbols").value);

    assert (
        numSymbols <= colorMap.length / 3,
        colorMap.length / 3 + ' symbols currently supported'
    );

    console.log('num states: ' + numStates);
    console.log('num symbols: ' + numSymbols);

    program = new Program(numStates, numSymbols, canvas.width, canvas.height);

    // Set the sharing URL
    var str = program.toString();
    var url = location.protocol + '//' + location.host + location.pathname;
    var shareURL = url + '#' + str;
    document.getElementById("shareURL").value = shareURL;

    // Clear the current hash tag to avoid confusion
    location.hash = '';
}

/**
Reset the program state
*/
function restartProg()
{
    UPDATE_TIME = parseInt(document.getElementById("updateInterval").value);
    UPDATE_ITRS = parseInt(document.getElementById("updateIters").value);

    if(UPDATE_TIME == NaN || UPDATE_TIME < 1)
        UPDATE_TIME = 40;

    if(UPDATE_ITRS == NaN || UPDATE_ITRS < 1)
        UPDATE_ITRS = 350000;

    if(updateIterv)
        clearInterval(updateInterv);
    updateInterv = setInterval(
        updateRender,
        UPDATE_TIME
    );
    program.reset();
}

// Default console logging function implementation
if (!window.console) console = {};
console.log = console.log || function(){};
console.warn = console.warn || function(){};
console.error = console.error || function(){};
console.info = console.info || function(){};

//============================================================================
// Image update code
//============================================================================

/**
Map of symbols (numbers) to colors
*/
var colorMap = [
    255,0  ,0  ,    // Initial symbol color / Red
    0  ,0  ,0  ,    // Black
    255,255,255,    // White
    0  ,255,0  ,    // Green
    0  ,0  ,255,    // Blue
    255,255,0  ,    // Yellow
    0  ,255,255,    // Cyan
    255,0  ,255    // Purple
];

/***
Time per update, in milliseconds
*/
var UPDATE_TIME = 40;

/**
Maximum iterations per update
*/
var UPDATE_ITRS = 350000;

/**
Update the rendering
*/
function updateRender()
{
    var startTime = (new Date()).getTime();
    var startItrc = program.itrCount;

    // Until the update time is exhausted
    while (program.itrCount - startItrc < UPDATE_ITRS &&
            (new Date()).getTime() - startTime < UPDATE_TIME)
    {
        // Update the program
        program.update((UPDATE_ITRS - (program.itrCount - startItrc) > 5000)?5000:(UPDATE_ITRS - (program.itrCount - startItrc)));
    }

    /*
    console.log(
        'x: ' + program.xPos + 
        ', y: ' + program.yPos + 
        ', st: ' + program.curState +
        ', cc: ' + program.itrCount
    );
    */

    // Produce the image data
    var data = canvas.imgData.data;
    var map = program.map;
    for (var i = 0; i < map.length; ++i)
    {
        var sy = map[i];

        var r = colorMap[3 * sy + 0];
        var g = colorMap[3 * sy + 1];
        var b = colorMap[3 * sy + 2];

        data[4 * i + 0] = r;
        data[4 * i + 1] = g;
        data[4 * i + 2] = b;
        data[4 * i + 3] = 255;
    }

    assert (
        program.map.length * 4 === data.length,
        'invalid image data length'
    );

    // Show the image data
    canvas.ctx.putImageData(canvas.imgData, 0, 0);
}

