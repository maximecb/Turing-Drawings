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

/**
Assert that a condition holds true
*/
function assert(condition, errorText)
{
    if (!condition)
    {
        error(errorText);
    }
}

/**
Abort execution because a critical error occurred
*/
function error(errorText)
{
    alert('ERROR: ' + errorText);

    throw errorText;
}

/**
Test that a value is integer
*/
function isInt(val)
{
    return (
        Math.floor(val) === val
    );
}

/**
Test that a value is a nonnegative integer
*/
function isNonNegInt(val)
{
    return (
        isInt(val) &&
        val >= 0
    );
}

/**
Test that a value is a strictly positive (nonzero) integer
*/
function isPosInt(val)
{
    return (
        isInt(val) &&
        val > 0
    );
}

/**
Get the current time in millisseconds
*/
function getTimeMillis()
{
    return (new Date()).getTime();
}

/**
Get the current time in seconds
*/
function getTimeSecs()
{
    return (new Date()).getTime() / 1000;
}

/**
Generate a random integer within [a, b]
*/
function randomInt(a, b)
{
    assert (
        isInt(a) && isInt(b) && a <= b,
        'invalid params to randomInt'
    );

    var range = b - a;

    var rnd = a + Math.floor(Math.random() * (range + 1));

    return rnd;
}

/**
Generate a random boolean
*/
function randomBool()
{
    return (randomInt(0, 1) === 1);
}

/**
Generate a random floating-point number within [a, b]
*/
function randomFloat(a, b)
{
    if (a === undefined)
        a = 0;
    if (b === undefined)
        b = 1;

    assert (
        a <= b,
        'invalid params to randomFloat'
    );

    var range = b - a;

    var rnd = a + Math.random() * range;

    return rnd;
}

/**
Generate a random value from a normal distribution
*/
function randomNorm(mean, variance)
{
	// Declare variables for the points and radius
    var x1, x2, w;

    // Repeat until suitable points are found
    do
    {
    	x1 = 2.0 * randomFloat() - 1.0;
    	x2 = 2.0 * randomFloat() - 1.0;
    	w = x1 * x1 + x2 * x2;
    } while (w >= 1.0 || w == 0);

    // compute the multiplier
    w = Math.sqrt((-2.0 * Math.log(w)) / w);
    
    // compute the gaussian-distributed value
    var gaussian = x1 * w;
    
    // Shift the gaussian value according to the mean and variance
    return (gaussian * variance) + mean;
}

/**
Choose a random argument value uniformly randomly
*/
function randomChoice()
{
    assert (
        arguments.length > 0,
        'must supply at least one possible choice'
    );

    var idx = randomInt(0, arguments.length - 1);

    return arguments[idx];
}

/**
Generate a weighed random choice function
*/
function genChoiceFn()
{
    assert (
        arguments.length > 0 && arguments.length % 2 === 0,
        'invalid argument count: ' + arguments.length
    );

    var numChoices = arguments.length / 2;

    var choices = [];
    var weights = [];
    var weightSum = 0;

    for (var i = 0; i < numChoices; ++i)
    {
        var choice = arguments[2*i];
        var weight = arguments[2*i + 1];

        choices.push(choice);
        weights.push(weight);

        weightSum += weight;
    }

    assert (
        weightSum > 0,
        'weight sum must be positive'
    );

    var limits = [];
    var limitSum = 0;

    for (var i = 0; i < weights.length; ++i)
    {
        var normWeight = weights[i] / weightSum;

        limitSum += normWeight;

        limits[i] = limitSum;
    }

    function choiceFn()
    {
        var r = Math.random();

        for (var i = 0; i < numChoices; ++i)
        {
            if (r < limits[i])
                return choices[i];
        }

        return choices[numChoices-1];
    }

    return choiceFn;
}

/**
Left-pad a string to a minimum length
*/
function leftPadStr(str, minLen, padStr)
{
    if (padStr === undefined)
        padStr = ' ';

    var str = String(str);

    while (str.length < minLen)
        str = padStr + str;

    return str;
}

/**
Resample and normalize an array of data points
*/
function resample(data, numSamples, outLow, outHigh, inLow, inHigh)
{
    // Compute the number of data points per samples
    var ptsPerSample = data.length / numSamples;

    // Compute the number of samples
    var numSamples = Math.floor(data.length / ptsPerSample);

    // Allocate an array for the output samples
    var samples = new Array(numSamples);

    // Extract the samples
    for (var i = 0; i < numSamples; ++i)
    {
        samples[i] = 0;

        var startI = Math.floor(i * ptsPerSample);
        var endI = Math.min(Math.ceil((i+1) * ptsPerSample), data.length);
        var numPts = endI - startI;

        for (var j = startI; j < endI; ++j)
            samples[i] += data[j];

        samples[i] /= numPts;
    }    

    // If the input range is not specified
    if (inLow === undefined && inHigh === undefined)
    {
        // Min and max sample values
        var inLow = Infinity;
        var inHigh = -Infinity;

        // Compute the min and max sample values
        for (var i = 0; i < numSamples; ++i)
        {
            inLow = Math.min(inLow, samples[i]);
            inHigh = Math.max(inHigh, samples[i]);
        }
    }

    // Compute the input range
    var iRange = (inHigh > inLow)? (inHigh - inLow):1;

    // Compute the output range
    var oRange = outHigh - outLow;

    // Normalize the samples
    samples.forEach(
        function (v, i) 
        {
            var normVal = (v - inLow) / iRange;
            samples[i] =  outLow + (normVal * oRange);
        }
    );

    // Return the normalized samples
    return samples;
}

