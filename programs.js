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

var ACTION_LEFT  = 0;
var ACTION_RIGHT = 1;
var ACTION_UP    = 2;
var ACTION_DOWN  = 3;
var NUM_ACTIONS  = 4;

/*
N states, one start state
K symbols
4 actions (left, right up, down)

N x K -> N x K x A
*/
function Program(numStates, numSymbols, mapWidth, mapHeight)
{
    assert (
        numStates >= 1,
        'must have at least 1 state'
    );
    
    assert (
        numSymbols >= 2,
        'must have at least 2 symbols'
    );

    /// Number of states and symbols
    this.numStates = numStates;
    this.numSymbols = numSymbols;

    /// Image dimensions
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    /// Transition table
    this.table = new Int32Array(numStates * numSymbols * 3);

    /// Map (2D tape)
    this.map = new Int32Array(mapWidth * mapHeight); 

    // Generate random transitions
    for (var st = 0; st < numStates; ++st)
    {
        for (var sy = 0; sy < numSymbols; ++sy)
        {
            this.setTrans(
                st,
                sy,
                randomInt(0, numStates - 1),
                randomInt(1, numSymbols - 1),
                randomInt(0, NUM_ACTIONS - 1)
            );
        }
    }

    // Initialize the state
    this.reset();
}

Program.prototype.setTrans = function (st0, sy0, st1, sy1, ac1)
{
    var idx = (this.numStates * sy0 + st0) * 3;

    this.table[idx + 0] = st1;
    this.table[idx + 1] = sy1;
    this.table[idx + 2] = ac1;
}

Program.prototype.reset = function ()
{
    /// Start state
    this.state = 0;

    /// Top-left corner
    this.xPos = 0;
    this.yPos = 0;

    /// Iteration count
    this.itrCount = 0;

    // Initialize the image
    for (var i = 0; i < this.map.length; ++i)
        this.map[i] = 0;
}

Program.prototype.toString = function ()
{
    var str = this.numStates + ',' + this.numSymbols;

    for (var i = 0; i < this.table.length; ++i)
        str += ',' + this.table[i];

    return str;
}

Program.fromString = function (str, mapWidth, mapHeight)
{
    console.log(str);

    var nums = str.split(',').map(Number);

    numStates  = nums[0];
    numSymbols = nums[1];

    console.log('num states: ' + numStates);
    console.log('num symbols: ' + numSymbols);

    assert (
        numStates > 0 &&
        numSymbols > 0,
        'invalid input string'
    );

    var prog = new Program(numStates, numSymbols, mapWidth, mapHeight);

    assert (
        prog.table.length === nums.length - 2,
        'invalid transition table length'
    );

    for (var i = 0; i < prog.table.length; ++i)
        prog.table[i] = nums[i+2];

    return prog;
}

Program.prototype.update = function (numItrs)
{
    // N.B. If you ever mutate this.table, then also delete
    // this.update so it'll get regenerated here.
    this.update = eval(generate(this));
    return this.update(numItrs);
}

function generate(program)
{
    var mapWidth  = program.mapWidth;
    var mapHeight = program.mapHeight;
    var numStates = program.numStates;
    var table     = program.table;

    var code = "";
    code += "(function(numItrs) {\n";
    code += "    var map = this.map;\n";
    code += "    var state = this.state;\n";
    code += "    var xPos = this.xPos;\n";
    code += "    var yPos = this.yPos;\n";
    code += "    for (var i = numItrs; 0 < i; --i) {\n";
    code += "        var oldPos = "+mapWidth+" * yPos + xPos;\n";
    code += "        switch ("+numStates+" * map[oldPos] + state) {\n";
    for (var symbol = 0; symbol < program.numSymbols; ++symbol)
    {
        for (var state = 0; state < numStates; ++state)
        {
            var idx = numStates * symbol + state;
            code += "        case "+idx+":\n";
            code += "            state = "+table[3*idx+0]+";\n";
            code += "            map[oldPos] = "+table[3*idx+1]+";\n";
            switch (table[3*idx+2])
            {
            case ACTION_LEFT:
                code += "            xPos += 1; if (xPos >= "+mapWidth+") xPos -= "+mapWidth+";\n";
                break;
            case ACTION_RIGHT:
                code += "            xPos -= 1; if (xPos < 0) xPos += "+mapWidth+";\n";
                break;
            case ACTION_UP:
                code += "            yPos -= 1; if (yPos < 0) yPos += "+mapHeight+";\n";
                break;
            case ACTION_DOWN:
                code += "            yPos += 1; if (yPos >= "+mapHeight+") yPos -= "+mapHeight+";\n";
                break;
            default:
                error('invalid action');
            }
            code += "            break;\n";
        }
    }
    code += "        }\n";
    code += "    }\n";
    code += "    this.state = state;\n";
    code += "    this.xPos = xPos;\n";
    code += "    this.yPos = yPos;\n";
    code += "    this.itrCount += numItrs;\n";
    code += "})";
    return code;
}
