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
Generate a new random program
*/
function randomProg()
{
    var numStates = parseInt(document.getElementById("numStates").value);
    var numSymbols = parseInt(document.getElementById("numSymbols").value);

    assert (
        numSymbols <= colorMap.length,
        colorMap.length + ' states currently supported'
    );

    console.log('num states: ' + numStates);
    console.log('num symbols: ' + numSymbols);

    program = new Program(numStates, numSymbols, canvas.width, canvas.height);

    // Set the sharing URL
    var str = program.toString();
    var url = location.protocol + '//' + location.host + location.pathname;
    var shareURL = url + '#' + str;
    document.getElementById("shareURL").value = shareURL;
}

/**
Reset the program state
*/
function restartProg()
{
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
    255,0  ,0  ,    // Initial symbol color
    0  ,0  ,0  ,    // Black
    255,255,255,    // White
    0  ,255,0  ,    // Green
    0, ,0, ,255,    // Blue
    255,255,0  ,
    0  ,255,255,
    255,0  ,255,
];

/***
Time per update, in milliseconds
*/
const UPDATE_TIME = 40;

/**
Update the rendering
*/
function updateRender()
{
    const width = canvas.width;
    const height = canvas.height

    var startTime = (new Date()).getTime();

    // Until the update time is exhausted
    for (;;)
    {
        // Update the program
        program.update(5000);

        var curTime = (new Date()).getTime();
        if (curTime - startTime >= UPDATE_TIME)
            break;
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

