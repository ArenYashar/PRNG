                                                                        /* jslint bitwise: true, browser: true, node: true, white: true */ /* global ActiveXObject: false */ 'use strict'; // prng.js //
// Purpose:     Define a Psuedorandom Number Generator                                                                                                                                 Version 0.9.1a //
// Metrics:     There are 34 functions in this file.                                                                                                                                                  //
//              Function with the largest signature take 3 arguments, while the median is 1.                                                                                                          //
//              Largest function has 51 statements in it, while the median is 15.                                                                                                                     //
//              The most complex function has a cyclomatic complexity value of 12 while the median is 5.5.                                                                                            //
//              71,149 bytes                                                                                                                                                                          //
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //

// --- Used for loading the given and surnames data...we can eliminate this function by hardcoding the data into PRNG but that makes it harder to update and can cause issues with loading the js --- //
    // file in the editor.  So we use loadfile instead for this purpose.                                                                                                                              //
   var loadfile = function (filename, async)
   {if ("undefined" === typeof(async)) {async = false;}
    var reader = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
        reader.open('GET', filename, async);
        reader.onloadend = function () {return reader.responseText;}; // Lost to /dev/null while the program executes without this data.  Unacceptable!
        reader.overrideMimeType('text/plain');
        try {reader.send();}
        catch (e) {return null;}
    if (!async) {return reader.responseText;}
    //TODO: Find some way to delay execution without generating an infinite loop (good luck - we cannot use a while loop for this)
    //TODO: Extract reader.responseText from within reader.onloadend() (probably by invoking a global temp object to shift the data out of onloadend()).
    return undefined;};

// -------------------------------------------------------------------------------------------- Shimcode -------------------------------------------------------------------------------------------- //
   if ('undefined' === typeof(Math)) {var Math = Object.create(null);}
   if ('undefined' === typeof(Math.gcd)) //TODO: Write an original form of this function instead of relying on foreign code.
   {Math.gcd = function (a) // Original Code copied from: http://jsfromhell.com/math/mdc --- Written by: Jonas Raoni Soares Silva [rev. #1]
    {if(!a.length)return 0;for(var b,c,d=a.length-1,e=a[d];d;)for(c=a[--d];b=c%e;c=e,e=b);return e; /* Minified using https://jscompress.com/ */ };}

// ------------------------------------------------------------------------------ Psuedorandom Number Generator Object ------------------------------------------------------------------------------ //
   var PRNG = function ()
   {this.CRYPTO = window.crypto || window.msCrypto;

    // -------------------------------------------------------------------------------------------------------------------------------------------------------- Predefinitions and Dependancy Tree //
       PRNG.prototype.valueOf =                 undefined;
         PRNG.prototype.biasedcoin =            undefined;
         PRNG.prototype.boolean =               undefined;
           PRNG.prototype.coin =                undefined;
         PRNG.prototype.integer =               undefined;
           PRNG.prototype.color =               undefined;
           PRNG.prototype.decimal =             undefined;
           PRNG.prototype.die =                 undefined;
             PRNG.prototype.dice =              undefined;
             PRNG.prototype.loadeddie =         undefined;
               PRNG.prototype.loadeddice =      undefined;
               PRNG.prototype.weightedelement = undefined;
             PRNG.prototype.srdie =             undefined;
               PRNG.prototype.srdice =          undefined;
           PRNG.prototype.element =             undefined;
             PRNG.prototype.shuffle =           undefined;
               PRNG.prototype.elements =        undefined;
               PRNG.prototype.givenname =       undefined;
               PRNG.prototype.surname =         undefined;
                 PRNG.prototype.fullname =      undefined;
           PRNG.prototype.time =                undefined;
         PRNG.prototype.toImage =               undefined;
         PRNG.prototype.toPinkNoise =           undefined;
         PRNG.prototype.toString =              undefined;
           PRNG.prototype.toLocaleString =      undefined;

/**/
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- Function Definitions //
       PRNG.prototype.valueOf = function ()
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var sources = '0'; // Method A has been depreciated
           sources += ('undefined' !== typeof(this.CRYPTO)) ? '1' : '0'; // Do we support crypto.getRandomValues()
           sources += ('object' === typeof(Math) || 'function' === typeof(Math.random)) ? '1' : '0'; // Do we support Math.random()
           if (-1 === sources.indexOf('1')) {throw new Error(name + ' cannot be successfully invoked without a source of psuedorandomness.');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Nothing to sanity check

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = 0, source = 0;
           // Method A: crypto.getRandomValues() implementation depreciated as it provides only 32-bit precision
           if ('1' === sources[source]) {output += this.CRYPTO.getRandomValues(new Uint32Array(1))[0] / Math.pow(2, 32);}
           source += 1;
           // Method B: crypto.getRandomValues() implementation providing the full mantissa for a 64-bit double precision floating point
           if ('1' === sources[source])
           {var temp = this.CRYPTO.getRandomValues(new Uint32Array(2));
            output += ((temp[0] * Math.pow(2,20)) + (temp[1] >>> 12)) * Math.pow(2, -52);
           }
           source += 1;
           // Method C: Math.random() implementation that cannot be trusted to provide cryptographically secure output
           if ('1' === sources[source]) {output += Math.random();}
           source += 1;
           output = output % 1;

        // Sanity Checking - Output: Must conform to a 64-bit double precision number (IEEE 754) within the range of 0 (inclusive) to 1 (exclusive).
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' === typeof(output)) {if (0 <= output && output < 1) {return output;}}
           console.info('WARNING: ' + name + ' generated an erroneous value of ' + output + ' using sources [' + sources + '].  ' +
                                      'Recursing for a replacement value.');
           return this.valueOf();};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.biasedcoin = function (heads)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.valueOf)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.valueOf().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(heads)) {throw new TypeError(name + ' requires a number as a parameter giving the percentage probability of heads results.');}
           if (100 < heads)                {throw new RangeError(name + ' requires a probability less than or equal to 100%.');}
           if (  0 > heads)                {throw new RangeError(name + ' requires a probability greater than or equal to 0%.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = 'Tails';
           if ((heads / 100) >= this.valueOf()) {output = 'Heads';}

        // Sanity Checking - Outputs: Must conform to a string, either Heads or Tails.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' === typeof(output)) {if ('Heads' !== output || 'Tails' !== output) {return output;}}
           console.info('WARNING: ' + name + ' generated a result of ' + output + ' which is not valid.  ' +
                                      'Recursing for a replacement result.');
           return this.biasedcoin();};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.boolean = function ()
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.valueOf)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.valueOf().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Nothing to sanity check

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = 1 === Math.floor(this.valueOf() * 2);

        // Sanity Checking - Outputs: Must conform to a boolean value.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('boolean' === typeof(output)) {return output;}
           console.info('WARNING: ' + name + ' generated a result of ' + output + ' which is not a valid boolean.  ' +
                                      'Recursing for a replacement result.');
           return this.boolean();};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.coin = function ()
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.boolean)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.boolean().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Nothing to sanity check

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = this.boolean() ? 'Heads' : 'Tails';

        // Sanity Checking - Outputs: Must conform to a string, either Heads or Tails.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' === typeof(output)) {if ('Heads' !== output || 'Tails' !== output) {return output;}}
           console.info('WARNING: ' + name + ' generated a result of ' + output + ' which is not valid.  ' +
                                      'Recursing for a replacement result.');
           return this.coin();};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.integer = function (min, max)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.valueOf)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.valueOf().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(min)) {throw new TypeError(name + ' requires a minimum bound.');} else {min = Math.floor(min);}
           if ('number' !== typeof(max)) {throw new TypeError(name + ' requires a maximum bound.');} else {max = Math.floor(max);}
           if (isNaN(min) || isNaN(max)) {throw new RangeError(name + ' requires numeric bounds.  Was called with [' + min + ', ' + max + ']');}
           if (min > max) {throw new RangeError(name + ' requires a minimum bound [' + min + '] that is less than the maximum bound [' + max + '].');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = Math.floor(this.valueOf() * (max - min + 1)) + min;

        // Sanity Checking - Outputs: Must conform to an integer between min (inclusive) and max (inclusive).
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' === typeof(output)) {if (min <= output && output <= max) {return output;}}
           console.info('WARNING: ' + name + ' generated a result ' + output + ' which is not within the supplied bounds [' + min + ' - ' + max + '].  ' +
                                      'Recursing for a replacement result.');
           return this.integer(min, max);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.color = function (isgrayscale)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.integer)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.integer().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('boolean' !== typeof(isgrayscale)) {isgrayscale = false;}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var red =   ('00' + this.integer(0,255).toString(16).toUpperCase()).slice(-2);
           var green = ('00' + this.integer(0,255).toString(16).toUpperCase()).slice(-2);
           var blue =  ('00' + this.integer(0,255).toString(16).toUpperCase()).slice(-2);
           if (isgrayscale)
           {green = red;
            blue = red;}
           var output = '#' + red + green + blue;

        // Sanity Checking - Outputs: Must conform to a valid RGB hex color code.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' === typeof(output)) {if (/^#[0-9A-F]{6}$/i.test(output)) {return output;}}
           console.info('WARNING: ' + name + ' generated a color code ' + output + ' which does not correspond to a valid hex color code.  ' +
                                      'Recursing for a replacement color code.');
           return this.color(isgrayscale);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.decimal = function (min, max, precision)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.integer)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.integer().');}
           if ('function' !== typeof(this.valueOf)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.valueOf().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(min)) {throw new TypeError(name + ' requires a minimum bound.');}
           if ('number' !== typeof(max)) {throw new TypeError(name + ' requires a maximum bound.');}
           if ('number' !== typeof(precision)) {throw new TypeError(name + ' requires a stated precision.');} else {precision = Math.floor(precision);}
           if (min >= max) {throw new RangeError(name + ' requires a minimum bound that is less than the maximum bound.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = Math.max((this.integer(min, max) + this.valueOf()), max).toFixed(precision);

        // Sanity Checking - Outputs: Must conform to a decimal value between min (inclusive) and max (inclusive).
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(output)) {throw new TypeError(name + ' tried to return a non-numeric value [' + output + '].');}
           if (output >= min && output <= max && output.toString().split('.')[1].length <= precision) {return output;}
           console.info('WARNING: ' + name + ' failed to generate a value (' + output + ') within the selected bounds [' + min + ' - ' + max + '] or has ' +
                                    ' improper precision.  Recursing for a replacement value.');
           return this.decimal(min, max, precision);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.die = function (sides)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.integer)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.integer().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(sides)) {throw new TypeError(name + ' requires the number of sides of the die to be cast.');} else {sides = Math.floor(sides);}
           if (2 > sides) {throw new RangeError(name + ' requires a minimum of a three sided virtual die to be thrown.  For coins, use PRNG/PRNG.coin() instead.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = this.integer(1, sides);

        // Sanity Checking - Outputs: Must conform to an integer between 1 and the number of the sides of the die being cast.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' === typeof(output)) {if (1 <= output && output <= sides) {return output;}}
           console.info('WARNING: ' + name + ' rolled a  ' + output + ' which is not possible with a ' + sides + '-sided die.  ' +
                                      'Recursing for a replacement roll.');
           return this.die(sides);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.dice = function (quantity, sides)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.die)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.die().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(quantity)) {throw new TypeError(name + ' requires the quantity of dice to be cast.');} else {quantity = Math.floor(quantity);}
           if ('number' !== typeof(sides)) {throw new TypeError(name + ' requires the sides on the dice to be cast.');} else {sides = Math.floor(sides);}
           if (1 > quantity) {throw new RangeError(name + ' requires a minimum of a two virtual die to be thrown.  For single throws, use PRNG/PRNG.die() instead.');}
           if (2 > sides) {throw new RangeError(name + ' requires a minimum of a three sided virtual die to be thrown.  For coins, use PRNG/PRNG.coin() instead.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = [];
           for (var roll = 0; roll < quantity; roll++) {output.push(this.die(sides));}

        // Sanity Checking - Outputs: Must conform to an array of integers between 1 (inclusive) a multiple of the number of the sides of the die being cast (exclusive).
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(output)) {throw new TypeError(name + ' tried to return the non-array value [' + output + '].');}
           for (var index = 0; index < output.length; index++)
           {if ('number' !== typeof(output[index]))
            {throw new TypeError(name + ' tried to return a non-integer element [' + output[index] + '].');}
            if (1 > output[index] || output[index] > sides)
            {throw new RangeError(name + ' tried to return the element [' + output[index] + '] which is not possible with a ' + sides + '-sided die.');}}
           return output;};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.loadeddie = function (weights)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.die)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.die().');}
           if ('function' !== typeof(Math.gcd)) {throw new Error(name + ' is missing the prerequisite function Math.gcd().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(weights)) {throw new TypeError(name + ' needs an array of weights.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Handle fractional weightings and optimize to the lowest set of integers that preserve the stated odds
           var output, weightmultiplier = 1;
           for (var index = 0; index < weights.length; index++) {weightmultiplier = Math.max(weightmultiplier, Math.pow(10, weights[index].toString().replace(/^-?\d*\.?|0+$/g, '').length));}
           weightmultiplier = weightmultiplier / Math.gcd(weights);
           for (index = 0; index < weights.length; index++) {weights[index] *= weightmultiplier;}
           // Roll an honest die for an appropriate number of sides to handle the weighting
           output = this.die(weights.reduce(function (a,b) {return a + b;}, 0));
           // Map the resulting result down to the number of sides of our loaded die
           var weighttotal = 0;
           for (index = 0; index < weights.length; index++)
           {weighttotal += weights[index];
            if (weighttotal >= output)
            {output = index + 1;
             index = weights.length;}}

        // Sanity Checking - Outputs: Must conform to an integer between 1 and the number of the sides of the die being cast.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if (1 <= output && output <= weights.length) {return output;}
           console.info('WARNING: ' + name + ' failed to map ' + output + ' to the adjusted weight array of ' + weights + '.  ' +
                                      'Recursing for a replacement value.');
           return this.loadeddie(weights);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.loadeddice = function (quantity, weights)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';

        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.loadeddie)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.loadeddie().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(quantity)) {throw new TypeError(name + ' requires the quantity of loaded dice to be cast.');} else {quantity = Math.floor(quantity);}
           if ('[object Array]' !== Object.prototype.toString.call(weights)) {throw new TypeError(name + ' needs an array of weights.');}
           if (1 > quantity) {throw new RangeError(name + ' requires a minimum of a two virtual die to be thrown.  For single throws, use PRNG/PRNG.die() instead.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = [];
           for (var roll = 0; roll < quantity; roll++) {output.push(this.loadeddie(weights));}

        // Sanity Checking - Outputs: Must conform to an array of integers between 1 (inclusive) a multiple of the number of weights passed in as a parameter (exclusive).
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(output)) {throw new TypeError(name + ' tried to return the non-array value [' + output + '].');}
           for (var index = 0; index < output.length; index++)
           {if ('number' !== typeof(output[index]))
            {throw new TypeError(name + ' tried to return a non-integer element [' + output[index] + '].');}
            if (1 > output[index] || output[index] > weights.length)
            {throw new RangeError(name + ' tried to return the element [' + output[index] + '] which is not possible with a ' + weights.length + '-sided die.');}}
           return output;};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.weightedelement = function (source)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.loadeddie)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.loadeddie().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(source)) {throw new TypeError(name + ' cannot extract an element from a non-array object.');}
           for (var index = 0; index < source.length; index++) {if (0 === source[index][1]) {source.splice(index,1);}}
           if (0 === source.length) {throw new RangeError(name + ' cannot return an element from an empty array.');}
           if ('[object Array]' !== Object.prototype.toString.call(source[0])) {throw new TypeError(name + ' cannot parse non-multidimensional array objects.');}
           if (2 !== source[0].length) {throw new RangeError(name + ' can only process two-dimensional arrays.');}
           for (index = 0; index < source.length; index++)
           {if ('number' !== typeof(source[index][1])) {throw new TypeError(name + ' requires weightings to be present all elements of source[x] in subelement [1].');}}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var weighting = [], data = [], output, length = source.length;
           for (index = 0; index < length; index++)
           {var pair = source[index];
            data.push(pair[0]);
            weighting.push(pair[1]);}
           output = data[this.loadeddie(weighting) - 1];

        // Sanity Checking - Outputs: Must be an element from the source array.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if (-1 !== data.indexOf(output)) {return output;}
           console.info('WARNING: ' + name + ' failed to map to a data element.  ' +
                                      'Recursively fetching a replacement element.');
           return this.weightedelement(source);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.srdie = function ()
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.die)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.die().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Nothing to sanity check

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = 0;
           while (0 === output % 6) {output += this.die(6);}

        // Sanity Checking - Outputs: Must conform to an integer between 1 (inclusive) a multiple of 6 (exclusive).
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(output)) {throw new TypeError(name + ' tried to return the non-number value [' + output + '].');}
           if (0 > output % 6) {throw new RangeError(name + ' tried to return the value [' + output + "] which is not possible with a 'Rule of 6' Shadowrun die.");}
           return output;};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.srdice = function (quantity)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.srdie)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.srdie().');}

        // Sanity Checking - Quantity
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(quantity)) {throw new TypeError(name + ' requires the quantity of loaded dice to be cast.');} else {quantity = Math.floor(quantity);}
           if (1 > quantity) {throw new RangeError(name + ' requires a minimum of a two virtual die to be thrown.  For single throws, use PRNG/PRNG.srdie() instead.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = [];
           for (var roll = 0; roll < quantity; roll++) {output.push(this.srdie());}

        // Sanity Checking - Outputs: Must conform to an array of integers between 1 (inclusive) a multiple of 6 (exclusive).
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(output)) {throw new TypeError(name + ' tried to return the non-array value [' + output + '].');}
           for (var index = 0; index < output.length; index++)
           {if ('number' !== typeof(output[index]))
            {throw new TypeError(name + ' tried to return a non-integer element [' + output[index] + '].');}
            if (1 > output[index] || output[index] % 6 !== 0)
            {throw new RangeError(name + ' tried to return the element [' + output[index] + '] which is not possible with a 6-sided die.');}}
           return output;};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.element = function (source)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.integer)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.integer().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(source)) {throw new TypeError(name + ' cannot extract an element from a non-array object.');}
           if (0 === source.length) {throw new RangeError(name + ' cannot return an element from an empty array.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var index = this.integer(0, source.length - 1);

        // Sanity Checking - Outputs: Must be a valid element of the source array.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if (0 <= index && index < source.length) {return source[index];}
           console.info('WARNING: ' + name + ' generated an element index of ' + index + ' on an array of length ' + source.length + '.  ' +
                                      'Recursively fetching a replacement element as this index is invalid.');
           return this.element(source);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.shuffle = function (unshuffled)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.element)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.element().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(unshuffled)) {throw new TypeError(name + ' cannot shuffle a non-array object.');}
           if (0 === unshuffled.length)
           {console.info('WARNING: ' + name + ' was called upon to shuffle an array with no elements.');
            return unshuffled;}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var shuffled = [];
           while (unshuffled.length > 0)
           {shuffled.push(this.element(unshuffled));
            unshuffled.splice(unshuffled.indexOf(shuffled[shuffled.length - 1]), 1);}

        // Sanity Checking - Outputs: An array consisting of the original elements in a new order.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' === Object.prototype.toString.call(shuffled)) {return shuffled;}
           throw new TypeError(name + ' generated a non-array object.');};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.elements = function (source, quantity)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.shuffle)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.shuffle().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(source)) {throw new TypeError(name + ' cannot extract elements from a non-array object.');}
           if ('number' !== typeof(quantity)) {throw new TypeError(name + ' requires a quanitity of elements to extract.');} else {quantity = Math.floor(quantity);}
           switch (true)
           {case (0 >= quantity): throw new RangeError(name + ' requires a positive, non-zero quantity of elements slated for extraction.');
            case (1 === quantity): console.info('WARNING: ' + name + ' is inefficient at extracting a single element from an array object, use PRNG/PRNG.element instead.'); break;
            case (quantity > source.length): throw new RangeError(name + ' cannot extract more elements from an array than exist in the array object.');
            default:}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = this.shuffle(source).slice(0, quantity);

        // Sanity Checking - Outputs: Must be an array of valid elements from the source array, with a length of quantity.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('[object Array]' !== Object.prototype.toString.call(output))
           {console.info('WARNING: ' + name + ' generated an non-array object.  Recursively fetching a replacement array.');
            return this.elements(source, quantity);}
           if (output.length !== quantity)
           {console.info('WARNING: ' + name + ' generated an array of length ' + output.length + ' when expecting a length of ' + quantity + '.  Recursively fetching a replacement array.');
            return this.elements(source, quantity);}
           for (var index = 0; index < output.length; index++)
           {if (-1 !== source.indexOf(output[index]))
            {console.info('WARNING: ' + name + ' generated an element ' + output[index] + ' which is not part of the source array.  Recursively fetching a replacement element.');
             return this.elements(source, quantity);}}
           return output;};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.givenname = function (localization, gender)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.weightedelement)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.weightedelement().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' !== typeof(localization)) {throw new TypeError(name + ' requires a localization code to select the proper collection of given names.');}
           if ('string' !== typeof(gender)) {throw new TypeError(name + ' requires a gender identifier to select the proper weightings for given names.');}
           localization = localization.toUpperCase();
           gender = gender.toLowerCase(); if ('m' === gender) {gender = 'male';} if ('f' === gender) {gender = 'female';}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output;
           // Load the appropriate CSV file's data as a string stored in the output variable.
           switch (localization)
           {case 'USA': // Source: https://www.ssa.gov/OACT/babynames/names.zip/yob*.txt (concatenated)
             output = loadfile('prng_givennames' + localization + gender + '.dat');
             if (null === output) {throw new Error(name + ' failed to extract data from "prng_givennames' + localization + gender + '.dat".');}
             break;
            default:
             throw new RangeError(name + ' does not support "' + localization + '" localization in this version of PRNG.');}
           // Create and parse the CSV array from the newly created output variable, only keeping the given names and the weighting multipliers (default to equal weightings).
           switch (localization)
           {case 'USA':
             output = output.split('\n');
             output.pop();    // End of File Garbage Removal
             for (var index = 0; index < output.length; index++)
             {output[index] = output[index].split(',');
              output[index][1] = parseInt(output[index][1],10);}
             break;
            default:
             output = null;}
           output = this.weightedelement(output);

        // Sanity Checking - Outputs: Must be a string containing a given name from the various collections.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' === typeof(output)) {return output;}
           console.info('WARNING: ' + name + ' failed to map to a given name.  ' +
                                      'Recursively fetching a replacement given name.');
           return this.givenname(localization, gender);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.surname = function (localization)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.weightedelement)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.weightedelement().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' !== typeof(localization)) {throw new TypeError(name + ' requires a localization code to select the proper collection of surnames.');}
           localization = localization.toUpperCase();

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output;
           // Load the appropriate CSV file's data as a string stored in the output variable.
           switch (localization)
           {case 'USA': // Source: http://www2.census.gov/topics/genealogy/2010surnames/names.zip/Names_2010Census.csv
             output = loadfile('prng_surnames' + localization + '.dat');
             if (null === output) {throw new Error(name + ' failed to extract data from "prng_surnames' + localization + '.dat".');}
             break;
            default:
             throw new RangeError(name + ' does not support "' + localization + '" localization in this version of PRNG.');}
           // Create and parse the CSV array from the newly created output variable, only keeping the given names and the weighting multipliers (default to equal weightings).
           switch (localization)
           {case 'USA':
             output = output.split('\n');
             output.pop();    // End of File Garbage Removal
             for (var index = 0; index < output.length; index++)
             {output[index] = output[index].split(',');
              output[index] = [output[index][0],
              parseInt(output[index][1], 10)];}
             break;
            default:
             output = null;}
           output = this.weightedelement(output);

        // Sanity Checking - Outputs: Must be a string containing a surname from the various collections.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' === typeof(output)) {return output;}
           console.info('WARNING: ' + name + ' failed to map to a given name.  ' +
                                      'Recursively fetching a replacement given name.');
           return this.surname(localization);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.fullname = function (localization, gender)
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.givenname)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.givenname().');}
           if ('function' !== typeof(this.surname)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.surname().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var output = this.givenname(localization, gender) + ' ' + this.givenname(localization, gender) + ' ' + this.surname(localization);

        // Sanity Checking - Outputs: Must be a timestamp in HH:MM:SS.sss format.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if (true) {return output;}};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.time = function ()
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.integer)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.integer().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Nothing to sanity check

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var hours = ('00' + this.integer(0,23).toString()).slice(-2);
           var minutes = ('00' + this.integer(0,59).toString()).slice(-2);
           var seconds = ('00' + this.integer(0,59).toString()).slice(-2);
           var milliseconds = this.integer(0,999);
           var output = hours + ':' + minutes + ':' + seconds + '.' + milliseconds;

        // Sanity Checking - Outputs: Must be a timestamp in HH:MM:SS.sss format.
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' === typeof(output)) {if (output.match(/\d\d:\d\d:\d\d.\d\d\d/) !== null && parseInt(output.split(':')[0], 10) < 24 &&
             parseInt(output.split(':')[1], 10) < 60 && parseInt(output.split(':')[2], 10) < 60 && parseInt(output.split('.')[1], 10) < 1000) {return output;}}
           console.info('WARNING: ' + name + ' generated a timestamp of ' + output + ' which is not a valid timestamp.  ' +
                                      'Recursing for a replacement timestamp.');
           return this.time();};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.toImage = function (depth) //TODO: Write an original form of this function instead of relying on foreign code.
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        if ('function' !== typeof(this.valueOf)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.valueOf().');}
        if ('number' !== typeof(depth)) {throw new TypeError(name + ' requires a depth for the image.');}
        if (1 !== depth && 4 !== depth && 8 !== depth && 16 !== depth && 32 !== depth) {throw new RangeError(name + ' requires a valid depth for the image.  Use 1, 4, 8, 16, or 32.');}
        // Code imported and modified from original source located at https://gist.github.com/vukicevic/8112515
        // depth: 1 - monochrome
        //        4 - 4-bit grayscale
        //        8 - 8-bit grayscale
        //       16 - 16-bit colour
        //       32 - 32-bit colour

        function drawArray(arr, depth)
        {var offset, height, data, image;
         function conv(size) {return String.fromCharCode(size&0xff, (size>>8)&0xff, (size>>16)&0xff, (size>>24)&0xff);}
         offset = depth <= 8 ? 54 + Math.pow(2, depth)*4 : 54;
         height = Math.ceil(Math.sqrt(arr.length * 8/depth));

         // BMP Header
         data  = 'BM';                          // ID field
         data += conv(offset + arr.length);     // BMP size
         data += conv(0);                       // unused
         data += conv(offset);                  // pixel data offset

         // DIB Header
         data += conv(40);                      // DIB header length
         data += conv(height);                  // image width
         data += conv(height);                  // image height
         data += String.fromCharCode(1, 0);     // colour panes
         data += String.fromCharCode(depth, 0); // bits per pixel
         data += conv(0);                       // compression method
         data += conv(arr.length);              // size of the raw data
         data += conv(2835);                    // horizontal print resolution
         data += conv(2835);                    // vertical print resolution
         data += conv(0);                       // colour palette, 0 == 2^n
         data += conv(0);                       // important colours

         // Grayscale tables for bit depths <= 8
         if (depth <= 8)
         {data += conv(0);
          for (var s = Math.floor(255/(Math.pow(2, depth)-1)), i = s; i < 256; i += s) {data += conv(i + i*256 + i*65536);}}

         // Pixel data
         data += String.fromCharCode.apply(String, arr);

         // Image element
         image = document.createElement('img');
         image.src = 'data:image/bmp;base64,' + btoa(data);
         return image/* Modified to interface with FFC */.src/* Modified to interface with FFC */;}

        for (var a= [], i = 0; i < 8192; i++) {a[i] = Math.floor(this.valueOf()*256);}
        return drawArray(a, depth);};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.toPinkNoise = function (volume) //TODO: Write an original form of this function instead of relying on foreign code.
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.valueOf)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.valueOf().');}
           if ('undefined' === typeof(window.context)) {window.context = new (window.AudioContext || window.webkitAudioContext)();}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('number' !== typeof(volume)) {throw new TypeError(name + ' requires a percentage volume for the pink noise to be played at.');}
           if (0 >= volume) {throw new RangeError(name + ' requires a positive, non-zero volume for the pink noise to be played at.');}
           if (100 < volume) {throw new RangeError(name + ' requires volume for the pink noise to be played at that is between 0 and 100 percent.');}

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Code imported and modified from original source located at https://gist.github.com/vukicevic/8112515
           var bufferSize = 4096, output = context.createGain(), pinkNoise = (function()
           {var b0 = 0.0, b1 = 0.0, b2 = 0.0, b3 = 0.0, b4 = 0.0, b5 = 0.0, b6 = 0.0, node = window.context.createScriptProcessor(bufferSize, 1, 1);
            node.onaudioprocess = function(e)
            {var output = e.outputBuffer.getChannelData(0);
             for (var i = 0; i < bufferSize; i++)
             {var white = new PRNG().valueOf() * 2 - 1; // Using this.valueOf() in this connection leads to misbehaviour as this no longer refers to the PRNG object, so we use a child object.
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              output[i] *= 0.11; // (roughly) compensate for gain
              b6 = white * 0.115926;}}
            return node;})();

           pinkNoise.connect(output);
           output.gain.value = volume / 100;

        // Sanity Checking - Output
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           return output; // In the caller, invoking <output.connect(window.context.destination);> will play the sound generated here.
       };
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.toString = function ()
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.valueOf)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.valueOf().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Nothing to sanity check

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           var temp = this.valueOf().toString().split(''),
               charset = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()-_=+[]\\{}|;\':\",./<>? '.split(''),
               output = '';
           temp.shift(); temp.shift(); // Remove the 0. off the front
           while (1 === temp.length % 2) {temp.push('0');} // Pad the end with zeroes to bring up to an even number.
           temp = temp.join(''); // Return to string
           for (var index = 0; index < temp.length - 1; index += 2)
           {var location = parseInt(temp[index] + temp[index + 1], 10);
            output += charset[location % charset.length];}

        // Sanity Checking - Output
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('string' === typeof(output)) {return output;}
           console.info('WARNING: ' + name + ' generated output: ' + output + ', a ' + typeof(output) + ', which is not a string.  ' +
                                      'Recursing for a replacement string.');
           return this.time();};
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
       PRNG.prototype.toLocaleString = function ()
       {var name = new Error().stack.split('\n')[0].split('@')[0].replace('.prototype', '') + '()';
        // Sanity Checking - Prerequisites
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           if ('function' !== typeof(this.toString)) {throw new Error(name + ' is missing the prerequisite function PRNG/PRNG.toString().');}

        // Sanity Checking - Parameters
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Nothing to sanity check

        // Processing
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           return this.toString();

        // Sanity Checking - Output
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
           // Nothing to sanity check
       };
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //
   };
   var prng = new PRNG();
/* var timed = function (action) {var start = new Date(); var output = action(); var end = new Date(); console.info('Elapsed Time: ' + ((end - start) / 1000) + 's'); return output;};
   timed(function () { console.log(prng.fullname('usa','female')); });
*/
