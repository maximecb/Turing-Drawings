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
    for (var i = 0; i < numItrs; ++i)
    {
        var sy = this.map[this.mapWidth * this.yPos + this.xPos];
        var st = this.state;

        var idx = (this.numStates * sy + st) * 3;
        var st = this.table[idx + 0];
        var sy = this.table[idx + 1];
        var ac = this.table[idx + 2];

        // Update the current state
        this.state = st;

        // Write the new symbol
        this.map[this.mapWidth * this.yPos + this.xPos] = sy;

        // Perform the transition action
        switch (ac)
        {
            case ACTION_LEFT:
            this.xPos += 1;
            if (this.xPos >= this.mapWidth)
                this.xPos -= this.mapWidth;
            break;

            case ACTION_RIGHT:
            this.xPos -= 1;
            if (this.xPos < 0)
                this.xPos += this.mapWidth;
            break;

            case ACTION_UP:
            this.yPos -= 1;
            if (this.yPos < 0)
                this.yPos += this.mapHeight;
            break;

            case ACTION_DOWN:
            this.yPos += 1;
            if (this.yPos >= this.mapHeight)
                this.yPos -= this.mapHeight;
            break;

            default:
            error('invalid action: ' + ac);
        }



        /*
        assert (
            this.xPos >= 0 && this.xPos < this.mapWidth,
            'invalid x position'
        );

        assert (
            this.yPos >= 0 && this.yPos < this.mapHeight,
            'invalid y position'
        );

        assert (
            this.state >= 0 && this.state < this.numStates,
            'invalid state'
        );
        */



        this.itrCount++;
    }
}

