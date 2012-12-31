// Default console logging function implementation
if (!window.console) console = {};
console.log = console.log || function() {};
console.warn = console.warn || function() {};
console.error = console.error || function() {};
console.info = console.info || function() {};
print = function (v) { console.log(String(v)); }

// Check for typed array support
if (!this.Int8Array)
{
    console.log('No Int8Array support');
    Int8Array = Array;
}
if (!this.Int32Array)
{
    console.log('No Int32Array support');
    Int32Array = Array;
}
if (!this.Float64Array)
{
    console.log('No Float64Array support');
    Float64Array = Array;
}

/**
Escape a string for valid HTML formatting
*/
function escapeHTML(str)
{
    str = str.replace(/\n/g, '<br>');
    str = str.replace(/ /g, '&nbsp;');
    str = str.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    return str;
}

/**
Encode an array of bytes into base64 string format
*/
function encodeBase64(data)
{
    assert (
        data instanceof Array,
        'invalid data array'
    );

    var str = '';

    function encodeChar(bits)
    {
        //console.log(bits);

        var ch;

        if (bits < 26)
            ch = String.fromCharCode(65 + bits);
        else if (bits < 52)
            ch = String.fromCharCode(97 + (bits - 26));
        else if (bits < 62)
            ch = String.fromCharCode(48 + (bits - 52));
        else if (bits === 62)
            ch = '+';
        else
            ch = '/';

        str += ch;
    }

    for (var i = 0; i < data.length; i += 3)
    {
        var numRem = data.length - i;

        // 3 bytes -> 4 base64 chars
        var b0 = data[i];
        var b1 = (numRem >= 2)? data[i+1]:0
        var b2 = (numRem >= 3)? data[i+2]:0

        var bits = (b0 << 16) + (b1 << 8) + b2;

        encodeChar((bits >> 18) & 0x3F);
        encodeChar((bits >> 12) & 0x3F);

        if (numRem >= 2)
        {
            encodeChar((bits >> 6) & 0x3F);

            if (numRem >= 3)
                encodeChar((bits >> 0) & 0x3F);
            else
                str += '=';
        }
        else
        {
            str += '==';
        }
    }

    return str;
}

// TODO
// TODO: decodeBase64(str)
// TODO

