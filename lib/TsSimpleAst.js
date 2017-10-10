(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TsSimpleAst = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var arrayUniq = require('array-uniq');

module.exports = function () {
	return arrayUniq([].concat.apply([], arguments));
};

},{"array-uniq":2}],2:[function(require,module,exports){
(function (global){
'use strict';

// there's 3 implementations written in increasing order of efficiency

// 1 - no Set type is defined
function uniqNoSet(arr) {
	var ret = [];

	for (var i = 0; i < arr.length; i++) {
		if (ret.indexOf(arr[i]) === -1) {
			ret.push(arr[i]);
		}
	}

	return ret;
}

// 2 - a simple Set type is defined
function uniqSet(arr) {
	var seen = new Set();
	return arr.filter(function (el) {
		if (!seen.has(el)) {
			seen.add(el);
			return true;
		}

		return false;
	});
}

// 3 - a standard Set type is defined and it has a forEach method
function uniqSetWithForEach(arr) {
	var ret = [];

	(new Set(arr)).forEach(function (el) {
		ret.push(el);
	});

	return ret;
}

// V8 currently has a broken implementation
// https://github.com/joyent/node/issues/8449
function doesForEachActuallyWork() {
	var ret = false;

	(new Set([true])).forEach(function (el) {
		ret = el;
	});

	return ret === true;
}

if ('Set' in global) {
	if (typeof Set.prototype.forEach === 'function' && doesForEachActuallyWork()) {
		module.exports = uniqSetWithForEach;
	} else {
		module.exports = uniqSet;
	}
} else {
	module.exports = uniqNoSet;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
'use strict';

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"util/":194}],4:[function(require,module,exports){
'use strict';
module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}

},{}],5:[function(require,module,exports){
var concatMap = require('concat-map');
var balanced = require('balanced-match');

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function identity(e) {
  return e;
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length)
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}


},{"balanced-match":4,"concat-map":7}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
module.exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],9:[function(require,module,exports){
(function (process){
module.exports = realpath
realpath.realpath = realpath
realpath.sync = realpathSync
realpath.realpathSync = realpathSync
realpath.monkeypatch = monkeypatch
realpath.unmonkeypatch = unmonkeypatch

var fs = require('fs')
var origRealpath = fs.realpath
var origRealpathSync = fs.realpathSync

var version = process.version
var ok = /^v[0-5]\./.test(version)
var old = require('./old.js')

function newError (er) {
  return er && er.syscall === 'realpath' && (
    er.code === 'ELOOP' ||
    er.code === 'ENOMEM' ||
    er.code === 'ENAMETOOLONG'
  )
}

function realpath (p, cache, cb) {
  if (ok) {
    return origRealpath(p, cache, cb)
  }

  if (typeof cache === 'function') {
    cb = cache
    cache = null
  }
  origRealpath(p, cache, function (er, result) {
    if (newError(er)) {
      old.realpath(p, cache, cb)
    } else {
      cb(er, result)
    }
  })
}

function realpathSync (p, cache) {
  if (ok) {
    return origRealpathSync(p, cache)
  }

  try {
    return origRealpathSync(p, cache)
  } catch (er) {
    if (newError(er)) {
      return old.realpathSync(p, cache)
    } else {
      throw er
    }
  }
}

function monkeypatch () {
  fs.realpath = realpath
  fs.realpathSync = realpathSync
}

function unmonkeypatch () {
  fs.realpath = origRealpath
  fs.realpathSync = origRealpathSync
}

}).call(this,require('_process'))
},{"./old.js":10,"_process":25,"fs":6}],10:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var pathModule = require('path');
var isWindows = process.platform === 'win32';
var fs = require('fs');

// JavaScript implementation of realpath, ported from node pre-v6

var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

function rethrow() {
  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
  // is fairly slow to generate.
  var callback;
  if (DEBUG) {
    var backtrace = new Error;
    callback = debugCallback;
  } else
    callback = missingCallback;

  return callback;

  function debugCallback(err) {
    if (err) {
      backtrace.message = err.message;
      err = backtrace;
      missingCallback(err);
    }
  }

  function missingCallback(err) {
    if (err) {
      if (process.throwDeprecation)
        throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
      else if (!process.noDeprecation) {
        var msg = 'fs: missing callback ' + (err.stack || err.message);
        if (process.traceDeprecation)
          console.trace(msg);
        else
          console.error(msg);
      }
    }
  }
}

function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : rethrow();
}

var normalize = pathModule.normalize;

// Regexp that finds the next partion of a (partial) path
// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
if (isWindows) {
  var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
} else {
  var nextPartRe = /(.*?)(?:[\/]+|$)/g;
}

// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
if (isWindows) {
  var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
} else {
  var splitRootRe = /^[\/]*/;
}

exports.realpathSync = function realpathSync(p, cache) {
  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return cache[p];
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstatSync(base);
      knownHard[base] = true;
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  // NB: p.length changes.
  while (pos < p.length) {
    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      continue;
    }

    var resolvedLink;
    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // some known symbolic link.  no need to stat again.
      resolvedLink = cache[base];
    } else {
      var stat = fs.lstatSync(base);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        continue;
      }

      // read the link if it wasn't read before
      // dev/ino always return 0 on windows, so skip the check.
      var linkTarget = null;
      if (!isWindows) {
        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          linkTarget = seenLinks[id];
        }
      }
      if (linkTarget === null) {
        fs.statSync(base);
        linkTarget = fs.readlinkSync(base);
      }
      resolvedLink = pathModule.resolve(previous, linkTarget);
      // track this, if given a cache.
      if (cache) cache[base] = resolvedLink;
      if (!isWindows) seenLinks[id] = linkTarget;
    }

    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }

  if (cache) cache[original] = p;

  return p;
};


exports.realpath = function realpath(p, cache, cb) {
  if (typeof cb !== 'function') {
    cb = maybeCallback(cache);
    cache = null;
  }

  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return process.nextTick(cb.bind(null, null, cache[p]));
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstat(base, function(err) {
        if (err) return cb(err);
        knownHard[base] = true;
        LOOP();
      });
    } else {
      process.nextTick(LOOP);
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  function LOOP() {
    // stop if scanned past end of path
    if (pos >= p.length) {
      if (cache) cache[original] = p;
      return cb(null, p);
    }

    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      return process.nextTick(LOOP);
    }

    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // known symbolic link.  no need to stat again.
      return gotResolvedLink(cache[base]);
    }

    return fs.lstat(base, gotStat);
  }

  function gotStat(err, stat) {
    if (err) return cb(err);

    // if not a symlink, skip to the next path part
    if (!stat.isSymbolicLink()) {
      knownHard[base] = true;
      if (cache) cache[base] = base;
      return process.nextTick(LOOP);
    }

    // stat & read the link if not read before
    // call gotTarget as soon as the link target is known
    // dev/ino always return 0 on windows, so skip the check.
    if (!isWindows) {
      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
      if (seenLinks.hasOwnProperty(id)) {
        return gotTarget(null, seenLinks[id], base);
      }
    }
    fs.stat(base, function(err) {
      if (err) return cb(err);

      fs.readlink(base, function(err, target) {
        if (!isWindows) seenLinks[id] = target;
        gotTarget(err, target);
      });
    });
  }

  function gotTarget(err, target, base) {
    if (err) return cb(err);

    var resolvedLink = pathModule.resolve(previous, target);
    if (cache) cache[base] = resolvedLink;
    gotResolvedLink(resolvedLink);
  }

  function gotResolvedLink(resolvedLink) {
    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }
};

}).call(this,require('_process'))
},{"_process":25,"fs":6,"path":20}],11:[function(require,module,exports){
(function (process){
exports.alphasort = alphasort
exports.alphasorti = alphasorti
exports.setopts = setopts
exports.ownProp = ownProp
exports.makeAbs = makeAbs
exports.finish = finish
exports.mark = mark
exports.isIgnored = isIgnored
exports.childrenIgnored = childrenIgnored

function ownProp (obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field)
}

var path = require("path")
var minimatch = require("minimatch")
var isAbsolute = require("path-is-absolute")
var Minimatch = minimatch.Minimatch

function alphasorti (a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase())
}

function alphasort (a, b) {
  return a.localeCompare(b)
}

function setupIgnores (self, options) {
  self.ignore = options.ignore || []

  if (!Array.isArray(self.ignore))
    self.ignore = [self.ignore]

  if (self.ignore.length) {
    self.ignore = self.ignore.map(ignoreMap)
  }
}

// ignore patterns are always in dot:true mode.
function ignoreMap (pattern) {
  var gmatcher = null
  if (pattern.slice(-3) === '/**') {
    var gpattern = pattern.replace(/(\/\*\*)+$/, '')
    gmatcher = new Minimatch(gpattern, { dot: true })
  }

  return {
    matcher: new Minimatch(pattern, { dot: true }),
    gmatcher: gmatcher
  }
}

function setopts (self, pattern, options) {
  if (!options)
    options = {}

  // base-matching: just use globstar for that.
  if (options.matchBase && -1 === pattern.indexOf("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar")
    }
    pattern = "**/" + pattern
  }

  self.silent = !!options.silent
  self.pattern = pattern
  self.strict = options.strict !== false
  self.realpath = !!options.realpath
  self.realpathCache = options.realpathCache || Object.create(null)
  self.follow = !!options.follow
  self.dot = !!options.dot
  self.mark = !!options.mark
  self.nodir = !!options.nodir
  if (self.nodir)
    self.mark = true
  self.sync = !!options.sync
  self.nounique = !!options.nounique
  self.nonull = !!options.nonull
  self.nosort = !!options.nosort
  self.nocase = !!options.nocase
  self.stat = !!options.stat
  self.noprocess = !!options.noprocess
  self.absolute = !!options.absolute

  self.maxLength = options.maxLength || Infinity
  self.cache = options.cache || Object.create(null)
  self.statCache = options.statCache || Object.create(null)
  self.symlinks = options.symlinks || Object.create(null)

  setupIgnores(self, options)

  self.changedCwd = false
  var cwd = process.cwd()
  if (!ownProp(options, "cwd"))
    self.cwd = cwd
  else {
    self.cwd = path.resolve(options.cwd)
    self.changedCwd = self.cwd !== cwd
  }

  self.root = options.root || path.resolve(self.cwd, "/")
  self.root = path.resolve(self.root)
  if (process.platform === "win32")
    self.root = self.root.replace(/\\/g, "/")

  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
  self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd)
  if (process.platform === "win32")
    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/")
  self.nomount = !!options.nomount

  // disable comments and negation in Minimatch.
  // Note that they are not supported in Glob itself anyway.
  options.nonegate = true
  options.nocomment = true

  self.minimatch = new Minimatch(pattern, options)
  self.options = self.minimatch.options
}

function finish (self) {
  var nou = self.nounique
  var all = nou ? [] : Object.create(null)

  for (var i = 0, l = self.matches.length; i < l; i ++) {
    var matches = self.matches[i]
    if (!matches || Object.keys(matches).length === 0) {
      if (self.nonull) {
        // do like the shell, and spit out the literal glob
        var literal = self.minimatch.globSet[i]
        if (nou)
          all.push(literal)
        else
          all[literal] = true
      }
    } else {
      // had matches
      var m = Object.keys(matches)
      if (nou)
        all.push.apply(all, m)
      else
        m.forEach(function (m) {
          all[m] = true
        })
    }
  }

  if (!nou)
    all = Object.keys(all)

  if (!self.nosort)
    all = all.sort(self.nocase ? alphasorti : alphasort)

  // at *some* point we statted all of these
  if (self.mark) {
    for (var i = 0; i < all.length; i++) {
      all[i] = self._mark(all[i])
    }
    if (self.nodir) {
      all = all.filter(function (e) {
        var notDir = !(/\/$/.test(e))
        var c = self.cache[e] || self.cache[makeAbs(self, e)]
        if (notDir && c)
          notDir = c !== 'DIR' && !Array.isArray(c)
        return notDir
      })
    }
  }

  if (self.ignore.length)
    all = all.filter(function(m) {
      return !isIgnored(self, m)
    })

  self.found = all
}

function mark (self, p) {
  var abs = makeAbs(self, p)
  var c = self.cache[abs]
  var m = p
  if (c) {
    var isDir = c === 'DIR' || Array.isArray(c)
    var slash = p.slice(-1) === '/'

    if (isDir && !slash)
      m += '/'
    else if (!isDir && slash)
      m = m.slice(0, -1)

    if (m !== p) {
      var mabs = makeAbs(self, m)
      self.statCache[mabs] = self.statCache[abs]
      self.cache[mabs] = self.cache[abs]
    }
  }

  return m
}

// lotta situps...
function makeAbs (self, f) {
  var abs = f
  if (f.charAt(0) === '/') {
    abs = path.join(self.root, f)
  } else if (isAbsolute(f) || f === '') {
    abs = f
  } else if (self.changedCwd) {
    abs = path.resolve(self.cwd, f)
  } else {
    abs = path.resolve(f)
  }

  if (process.platform === 'win32')
    abs = abs.replace(/\\/g, '/')

  return abs
}


// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
function isIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path))
  })
}

function childrenIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return !!(item.gmatcher && item.gmatcher.match(path))
  })
}

}).call(this,require('_process'))
},{"_process":25,"minimatch":17,"path":20,"path-is-absolute":21}],12:[function(require,module,exports){
(function (process){
// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
//
// If inGlobStar and PREFIX is symlink and points to dir
//   set ENTRIES = []
// else readdir(PREFIX) as ENTRIES
//   If fail, END
//
// with ENTRIES
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       // Mark that this entry is a globstar match
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.

module.exports = glob

var fs = require('fs')
var rp = require('fs.realpath')
var minimatch = require('minimatch')
var Minimatch = minimatch.Minimatch
var inherits = require('inherits')
var EE = require('events').EventEmitter
var path = require('path')
var assert = require('assert')
var isAbsolute = require('path-is-absolute')
var globSync = require('./sync.js')
var common = require('./common.js')
var alphasort = common.alphasort
var alphasorti = common.alphasorti
var setopts = common.setopts
var ownProp = common.ownProp
var inflight = require('inflight')
var util = require('util')
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

var once = require('once')

function glob (pattern, options, cb) {
  if (typeof options === 'function') cb = options, options = {}
  if (!options) options = {}

  if (options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return globSync(pattern, options)
  }

  return new Glob(pattern, options, cb)
}

glob.sync = globSync
var GlobSync = glob.GlobSync = globSync.GlobSync

// old api surface
glob.glob = glob

function extend (origin, add) {
  if (add === null || typeof add !== 'object') {
    return origin
  }

  var keys = Object.keys(add)
  var i = keys.length
  while (i--) {
    origin[keys[i]] = add[keys[i]]
  }
  return origin
}

glob.hasMagic = function (pattern, options_) {
  var options = extend({}, options_)
  options.noprocess = true

  var g = new Glob(pattern, options)
  var set = g.minimatch.set

  if (!pattern)
    return false

  if (set.length > 1)
    return true

  for (var j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== 'string')
      return true
  }

  return false
}

glob.Glob = Glob
inherits(Glob, EE)
function Glob (pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = null
  }

  if (options && options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return new GlobSync(pattern, options)
  }

  if (!(this instanceof Glob))
    return new Glob(pattern, options, cb)

  setopts(this, pattern, options)
  this._didRealPath = false

  // process each pattern in the minimatch set
  var n = this.minimatch.set.length

  // The matches are stored as {<filename>: true,...} so that
  // duplicates are automagically pruned.
  // Later, we do an Object.keys() on these.
  // Keep them as a list so we can fill in when nonull is set.
  this.matches = new Array(n)

  if (typeof cb === 'function') {
    cb = once(cb)
    this.on('error', cb)
    this.on('end', function (matches) {
      cb(null, matches)
    })
  }

  var self = this
  this._processing = 0

  this._emitQueue = []
  this._processQueue = []
  this.paused = false

  if (this.noprocess)
    return this

  if (n === 0)
    return done()

  var sync = true
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false, done)
  }
  sync = false

  function done () {
    --self._processing
    if (self._processing <= 0) {
      if (sync) {
        process.nextTick(function () {
          self._finish()
        })
      } else {
        self._finish()
      }
    }
  }
}

Glob.prototype._finish = function () {
  assert(this instanceof Glob)
  if (this.aborted)
    return

  if (this.realpath && !this._didRealpath)
    return this._realpath()

  common.finish(this)
  this.emit('end', this.found)
}

Glob.prototype._realpath = function () {
  if (this._didRealpath)
    return

  this._didRealpath = true

  var n = this.matches.length
  if (n === 0)
    return this._finish()

  var self = this
  for (var i = 0; i < this.matches.length; i++)
    this._realpathSet(i, next)

  function next () {
    if (--n === 0)
      self._finish()
  }
}

Glob.prototype._realpathSet = function (index, cb) {
  var matchset = this.matches[index]
  if (!matchset)
    return cb()

  var found = Object.keys(matchset)
  var self = this
  var n = found.length

  if (n === 0)
    return cb()

  var set = this.matches[index] = Object.create(null)
  found.forEach(function (p, i) {
    // If there's a problem with the stat, then it means that
    // one or more of the links in the realpath couldn't be
    // resolved.  just return the abs value in that case.
    p = self._makeAbs(p)
    rp.realpath(p, self.realpathCache, function (er, real) {
      if (!er)
        set[real] = true
      else if (er.syscall === 'stat')
        set[p] = true
      else
        self.emit('error', er) // srsly wtf right here

      if (--n === 0) {
        self.matches[index] = set
        cb()
      }
    })
  })
}

Glob.prototype._mark = function (p) {
  return common.mark(this, p)
}

Glob.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}

Glob.prototype.abort = function () {
  this.aborted = true
  this.emit('abort')
}

Glob.prototype.pause = function () {
  if (!this.paused) {
    this.paused = true
    this.emit('pause')
  }
}

Glob.prototype.resume = function () {
  if (this.paused) {
    this.emit('resume')
    this.paused = false
    if (this._emitQueue.length) {
      var eq = this._emitQueue.slice(0)
      this._emitQueue.length = 0
      for (var i = 0; i < eq.length; i ++) {
        var e = eq[i]
        this._emitMatch(e[0], e[1])
      }
    }
    if (this._processQueue.length) {
      var pq = this._processQueue.slice(0)
      this._processQueue.length = 0
      for (var i = 0; i < pq.length; i ++) {
        var p = pq[i]
        this._processing--
        this._process(p[0], p[1], p[2], p[3])
      }
    }
  }
}

Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
  assert(this instanceof Glob)
  assert(typeof cb === 'function')

  if (this.aborted)
    return

  this._processing++
  if (this.paused) {
    this._processQueue.push([pattern, index, inGlobStar, cb])
    return
  }

  //console.error('PROCESS %d', this._processing, pattern)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // see if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index, cb)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip _processing
  if (childrenIgnored(this, read))
    return cb()

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb)
}

Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}

Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return cb()

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return cb()

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return cb()
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix) {
      if (prefix !== '/')
        e = prefix + '/' + e
      else
        e = prefix + e
    }
    this._process([e].concat(remain), index, inGlobStar, cb)
  }
  cb()
}

Glob.prototype._emitMatch = function (index, e) {
  if (this.aborted)
    return

  if (isIgnored(this, e))
    return

  if (this.paused) {
    this._emitQueue.push([index, e])
    return
  }

  var abs = isAbsolute(e) ? e : this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute)
    e = abs

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  var st = this.statCache[abs]
  if (st)
    this.emit('stat', e, st)

  this.emit('match', e)
}

Glob.prototype._readdirInGlobStar = function (abs, cb) {
  if (this.aborted)
    return

  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false, cb)

  var lstatkey = 'lstat\0' + abs
  var self = this
  var lstatcb = inflight(lstatkey, lstatcb_)

  if (lstatcb)
    fs.lstat(abs, lstatcb)

  function lstatcb_ (er, lstat) {
    if (er && er.code === 'ENOENT')
      return cb()

    var isSym = lstat && lstat.isSymbolicLink()
    self.symlinks[abs] = isSym

    // If it's not a symlink or a dir, then it's definitely a regular file.
    // don't bother doing a readdir in that case.
    if (!isSym && lstat && !lstat.isDirectory()) {
      self.cache[abs] = 'FILE'
      cb()
    } else
      self._readdir(abs, false, cb)
  }
}

Glob.prototype._readdir = function (abs, inGlobStar, cb) {
  if (this.aborted)
    return

  cb = inflight('readdir\0'+abs+'\0'+inGlobStar, cb)
  if (!cb)
    return

  //console.error('RD %j %j', +inGlobStar, abs)
  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs, cb)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return cb()

    if (Array.isArray(c))
      return cb(null, c)
  }

  var self = this
  fs.readdir(abs, readdirCb(this, abs, cb))
}

function readdirCb (self, abs, cb) {
  return function (er, entries) {
    if (er)
      self._readdirError(abs, er, cb)
    else
      self._readdirEntries(abs, entries, cb)
  }
}

Glob.prototype._readdirEntries = function (abs, entries, cb) {
  if (this.aborted)
    return

  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries
  return cb(null, entries)
}

Glob.prototype._readdirError = function (f, er, cb) {
  if (this.aborted)
    return

  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        this.emit('error', error)
        this.abort()
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict) {
        this.emit('error', er)
        // If the error is handled, then we abort
        // if not, we threw out of here
        this.abort()
      }
      if (!this.silent)
        console.error('glob error', er)
      break
  }

  return cb()
}

Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}


Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  //console.error('pgs2', prefix, remain[0], entries)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return cb()

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false, cb)

  var isSym = this.symlinks[abs]
  var len = entries.length

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return cb()

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true, cb)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true, cb)
  }

  cb()
}

Glob.prototype._processSimple = function (prefix, index, cb) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var self = this
  this._stat(prefix, function (er, exists) {
    self._processSimple2(prefix, index, er, exists, cb)
  })
}
Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

  //console.error('ps2', prefix, exists)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return cb()

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
  cb()
}

// Returns either 'DIR', 'FILE', or false
Glob.prototype._stat = function (f, cb) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return cb()

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return cb(null, c)

    if (needDir && c === 'FILE')
      return cb()

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (stat !== undefined) {
    if (stat === false)
      return cb(null, stat)
    else {
      var type = stat.isDirectory() ? 'DIR' : 'FILE'
      if (needDir && type === 'FILE')
        return cb()
      else
        return cb(null, type, stat)
    }
  }

  var self = this
  var statcb = inflight('stat\0' + abs, lstatcb_)
  if (statcb)
    fs.lstat(abs, statcb)

  function lstatcb_ (er, lstat) {
    if (lstat && lstat.isSymbolicLink()) {
      // If it's a symlink, then treat it as the target, unless
      // the target does not exist, then treat it as a file.
      return fs.stat(abs, function (er, stat) {
        if (er)
          self._stat2(f, abs, null, lstat, cb)
        else
          self._stat2(f, abs, er, stat, cb)
      })
    } else {
      self._stat2(f, abs, er, lstat, cb)
    }
  }
}

Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
    this.statCache[abs] = false
    return cb()
  }

  var needDir = f.slice(-1) === '/'
  this.statCache[abs] = stat

  if (abs.slice(-1) === '/' && stat && !stat.isDirectory())
    return cb(null, false, stat)

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'
  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return cb()

  return cb(null, c, stat)
}

}).call(this,require('_process'))
},{"./common.js":11,"./sync.js":13,"_process":25,"assert":3,"events":8,"fs":6,"fs.realpath":9,"inflight":15,"inherits":16,"minimatch":17,"once":19,"path":20,"path-is-absolute":21,"util":194}],13:[function(require,module,exports){
(function (process){
module.exports = globSync
globSync.GlobSync = GlobSync

var fs = require('fs')
var rp = require('fs.realpath')
var minimatch = require('minimatch')
var Minimatch = minimatch.Minimatch
var Glob = require('./glob.js').Glob
var util = require('util')
var path = require('path')
var assert = require('assert')
var isAbsolute = require('path-is-absolute')
var common = require('./common.js')
var alphasort = common.alphasort
var alphasorti = common.alphasorti
var setopts = common.setopts
var ownProp = common.ownProp
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

function globSync (pattern, options) {
  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  return new GlobSync(pattern, options).found
}

function GlobSync (pattern, options) {
  if (!pattern)
    throw new Error('must provide pattern')

  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  if (!(this instanceof GlobSync))
    return new GlobSync(pattern, options)

  setopts(this, pattern, options)

  if (this.noprocess)
    return this

  var n = this.minimatch.set.length
  this.matches = new Array(n)
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false)
  }
  this._finish()
}

GlobSync.prototype._finish = function () {
  assert(this instanceof GlobSync)
  if (this.realpath) {
    var self = this
    this.matches.forEach(function (matchset, index) {
      var set = self.matches[index] = Object.create(null)
      for (var p in matchset) {
        try {
          p = self._makeAbs(p)
          var real = rp.realpathSync(p, self.realpathCache)
          set[real] = true
        } catch (er) {
          if (er.syscall === 'stat')
            set[self._makeAbs(p)] = true
          else
            throw er
        }
      }
    })
  }
  common.finish(this)
}


GlobSync.prototype._process = function (pattern, index, inGlobStar) {
  assert(this instanceof GlobSync)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // See if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip processing
  if (childrenIgnored(this, read))
    return

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar)
}


GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
  var entries = this._readdir(abs, inGlobStar)

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix.slice(-1) !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix)
      newPattern = [prefix, e]
    else
      newPattern = [e]
    this._process(newPattern.concat(remain), index, inGlobStar)
  }
}


GlobSync.prototype._emitMatch = function (index, e) {
  if (isIgnored(this, e))
    return

  var abs = this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute) {
    e = abs
  }

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  if (this.stat)
    this._stat(e)
}


GlobSync.prototype._readdirInGlobStar = function (abs) {
  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false)

  var entries
  var lstat
  var stat
  try {
    lstat = fs.lstatSync(abs)
  } catch (er) {
    if (er.code === 'ENOENT') {
      // lstat failed, doesn't exist
      return null
    }
  }

  var isSym = lstat && lstat.isSymbolicLink()
  this.symlinks[abs] = isSym

  // If it's not a symlink or a dir, then it's definitely a regular file.
  // don't bother doing a readdir in that case.
  if (!isSym && lstat && !lstat.isDirectory())
    this.cache[abs] = 'FILE'
  else
    entries = this._readdir(abs, false)

  return entries
}

GlobSync.prototype._readdir = function (abs, inGlobStar) {
  var entries

  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return null

    if (Array.isArray(c))
      return c
  }

  try {
    return this._readdirEntries(abs, fs.readdirSync(abs))
  } catch (er) {
    this._readdirError(abs, er)
    return null
  }
}

GlobSync.prototype._readdirEntries = function (abs, entries) {
  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries

  // mark and cache dir-ness
  return entries
}

GlobSync.prototype._readdirError = function (f, er) {
  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        throw error
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict)
        throw er
      if (!this.silent)
        console.error('glob error', er)
      break
  }
}

GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

  var entries = this._readdir(abs, inGlobStar)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false)

  var len = entries.length
  var isSym = this.symlinks[abs]

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true)
  }
}

GlobSync.prototype._processSimple = function (prefix, index) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var exists = this._stat(prefix)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
}

// Returns either 'DIR', 'FILE', or false
GlobSync.prototype._stat = function (f) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return false

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return c

    if (needDir && c === 'FILE')
      return false

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (!stat) {
    var lstat
    try {
      lstat = fs.lstatSync(abs)
    } catch (er) {
      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
        this.statCache[abs] = false
        return false
      }
    }

    if (lstat && lstat.isSymbolicLink()) {
      try {
        stat = fs.statSync(abs)
      } catch (er) {
        stat = lstat
      }
    } else {
      stat = lstat
    }
  }

  this.statCache[abs] = stat

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'

  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return false

  return c
}

GlobSync.prototype._mark = function (p) {
  return common.mark(this, p)
}

GlobSync.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}

}).call(this,require('_process'))
},{"./common.js":11,"./glob.js":12,"_process":25,"assert":3,"fs":6,"fs.realpath":9,"minimatch":17,"path":20,"path-is-absolute":21,"util":194}],14:[function(require,module,exports){
'use strict';
var Promise = require('pinkie-promise');
var arrayUnion = require('array-union');
var objectAssign = require('object-assign');
var glob = require('glob');
var pify = require('pify');

var globP = pify(glob, Promise).bind(glob);

function isNegative(pattern) {
	return pattern[0] === '!';
}

function isString(value) {
	return typeof value === 'string';
}

function assertPatternsInput(patterns) {
	if (!patterns.every(isString)) {
		throw new TypeError('patterns must be a string or an array of strings');
	}
}

function generateGlobTasks(patterns, opts) {
	patterns = [].concat(patterns);
	assertPatternsInput(patterns);

	var globTasks = [];

	opts = objectAssign({
		cache: Object.create(null),
		statCache: Object.create(null),
		realpathCache: Object.create(null),
		symlinks: Object.create(null),
		ignore: []
	}, opts);

	patterns.forEach(function (pattern, i) {
		if (isNegative(pattern)) {
			return;
		}

		var ignore = patterns.slice(i).filter(isNegative).map(function (pattern) {
			return pattern.slice(1);
		});

		globTasks.push({
			pattern: pattern,
			opts: objectAssign({}, opts, {
				ignore: opts.ignore.concat(ignore)
			})
		});
	});

	return globTasks;
}

module.exports = function (patterns, opts) {
	var globTasks;

	try {
		globTasks = generateGlobTasks(patterns, opts);
	} catch (err) {
		return Promise.reject(err);
	}

	return Promise.all(globTasks.map(function (task) {
		return globP(task.pattern, task.opts);
	})).then(function (paths) {
		return arrayUnion.apply(null, paths);
	});
};

module.exports.sync = function (patterns, opts) {
	var globTasks = generateGlobTasks(patterns, opts);

	return globTasks.reduce(function (matches, task) {
		return arrayUnion(matches, glob.sync(task.pattern, task.opts));
	}, []);
};

module.exports.generateGlobTasks = generateGlobTasks;

module.exports.hasMagic = function (patterns, opts) {
	return [].concat(patterns).some(function (pattern) {
		return glob.hasMagic(pattern, opts);
	});
};

},{"array-union":1,"glob":12,"object-assign":18,"pify":22,"pinkie-promise":23}],15:[function(require,module,exports){
(function (process){
var wrappy = require('wrappy')
var reqs = Object.create(null)
var once = require('once')

module.exports = wrappy(inflight)

function inflight (key, cb) {
  if (reqs[key]) {
    reqs[key].push(cb)
    return null
  } else {
    reqs[key] = [cb]
    return makeres(key)
  }
}

function makeres (key) {
  return once(function RES () {
    var cbs = reqs[key]
    var len = cbs.length
    var args = slice(arguments)

    // XXX It's somewhat ambiguous whether a new callback added in this
    // pass should be queued for later execution if something in the
    // list of callbacks throws, or if it should just be discarded.
    // However, it's such an edge case that it hardly matters, and either
    // choice is likely as surprising as the other.
    // As it happens, we do go ahead and schedule it for later execution.
    try {
      for (var i = 0; i < len; i++) {
        cbs[i].apply(null, args)
      }
    } finally {
      if (cbs.length > len) {
        // added more in the interim.
        // de-zalgo, just in case, but don't call again.
        cbs.splice(0, len)
        process.nextTick(function () {
          RES.apply(null, args)
        })
      } else {
        delete reqs[key]
      }
    }
  })
}

function slice (args) {
  var length = args.length
  var array = []

  for (var i = 0; i < length; i++) array[i] = args[i]
  return array
}

}).call(this,require('_process'))
},{"_process":25,"once":19,"wrappy":195}],16:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],17:[function(require,module,exports){
module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = { sep: '/' }
try {
  path = require('path')
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = require('brace-expansion')

var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]'

// * => any number of characters
var star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!')

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows support: need to use /, not \
  if (path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/')
  }

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function () {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
  var negate = false
  var options = this.options
  var negateOffset = 0

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate
    negateOffset++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
}

Minimatch.prototype.braceExpand = braceExpand

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options
    } else {
      options = {}
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = ''
  var hasMagic = !!options.nocase
  var escaping = false
  // ? => one single character
  var patternListStack = []
  var negativeLists = []
  var stateChar
  var inClass = false
  var reClassStart = -1
  var classStart = -1
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)'
  var self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star
          hasMagic = true
        break
        case '?':
          re += qmark
          hasMagic = true
        break
        default:
          re += '\\' + stateChar
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c
      escaping = false
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar()
        escaping = true
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === '!' && i === classStart + 1) c = '^'
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
      continue

      case '(':
        if (inClass) {
          re += '('
          continue
        }

        if (!stateChar) {
          re += '\\('
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)'
          continue
        }

        clearStateChar()
        hasMagic = true
        var pl = patternListStack.pop()
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close
        if (pl.type === '!') {
          negativeLists.push(pl)
        }
        pl.reEnd = re.length
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|'
          escaping = false
          continue
        }

        clearStateChar()
        re += '|'
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += '\\' + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c
          escaping = false
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + cs + ']')
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE)
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
            hasMagic = hasMagic || sp[1]
            inClass = false
            continue
          }
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\'
        }

        re += c

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1)
    sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + '\\[' + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length)
    this.debug('setting tail', re, pl)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\'
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    })

    this.debug('tail=%j\n   %s', tail, tail, pl, re)
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart) + t + '\\(' + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += '\\\\'
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n]

    var nlBefore = re.slice(0, nl.reStart)
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
    var nlAfter = re.slice(nl.reEnd)

    nlLast += nlAfter

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1
    var cleanAfter = nlAfter
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
    }
    nlAfter = cleanAfter

    var dollar = ''
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$'
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
    re = newRe
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re
  }

  if (addPatternStart) {
    re = patternStart + re
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : ''
  try {
    var regExp = new RegExp('^' + re + '$', flags)
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) {
    this.regexp = false
    return this.regexp
  }
  var options = this.options

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot
  var flags = options.nocase ? 'i' : ''

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|')

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$'

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$'

  try {
    this.regexp = new RegExp(re, flags)
  } catch (ex) {
    this.regexp = false
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug('match', f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/')
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, 'split', f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, 'set', set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename
  var i
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i]
    var file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern })

  this.debug('matchOne', file.length, pattern.length)

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop')
    var p = pattern[pi]
    var f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
      var pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr)
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr++
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug('string match', p, f, hit)
    } else {
      hit = f.match(p)
      this.debug('pattern match', p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '')
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
}

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

},{"brace-expansion":5,"path":20}],18:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],19:[function(require,module,exports){
var wrappy = require('wrappy')
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}

},{"wrappy":195}],20:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":25}],21:[function(require,module,exports){
(function (process){
'use strict';

function posix(path) {
	return path.charAt(0) === '/';
}

function win32(path) {
	// https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
	var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
	var result = splitDeviceRe.exec(path);
	var device = result[1] || '';
	var isUnc = Boolean(device && device.charAt(1) !== ':');

	// UNC paths are always absolute
	return Boolean(result[2] || isUnc);
}

module.exports = process.platform === 'win32' ? win32 : posix;
module.exports.posix = posix;
module.exports.win32 = win32;

}).call(this,require('_process'))
},{"_process":25}],22:[function(require,module,exports){
'use strict';

var processFn = function (fn, P, opts) {
	return function () {
		var that = this;
		var args = new Array(arguments.length);

		for (var i = 0; i < arguments.length; i++) {
			args[i] = arguments[i];
		}

		return new P(function (resolve, reject) {
			args.push(function (err, result) {
				if (err) {
					reject(err);
				} else if (opts.multiArgs) {
					var results = new Array(arguments.length - 1);

					for (var i = 1; i < arguments.length; i++) {
						results[i - 1] = arguments[i];
					}

					resolve(results);
				} else {
					resolve(result);
				}
			});

			fn.apply(that, args);
		});
	};
};

var pify = module.exports = function (obj, P, opts) {
	if (typeof P !== 'function') {
		opts = P;
		P = Promise;
	}

	opts = opts || {};
	opts.exclude = opts.exclude || [/.+Sync$/];

	var filter = function (key) {
		var match = function (pattern) {
			return typeof pattern === 'string' ? key === pattern : pattern.test(key);
		};

		return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
	};

	var ret = typeof obj === 'function' ? function () {
		if (opts.excludeMain) {
			return obj.apply(this, arguments);
		}

		return processFn(obj, P, opts).apply(this, arguments);
	} : {};

	return Object.keys(obj).reduce(function (ret, key) {
		var x = obj[key];

		ret[key] = typeof x === 'function' && filter(key) ? processFn(x, P, opts) : x;

		return ret;
	}, ret);
};

pify.all = pify;

},{}],23:[function(require,module,exports){
'use strict';

module.exports = typeof Promise === 'function' ? Promise : require('pinkie');

},{"pinkie":24}],24:[function(require,module,exports){
(function (global){
'use strict';

var PENDING = 'pending';
var SETTLED = 'settled';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';
var NOOP = function () {};
var isNode = typeof global !== 'undefined' && typeof global.process !== 'undefined' && typeof global.process.emit === 'function';

var asyncSetTimer = typeof setImmediate === 'undefined' ? setTimeout : setImmediate;
var asyncQueue = [];
var asyncTimer;

function asyncFlush() {
	// run promise callbacks
	for (var i = 0; i < asyncQueue.length; i++) {
		asyncQueue[i][0](asyncQueue[i][1]);
	}

	// reset async asyncQueue
	asyncQueue = [];
	asyncTimer = false;
}

function asyncCall(callback, arg) {
	asyncQueue.push([callback, arg]);

	if (!asyncTimer) {
		asyncTimer = true;
		asyncSetTimer(asyncFlush, 0);
	}
}

function invokeResolver(resolver, promise) {
	function resolvePromise(value) {
		resolve(promise, value);
	}

	function rejectPromise(reason) {
		reject(promise, reason);
	}

	try {
		resolver(resolvePromise, rejectPromise);
	} catch (e) {
		rejectPromise(e);
	}
}

function invokeCallback(subscriber) {
	var owner = subscriber.owner;
	var settled = owner._state;
	var value = owner._data;
	var callback = subscriber[settled];
	var promise = subscriber.then;

	if (typeof callback === 'function') {
		settled = FULFILLED;
		try {
			value = callback(value);
		} catch (e) {
			reject(promise, e);
		}
	}

	if (!handleThenable(promise, value)) {
		if (settled === FULFILLED) {
			resolve(promise, value);
		}

		if (settled === REJECTED) {
			reject(promise, value);
		}
	}
}

function handleThenable(promise, value) {
	var resolved;

	try {
		if (promise === value) {
			throw new TypeError('A promises callback cannot return that same promise.');
		}

		if (value && (typeof value === 'function' || typeof value === 'object')) {
			// then should be retrieved only once
			var then = value.then;

			if (typeof then === 'function') {
				then.call(value, function (val) {
					if (!resolved) {
						resolved = true;

						if (value === val) {
							fulfill(promise, val);
						} else {
							resolve(promise, val);
						}
					}
				}, function (reason) {
					if (!resolved) {
						resolved = true;

						reject(promise, reason);
					}
				});

				return true;
			}
		}
	} catch (e) {
		if (!resolved) {
			reject(promise, e);
		}

		return true;
	}

	return false;
}

function resolve(promise, value) {
	if (promise === value || !handleThenable(promise, value)) {
		fulfill(promise, value);
	}
}

function fulfill(promise, value) {
	if (promise._state === PENDING) {
		promise._state = SETTLED;
		promise._data = value;

		asyncCall(publishFulfillment, promise);
	}
}

function reject(promise, reason) {
	if (promise._state === PENDING) {
		promise._state = SETTLED;
		promise._data = reason;

		asyncCall(publishRejection, promise);
	}
}

function publish(promise) {
	promise._then = promise._then.forEach(invokeCallback);
}

function publishFulfillment(promise) {
	promise._state = FULFILLED;
	publish(promise);
}

function publishRejection(promise) {
	promise._state = REJECTED;
	publish(promise);
	if (!promise._handled && isNode) {
		global.process.emit('unhandledRejection', promise._data, promise);
	}
}

function notifyRejectionHandled(promise) {
	global.process.emit('rejectionHandled', promise);
}

/**
 * @class
 */
function Promise(resolver) {
	if (typeof resolver !== 'function') {
		throw new TypeError('Promise resolver ' + resolver + ' is not a function');
	}

	if (this instanceof Promise === false) {
		throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
	}

	this._then = [];

	invokeResolver(resolver, this);
}

Promise.prototype = {
	constructor: Promise,

	_state: PENDING,
	_then: null,
	_data: undefined,
	_handled: false,

	then: function (onFulfillment, onRejection) {
		var subscriber = {
			owner: this,
			then: new this.constructor(NOOP),
			fulfilled: onFulfillment,
			rejected: onRejection
		};

		if ((onRejection || onFulfillment) && !this._handled) {
			this._handled = true;
			if (this._state === REJECTED && isNode) {
				asyncCall(notifyRejectionHandled, this);
			}
		}

		if (this._state === FULFILLED || this._state === REJECTED) {
			// already resolved, call callback async
			asyncCall(invokeCallback, subscriber);
		} else {
			// subscribe
			this._then.push(subscriber);
		}

		return subscriber.then;
	},

	catch: function (onRejection) {
		return this.then(null, onRejection);
	}
};

Promise.all = function (promises) {
	if (!Array.isArray(promises)) {
		throw new TypeError('You must pass an array to Promise.all().');
	}

	return new Promise(function (resolve, reject) {
		var results = [];
		var remaining = 0;

		function resolver(index) {
			remaining++;
			return function (value) {
				results[index] = value;
				if (!--remaining) {
					resolve(results);
				}
			};
		}

		for (var i = 0, promise; i < promises.length; i++) {
			promise = promises[i];

			if (promise && typeof promise.then === 'function') {
				promise.then(resolver(i), reject);
			} else {
				results[i] = promise;
			}
		}

		if (!remaining) {
			resolve(results);
		}
	});
};

Promise.race = function (promises) {
	if (!Array.isArray(promises)) {
		throw new TypeError('You must pass an array to Promise.race().');
	}

	return new Promise(function (resolve, reject) {
		for (var i = 0, promise; i < promises.length; i++) {
			promise = promises[i];

			if (promise && typeof promise.then === 'function') {
				promise.then(resolve, reject);
			} else {
				resolve(promise);
			}
		}
	});
};

Promise.resolve = function (value) {
	if (value && typeof value === 'object' && value.constructor === Promise) {
		return value;
	}

	return new Promise(function (resolve) {
		resolve(value);
	});
};

Promise.reject = function (reason) {
	return new Promise(function (resolve, reject) {
		reject(reason);
	});
};

module.exports = Promise;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],25:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const globby = require("globby");
const utils_1 = require("./utils");
/**
 * @internal
 */
class DefaultFileSystemHost {
    readFile(filePath, encoding = "utf-8") {
        return fs.readFileSync(filePath, encoding);
    }
    writeFile(filePath, fileText) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, fileText, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    writeFileSync(filePath, fileText) {
        fs.writeFileSync(filePath, fileText);
    }
    fileExists(filePath) {
        try {
            return fs.statSync(filePath).isFile();
        }
        catch (err) {
            return false;
        }
    }
    directoryExists(dirPath) {
        try {
            return fs.statSync(dirPath).isDirectory();
        }
        catch (err) {
            return false;
        }
    }
    getCurrentDirectory() {
        return utils_1.FileUtils.getCurrentDirectory();
    }
    glob(patterns) {
        return globby.sync(patterns);
    }
}
exports.DefaultFileSystemHost = DefaultFileSystemHost;



},{"./utils":179,"fs":6,"globby":14}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
const factories_1 = require("./factories");
const compiler_1 = require("./compiler");
const ManipulationSettings_1 = require("./ManipulationSettings");
/**
 * Global container.
 * @internal
 */
class GlobalContainer {
    constructor(fileSystem, compilerOptions, createLanguageService) {
        this._manipulationSettings = new ManipulationSettings_1.ManipulationSettingsContainer();
        this._fileSystem = fileSystem;
        this._compilerOptions = compilerOptions;
        this._compilerFactory = new factories_1.CompilerFactory(this);
        this._languageService = createLanguageService ? new compiler_1.LanguageService(this) : undefined;
        if (this._languageService != null) {
            this.compilerFactory.onSourceFileAdded(args => {
                this._languageService.addSourceFile(args.addedSourceFile);
            });
        }
    }
    /** Gets the file system. */
    get fileSystem() {
        return this._fileSystem;
    }
    /** Gets the compiler options. */
    get compilerOptions() {
        return this._compilerOptions;
    }
    /** Gets the manipulation settings. */
    get manipulationSettings() {
        return this._manipulationSettings;
    }
    /** Gets the compiler factory. */
    get compilerFactory() {
        return this._compilerFactory;
    }
    /** Gets the language service. Throws an exception if it doesn't exist. */
    get languageService() {
        if (this._languageService == null) {
            throw new errors.InvalidOperationError("A language service is required for this operation. " +
                "This might occur when manipulating or getting type information from a node that was not added " +
                `to a TsSimpleAst object and created via ${"createWrappedNode"}. ` +
                "Please submit a bug report if you don't believe a language service should be required for this operation.");
        }
        return this._languageService;
    }
    /**
     * Gets the program.
     */
    get program() {
        return this.languageService.getProgram();
    }
    /**
     * Gets the type checker.
     */
    get typeChecker() {
        return this.program.getTypeChecker();
    }
    /**
     * Gets if this object has a language service.
     */
    hasLanguageService() {
        return this._languageService != null;
    }
    /**
     * Resets the program.
     */
    resetProgram() {
        this.languageService.resetProgram();
    }
}
exports.GlobalContainer = GlobalContainer;



},{"./ManipulationSettings":28,"./compiler":30,"./errors":137,"./factories":149}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
/** String characters */
var StringChar;
(function (StringChar) {
    /** Double quote */
    StringChar["DoubleQuote"] = "\"";
    /** Single quote */
    StringChar["SingleQuote"] = "'";
})(/* istanbul ignore next */StringChar = exports.StringChar || (exports.StringChar = {}));
/** Kinds of new lines */
var NewLineKind;
(function (NewLineKind) {
    /** Line feed */
    NewLineKind["LineFeed"] = "\n";
    /** Carriage return and line feed */
    NewLineKind["CarriageReturnLineFeed"] = "\r\n";
})(/* istanbul ignore next */NewLineKind = exports.NewLineKind || (exports.NewLineKind = {}));
/** Kinds of indentation */
var IndentationText;
(function (IndentationText) {
    /** Two spaces */
    IndentationText["TwoSpaces"] = "  ";
    /** Four spaces */
    IndentationText["FourSpaces"] = "    ";
    /** Eight spaces */
    IndentationText["EightSpaces"] = "        ";
    /** Tab */
    IndentationText["Tab"] = "\t";
})(/* istanbul ignore next */IndentationText = exports.IndentationText || (exports.IndentationText = {}));
/**
 * Holds the manipulation settings.
 */
class ManipulationSettingsContainer {
    constructor() {
        this.settings = {
            indentationText: IndentationText.FourSpaces,
            newLineKind: NewLineKind.LineFeed,
            scriptTarget: ts.ScriptTarget.Latest,
            stringChar: StringChar.DoubleQuote
        };
    }
    /**
     * Gets the string character.
     */
    getStringChar() {
        return this.settings.stringChar;
    }
    /**
     * Gets the new line kind.
     */
    getNewLineKind() {
        return this.settings.newLineKind;
    }
    /**
     * Gets the indentation text;
     */
    getIndentationText() {
        return this.settings.indentationText;
    }
    /**
     * Gets the script target.
     */
    getScriptTarget() {
        return this.settings.scriptTarget;
    }
    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings) {
        Object.assign(this.settings, settings);
    }
}
exports.ManipulationSettingsContainer = ManipulationSettingsContainer;



},{"typescript":"typescript"}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./errors");
const utils_1 = require("./utils");
const DefaultFileSystemHost_1 = require("./DefaultFileSystemHost");
const GlobalContainer_1 = require("./GlobalContainer");
/**
 * Compiler wrapper.
 */
class TsSimpleAst {
    /**
     * Initializes a new instance.
     * @param options - Optional options.
     * @param fileSystem - Optional file system host. Useful for mocking access to the file system.
     */
    constructor(options = {}, fileSystem = new DefaultFileSystemHost_1.DefaultFileSystemHost()) {
        this.fileSystem = fileSystem;
        if (options.tsConfigFilePath != null && options.compilerOptions != null)
            throw new errors.InvalidOperationError(`Cannot set both ${"tsConfigFilePath"} and ${"compilerOptions"}.`);
        const compilerOptionsResolver = new utils_1.CompilerOptionsResolver(fileSystem, options);
        this.global = new GlobalContainer_1.GlobalContainer(fileSystem, compilerOptionsResolver.getCompilerOptions(), true);
        if (options.manipulationSettings != null)
            this.global.manipulationSettings.set(options.manipulationSettings);
    }
    /** Gets the manipulation settings. */
    get manipulationSettings() {
        return this.global.manipulationSettings;
    }
    /**
     * Add source files based on file globs.
     * @param fileGlobs - File globs to add files based on.
     */
    addSourceFiles(...fileGlobs) {
        const filePaths = this.fileSystem.glob(fileGlobs);
        for (const filePath of filePaths) {
            // ignore any FileNotFoundErrors
            try {
                this.getOrAddSourceFileFromFilePath(filePath);
            }
            catch (ex) {
                /* istanbul ignore if */
                if (!(ex instanceof errors.FileNotFoundError))
                    throw ex;
            }
        }
    }
    /**
     * Gets or adds a source file from a file path.
     * @param filePath - File path to create the file from.
     */
    getOrAddSourceFileFromFilePath(filePath) {
        const absoluteFilePath = utils_1.FileUtils.getStandardizedAbsolutePath(filePath);
        if (!this.fileSystem.fileExists(absoluteFilePath))
            throw new errors.FileNotFoundError(absoluteFilePath);
        return this.global.compilerFactory.getSourceFileFromFilePath(absoluteFilePath);
    }
    /**
     * Adds a source file from text.
     * @param filePath - File path for the source file.
     * @param sourceFileText - Source file text.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    addSourceFileFromText(filePath, sourceFileText) {
        return this.global.compilerFactory.addSourceFileFromText(filePath, sourceFileText);
    }
    /**
     * Adds a source file from a structure.
     * @param filePath - File path for the source file.
     * @param structure - Structure that represents the source file.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    addSourceFileFromStructure(filePath, structure) {
        const sourceFile = this.global.compilerFactory.addSourceFileFromText(filePath, "");
        sourceFile.fill(structure);
        return sourceFile;
    }
    /**
     * Removes a source file from the AST.
     * @param sourceFile - Source file to remove.
     * @returns True if removed.
     */
    removeSourceFile(sourceFile) {
        return this.global.languageService.removeSourceFile(sourceFile);
    }
    getSourceFile(fileNameOrSearchFunction) {
        let searchFunction = fileNameOrSearchFunction;
        if (typeof fileNameOrSearchFunction === "string")
            searchFunction = def => utils_1.FileUtils.filePathMatches(def.getFilePath(), fileNameOrSearchFunction);
        return this.getSourceFiles().find(searchFunction);
    }
    /**
     * Gets all the source files contained in the compiler wrapper.
     */
    getSourceFiles() {
        return this.global.languageService.getSourceFiles();
    }
    /**
     * Saves all the unsaved source files.
     */
    saveUnsavedSourceFiles() {
        return Promise.all(this.getUnsavedSourceFiles().map(f => f.save()));
    }
    /**
     * Saves all the unsaved source files synchronously.
     *
     * Remarks: This might be very slow compared to the asynchronous version if there are a lot of files.
     */
    saveUnsavedSourceFilesSync() {
        // sidenote: I wish I could do something like in c# where I do this all asynchronously then
        // wait synchronously on the task. It would not be as bad as this is performance wise. Maybe there
        // is a way, but people just shouldn't be using this method unless they're really lazy.
        for (const file of this.getUnsavedSourceFiles())
            file.saveSync();
    }
    getUnsavedSourceFiles() {
        return this.getSourceFiles().filter(f => !f.isSaved());
    }
    /**
     * Gets the compiler diagnostics.
     */
    getDiagnostics() {
        // todo: implement cancellation token
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.global.program.compilerObject);
        return compilerDiagnostics.map(d => this.global.compilerFactory.getDiagnostic(d));
    }
    /**
     * Gets a language service.
     */
    getLanguageService() {
        return this.global.languageService;
    }
    /**
     * Emits all the source files.
     * @param emitOptions - Optional emit options.
     */
    emit(emitOptions = {}) {
        return this.global.program.emit(emitOptions);
    }
}
exports.TsSimpleAst = TsSimpleAst;



},{"./DefaultFileSystemHost":26,"./GlobalContainer":27,"./errors":137,"./utils":179,"typescript":"typescript"}],30:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./compiler/base"));
__export(require("./compiler/common"));
__export(require("./compiler/class"));
__export(require("./compiler/decorator"));
__export(require("./compiler/doc"));
__export(require("./compiler/enum"));
__export(require("./compiler/file"));
__export(require("./compiler/function"));
__export(require("./compiler/general"));
__export(require("./compiler/interface"));
__export(require("./compiler/namespace"));
__export(require("./compiler/statement"));
__export(require("./compiler/variable"));
__export(require("./compiler/tools"));
__export(require("./compiler/type"));



},{"./compiler/base":31,"./compiler/class":61,"./compiler/common":70,"./compiler/decorator":78,"./compiler/doc":80,"./compiler/enum":82,"./compiler/file":85,"./compiler/function":91,"./compiler/general":97,"./compiler/interface":99,"./compiler/namespace":104,"./compiler/statement":107,"./compiler/tools":109,"./compiler/type":125,"./compiler/variable":131}],31:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./base/name"));
__export(require("./base/initializer"));
__export(require("./base/AmbientableNode"));
__export(require("./base/AsyncableNode"));
__export(require("./base/BodyableNode"));
__export(require("./base/BodiedNode"));
__export(require("./base/DecoratableNode"));
__export(require("./base/DocumentationableNode"));
__export(require("./base/ExportableNode"));
__export(require("./base/ExtendsClauseableNode"));
__export(require("./base/GeneratorableNode"));
__export(require("./base/HeritageClauseableNode"));
__export(require("./base/ImplementsClauseableNode"));
__export(require("./base/ModifierableNode"));
__export(require("./base/ParameteredNode"));
__export(require("./base/QuestionTokenableNode"));
__export(require("./base/ReadonlyableNode"));
__export(require("./base/ReturnTypedNode"));
__export(require("./base/ScopeableNode"));
__export(require("./base/ScopedNode"));
__export(require("./base/StaticableNode"));
__export(require("./base/TypedNode"));
__export(require("./base/TypeParameteredNode"));



},{"./base/AmbientableNode":32,"./base/AsyncableNode":33,"./base/BodiedNode":34,"./base/BodyableNode":35,"./base/DecoratableNode":36,"./base/DocumentationableNode":37,"./base/ExportableNode":38,"./base/ExtendsClauseableNode":39,"./base/GeneratorableNode":40,"./base/HeritageClauseableNode":41,"./base/ImplementsClauseableNode":42,"./base/ModifierableNode":43,"./base/ParameteredNode":44,"./base/QuestionTokenableNode":45,"./base/ReadonlyableNode":46,"./base/ReturnTypedNode":47,"./base/ScopeableNode":48,"./base/ScopedNode":49,"./base/StaticableNode":50,"./base/TypeParameteredNode":51,"./base/TypedNode":52,"./base/initializer":53,"./base/name":55}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../callBaseFill");
function AmbientableNode(Base) {
    return class extends Base {
        hasDeclareKeyword() {
            return this.getDeclareKeyword() != null;
        }
        getDeclareKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.DeclareKeyword);
        }
        isAmbient() {
            const isThisAmbient = (this.getCombinedModifierFlags() & ts.ModifierFlags.Ambient) === ts.ModifierFlags.Ambient;
            if (isThisAmbient || this.isInterfaceDeclaration() || this.isTypeAliasDeclaration())
                return true;
            let topParent = this;
            for (const parent of this.getParents()) {
                topParent = parent; // store the top parent for later
                const modifierFlags = parent.getCombinedModifierFlags();
                if (modifierFlags & ts.ModifierFlags.Ambient)
                    return true;
            }
            return topParent.isSourceFile() && topParent.isDeclarationFile();
        }
        toggleDeclareKeyword(value) {
            this.toggleModifier("declare", value);
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.hasDeclareKeyword != null)
                this.toggleDeclareKeyword(structure.hasDeclareKeyword);
            return this;
        }
    };
}
exports.AmbientableNode = AmbientableNode;



},{"./../callBaseFill":60,"typescript":"typescript"}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../callBaseFill");
function AsyncableNode(Base) {
    return class extends Base {
        isAsync() {
            return this.hasModifier(ts.SyntaxKind.AsyncKeyword);
        }
        getAsyncKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.AsyncKeyword);
        }
        setIsAsync(value) {
            this.toggleModifier("async", value);
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.isAsync != null)
                this.setIsAsync(structure.isAsync);
            return this;
        }
    };
}
exports.AsyncableNode = AsyncableNode;



},{"./../callBaseFill":60,"typescript":"typescript"}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../../errors");
function BodiedNode(Base) {
    return class extends Base {
        isBodiedNode() {
            return true;
        }
        getBody() {
            const body = this.compilerNode.body;
            if (body == null)
                throw new errors.InvalidOperationError("Bodied node should have a body.");
            return this.global.compilerFactory.getNodeFromCompilerNode(body, this.sourceFile);
        }
    };
}
exports.BodiedNode = BodiedNode;



},{"./../../errors":137}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../../errors");
function BodyableNode(Base) {
    return class extends Base {
        isBodyableNode() {
            return true;
        }
        getBodyOrThrow() {
            const body = this.getBody();
            if (body == null)
                throw new errors.InvalidOperationError("A node body is required to do this operation.");
            return body;
        }
        getBody() {
            const body = this.compilerNode.body;
            return body == null ? undefined : this.global.compilerFactory.getNodeFromCompilerNode(body, this.sourceFile);
        }
    };
}
exports.BodyableNode = BodyableNode;



},{"./../../errors":137}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../callBaseFill");
const manipulation_1 = require("./../../manipulation");
const textSeek_1 = require("./../../manipulation/textSeek");
const utils_1 = require("./../../utils");
function DecoratableNode(Base) {
    return class extends Base {
        getDecorators() {
            if (this.compilerNode.decorators == null)
                return [];
            return this.compilerNode.decorators.map(d => this.global.compilerFactory.getDecorator(d, this.sourceFile));
        }
        addDecorator(structure) {
            return this.insertDecorator(manipulation_1.getEndIndexFromArray(this.compilerNode.decorators), structure);
        }
        addDecorators(structures) {
            return this.insertDecorators(manipulation_1.getEndIndexFromArray(this.compilerNode.decorators), structures);
        }
        insertDecorator(index, structure) {
            return this.insertDecorators(index, [structure])[0];
        }
        insertDecorators(index, structures) {
            if (utils_1.ArrayUtils.isNullOrEmpty(structures))
                return [];
            const isParameterDecorator = this.getKind() === ts.SyntaxKind.Parameter;
            const decoratorLines = getDecoratorLines(structures);
            const decorators = this.getDecorators();
            const newLineText = this.global.manipulationSettings.getNewLineKind();
            index = manipulation_1.verifyAndGetIndex(index, decorators.length);
            let indentationText;
            let insertPos;
            if (decorators.length === 0) {
                indentationText = this.getIndentationText();
                insertPos = this.getStart();
            }
            else {
                const nextDecorator = decorators[index];
                if (nextDecorator == null) {
                    const previousDecorator = decorators[index - 1];
                    indentationText = previousDecorator.getIndentationText();
                    insertPos = textSeek_1.getNextNonWhitespacePos(this.getSourceFile().getFullText(), previousDecorator.getEnd());
                }
                else {
                    indentationText = nextDecorator.getIndentationText();
                    insertPos = nextDecorator.getStart();
                }
            }
            const decoratorCode = isParameterDecorator
                ? getDecoratorCodeOnSameLine({ decoratorLines })
                : getDecoratorCodeWithNewLines({ decoratorLines, newLineText, indentationText });
            if (decorators.length === 0)
                manipulation_1.insertCreatingSyntaxList({
                    parent: this,
                    insertPos: this.getStart(),
                    newText: decoratorCode
                });
            else
                manipulation_1.insertIntoSyntaxList({
                    insertPos,
                    newText: decoratorCode,
                    syntaxList: decorators[0].getParentSyntaxListOrThrow(),
                    childIndex: index,
                    insertItemsCount: structures.length
                });
            return this.getDecorators().slice(index, index + structures.length);
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.decorators != null && structure.decorators.length > 0)
                this.addDecorators(structure.decorators);
            return this;
        }
    };
}
exports.DecoratableNode = DecoratableNode;
function getDecoratorCodeOnSameLine(opts) {
    return opts.decoratorLines.join(" ") + " ";
}
function getDecoratorCodeWithNewLines(opts) {
    const { decoratorLines, newLineText, indentationText } = opts;
    let result = "";
    decoratorLines.forEach((l, i) => {
        if (i > 0)
            result += indentationText;
        result += l + newLineText;
    });
    result += indentationText;
    return result;
}
function getDecoratorLines(structures) {
    const lines = [];
    for (const structure of structures) {
        let line = `@${structure.name}`;
        if (structure.arguments != null)
            line += `(${structure.arguments.join(", ")})`;
        lines.push(line);
    }
    return lines;
}
function prependIndentationText(lines, indentationText) {
    return lines.map(l => indentationText + l);
}



},{"./../../manipulation":152,"./../../manipulation/textSeek":174,"./../../utils":179,"./../callBaseFill":60,"typescript":"typescript"}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manipulation_1 = require("./../../manipulation");
const callBaseFill_1 = require("./../callBaseFill");
const utils_1 = require("./../../utils");
function DocumentationableNode(Base) {
    return class extends Base {
        getDocumentationComment() {
            const docCommentNodes = this.getDocumentationCommentNodes();
            if (docCommentNodes.length === 0)
                return undefined;
            const texts = docCommentNodes.map(n => (n.compilerNode.comment || "").trim());
            return texts.filter(t => t.length > 0).join(this.global.manipulationSettings.getNewLineKind());
        }
        getDocumentationCommentNodes() {
            const nodes = this.compilerNode.jsDoc || [];
            return nodes.map(n => this.global.compilerFactory.getJSDoc(n, this.sourceFile));
        }
        addDoc(structure) {
            return this.addDocs([structure])[0];
        }
        addDocs(structures) {
            return this.insertDocs(manipulation_1.getEndIndexFromArray(this.compilerNode.jsDoc), structures);
        }
        insertDoc(index, structure) {
            return this.insertDocs(index, [structure])[0];
        }
        insertDocs(index, structures) {
            if (utils_1.ArrayUtils.isNullOrEmpty(structures))
                return [];
            const indentationText = this.getIndentationText();
            const newLineText = this.global.manipulationSettings.getNewLineKind();
            const code = `${getDocumentationCode(structures, indentationText, newLineText)}${newLineText}${indentationText}`;
            const nodes = this.getDocumentationCommentNodes();
            index = manipulation_1.verifyAndGetIndex(index, nodes.length);
            const insertPos = index === nodes.length ? this.getStart() : nodes[index].getStart();
            manipulation_1.insertStraight({
                insertPos,
                parent: this,
                newCode: code
            });
            return this.getDocumentationCommentNodes().slice(index, index + structures.length);
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.docs != null && structure.docs.length > 0)
                this.addDocs(structure.docs);
            return this;
        }
    };
}
exports.DocumentationableNode = DocumentationableNode;
function getDocumentationCode(structures, indentationText, newLineText) {
    let code = "";
    for (const structure of structures) {
        if (code.length > 0)
            code += `${newLineText}${indentationText}`;
        code += getDocumentationCodeForStructure(structure, indentationText, newLineText);
    }
    return code;
}
function getDocumentationCodeForStructure(structure, indentationText, newLineText) {
    const lines = structure.description.split(/\r?\n/);
    return `/**${newLineText}` + lines.map(l => `${indentationText} * ${l}`).join(newLineText) + `${newLineText}${indentationText} */`;
}



},{"./../../manipulation":152,"./../../utils":179,"./../callBaseFill":60}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
const callBaseFill_1 = require("./../callBaseFill");
function ExportableNode(Base) {
    return class extends Base {
        hasExportKeyword() {
            return this.getExportKeyword() != null;
        }
        getExportKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword);
        }
        hasDefaultKeyword() {
            return this.getDefaultKeyword() != null;
        }
        getDefaultKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.DefaultKeyword);
        }
        isDefaultExport() {
            if (this.hasDefaultKeyword())
                return true;
            const thisSymbol = this.getSymbol();
            const defaultExportSymbol = this.getSourceFile().getDefaultExportSymbol();
            if (defaultExportSymbol == null || thisSymbol == null)
                return false;
            if (thisSymbol.equals(defaultExportSymbol))
                return true;
            const aliasedSymbol = defaultExportSymbol.getAliasedSymbol();
            return thisSymbol.equals(aliasedSymbol);
        }
        isNamedExport() {
            const parentNode = this.getParentOrThrow();
            return parentNode.isSourceFile() && this.hasExportKeyword() && !this.hasDefaultKeyword();
        }
        setIsDefaultExport(value) {
            if (value === this.isDefaultExport())
                return this;
            if (value && !this.getParentOrThrow().isSourceFile())
                throw new errors.InvalidOperationError("The parent must be a source file in order to set this node as a default export.");
            // remove any existing default export
            const sourceFile = this.getSourceFile();
            const fileDefaultExportSymbol = sourceFile.getDefaultExportSymbol();
            if (fileDefaultExportSymbol != null)
                sourceFile.removeDefaultExport(fileDefaultExportSymbol);
            // set this node as the one to default export
            if (value) {
                this.addModifier("export");
                this.addModifier("default");
            }
            return this;
        }
        setIsExported(value) {
            // remove the default export if it is one no matter what
            if (this.getParentOrThrow().isSourceFile())
                this.setIsDefaultExport(false);
            if (value) {
                if (!this.hasExportKeyword())
                    this.addModifier("export");
            }
            else {
                const exportKeyword = this.getExportKeyword();
                if (exportKeyword != null)
                    manipulation_1.removeNodes([exportKeyword]);
            }
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.isExported != null)
                this.setIsExported(structure.isExported);
            if (structure.isDefaultExport != null)
                this.setIsDefaultExport(structure.isDefaultExport);
            return this;
        }
    };
}
exports.ExportableNode = ExportableNode;



},{"./../../errors":137,"./../../manipulation":152,"./../callBaseFill":60,"typescript":"typescript"}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const errors = require("./../../errors");
const callBaseFill_1 = require("./../callBaseFill");
function ExtendsClauseableNode(Base) {
    return class extends Base {
        getExtends() {
            const extendsClause = this.getHeritageClauses().find(c => c.compilerNode.token === ts.SyntaxKind.ExtendsKeyword);
            return extendsClause == null ? [] : extendsClause.getTypes();
        }
        addExtends(text) {
            return this.insertExtends(this.getExtends().length, text);
        }
        insertExtends(index, texts) {
            const length = texts instanceof Array ? texts.length : 0;
            if (typeof texts === "string") {
                errors.throwIfNotStringOrWhitespace(texts, "texts");
                texts = [texts];
            }
            else if (texts.length === 0) {
                return [];
            }
            const extendsTypes = this.getExtends();
            index = manipulation_1.verifyAndGetIndex(index, extendsTypes.length);
            if (extendsTypes.length > 0) {
                manipulation_1.insertIntoCommaSeparatedNodes({ currentNodes: extendsTypes, insertIndex: index, newTexts: texts });
                return manipulation_1.getNodeOrNodesToReturn(this.getExtends(), index, length);
            }
            const openBraceToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken);
            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[openBraceStart - 1]);
            let insertText = `extends ${texts.join(", ")} `;
            if (!isLastSpace)
                insertText = " " + insertText;
            manipulation_1.insertCreatingSyntaxList({
                parent: this,
                insertPos: openBraceStart,
                newText: insertText
            });
            return manipulation_1.getNodeOrNodesToReturn(this.getExtends(), index, length);
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.extends != null && structure.extends.length > 0)
                this.addExtends(structure.extends);
            return this;
        }
    };
}
exports.ExtendsClauseableNode = ExtendsClauseableNode;



},{"./../../errors":137,"./../../manipulation":152,"./../callBaseFill":60,"typescript":"typescript"}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const callBaseFill_1 = require("./../callBaseFill");
const manipulation_1 = require("./../../manipulation");
function GeneratorableNode(Base) {
    return class extends Base {
        isGenerator() {
            return this.compilerNode.asteriskToken != null;
        }
        getAsteriskToken() {
            const asteriskToken = this.compilerNode.asteriskToken;
            return asteriskToken == null ? undefined : this.global.compilerFactory.getNodeFromCompilerNode(asteriskToken, this.sourceFile);
        }
        setIsGenerator(value) {
            const asteriskToken = this.getAsteriskToken();
            const isSet = asteriskToken != null;
            if (isSet === value)
                return this;
            if (asteriskToken != null)
                manipulation_1.removeNodes([asteriskToken], { removePrecedingSpaces: false });
            else
                manipulation_1.insertStraight({
                    insertPos: getAsteriskInsertPosition(this),
                    parent: this,
                    newCode: "*"
                });
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.isGenerator != null)
                this.setIsGenerator(structure.isGenerator);
            return this;
        }
    };
}
exports.GeneratorableNode = GeneratorableNode;
function getAsteriskInsertPosition(node) {
    if (node.getKind() === ts.SyntaxKind.FunctionDeclaration) {
        return node.getFirstChildByKindOrThrow(ts.SyntaxKind.FunctionKeyword).getEnd();
    }
    const nameNode = node.compilerNode.name;
    /* istanbul ignore if */
    if (nameNode == null)
        throw new errors.NotImplementedError("Expected a name node for a non-function declaration.");
    return nameNode.getStart(node.sourceFile.compilerNode);
}



},{"./../../errors":137,"./../../manipulation":152,"./../callBaseFill":60,"typescript":"typescript"}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function HeritageClauseableNode(Base) {
    return class extends Base {
        getHeritageClauses() {
            const heritageClauses = this.compilerNode.heritageClauses;
            if (heritageClauses == null)
                return [];
            return heritageClauses.map(c => this.global.compilerFactory.getHeritageClause(c, this.sourceFile));
        }
    };
}
exports.HeritageClauseableNode = HeritageClauseableNode;



},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const callBaseFill_1 = require("./../callBaseFill");
const errors = require("./../../errors");
function ImplementsClauseableNode(Base) {
    return class extends Base {
        getImplements(heritageClauses = this.getHeritageClauses()) {
            const implementsClause = heritageClauses.find(c => c.compilerNode.token === ts.SyntaxKind.ImplementsKeyword);
            return implementsClause == null ? [] : implementsClause.getTypes();
        }
        addImplements(text) {
            return this.insertImplements(this.getImplements().length, text);
        }
        insertImplements(index, texts) {
            const length = texts instanceof Array ? texts.length : 0;
            if (typeof texts === "string") {
                errors.throwIfNotStringOrWhitespace(texts, "texts");
                texts = [texts];
            }
            else if (texts.length === 0) {
                return [];
            }
            const heritageClauses = this.getHeritageClauses();
            const implementsTypes = this.getImplements(heritageClauses);
            index = manipulation_1.verifyAndGetIndex(index, implementsTypes.length);
            if (implementsTypes.length > 0) {
                manipulation_1.insertIntoCommaSeparatedNodes({ currentNodes: implementsTypes, insertIndex: index, newTexts: texts });
                return manipulation_1.getNodeOrNodesToReturn(this.getImplements(), index, length);
            }
            const openBraceToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken);
            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[openBraceStart - 1]);
            let insertText = `implements ${texts.join(", ")} `;
            if (!isLastSpace)
                insertText = " " + insertText;
            // assumes there can only be another extends heritage clause
            if (heritageClauses.length === 0)
                manipulation_1.insertCreatingSyntaxList({
                    parent: this,
                    insertPos: openBraceStart,
                    newText: insertText
                });
            else
                manipulation_1.insertIntoSyntaxList({
                    insertPos: openBraceStart,
                    newText: insertText,
                    syntaxList: heritageClauses[0].getParentSyntaxListOrThrow(),
                    childIndex: 1,
                    insertItemsCount: 1
                });
            return manipulation_1.getNodeOrNodesToReturn(this.getImplements(), index, length);
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.implements != null && structure.implements.length > 0)
                this.addImplements(structure.implements);
            return this;
        }
    };
}
exports.ImplementsClauseableNode = ImplementsClauseableNode;



},{"./../../errors":137,"./../../manipulation":152,"./../callBaseFill":60,"typescript":"typescript"}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
function ModifierableNode(Base) {
    return class extends Base {
        getModifiers() {
            return this.compilerNode.modifiers == null ? [] : this.compilerNode.modifiers.map(m => this.global.compilerFactory.getNodeFromCompilerNode(m, this.sourceFile));
        }
        getFirstModifierByKind(kind) {
            for (const modifier of this.getModifiers()) {
                if (modifier.getKind() === kind)
                    return modifier;
            }
            return undefined;
        }
        hasModifier(textOrKind) {
            if (typeof textOrKind === "string")
                return this.getModifiers().some(m => m.getText() === textOrKind);
            else
                return this.getModifiers().some(m => m.getKind() === textOrKind);
        }
        toggleModifier(text, value) {
            const hasModifier = this.hasModifier(text);
            if (value == null)
                value = !hasModifier;
            if (hasModifier === value)
                return this;
            if (!hasModifier)
                this.addModifier(text);
            else
                manipulation_1.removeNodes([this.getModifiers().find(m => m.getText() === text)]);
            return this;
        }
        addModifier(text) {
            const modifiers = this.getModifiers();
            const hasModifier = modifiers.some(m => m.getText() === text);
            if (hasModifier)
                return this.getModifiers().find(m => m.getText() === text);
            // get insert position & index
            let insertPos = this.getStart();
            let insertIndex = 0;
            getAddAfterModifierTexts(text).forEach(addAfterText => {
                for (let i = 0; i < modifiers.length; i++) {
                    const modifier = modifiers[i];
                    if (modifier.getText() === addAfterText) {
                        if (insertPos < modifier.getEnd()) {
                            insertPos = modifier.getEnd();
                            insertIndex = i + 1;
                        }
                        break;
                    }
                }
            });
            // insert setup
            let startPos;
            let newText;
            const isFirstModifier = insertPos === this.getStart();
            if (isFirstModifier) {
                newText = text + " ";
                startPos = insertPos;
            }
            else {
                newText = " " + text;
                startPos = insertPos + 1;
            }
            // insert
            if (modifiers.length === 0)
                manipulation_1.insertCreatingSyntaxList({ parent: this, insertPos, newText });
            else
                manipulation_1.insertIntoSyntaxList({
                    insertPos,
                    newText,
                    syntaxList: modifiers[0].getParentSyntaxListOrThrow(),
                    childIndex: insertIndex,
                    insertItemsCount: 1
                });
            return this.getModifiers().find(m => m.getStart() === startPos);
        }
    };
}
exports.ModifierableNode = ModifierableNode;
/**
 * @returns The texts the specified text should appear after.
 */
function getAddAfterModifierTexts(text) {
    switch (text) {
        case "export":
            return [];
        case "default":
            return ["export"];
        case "declare":
            return ["export", "default"];
        case "abstract":
            return ["export", "default", "declare", "public", "private", "protected"];
        case "readonly":
            return ["export", "default", "declare", "public", "private", "protected", "abstract", "static"];
        case "public":
        case "protected":
        case "private":
            return [];
        case "static":
            return ["public", "protected", "private"];
        case "async":
            return ["export", "public", "protected", "private", "static", "abstract"];
        case "const":
            return [];
        /* istanbul ignore next */
        default:
            throw new errors.NotImplementedError(`Not implemented modifier: ${text}`);
    }
}



},{"./../../errors":137,"./../../manipulation":152}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
const callBaseFill_1 = require("./../callBaseFill");
const utils_1 = require("./../../utils");
function ParameteredNode(Base) {
    return class extends Base {
        getParameters() {
            return this.compilerNode.parameters.map(p => this.global.compilerFactory.getParameterDeclaration(p, this.sourceFile));
        }
        addParameter(structure) {
            return this.addParameters([structure])[0];
        }
        addParameters(structures) {
            return this.insertParameters(manipulation_1.getEndIndexFromArray(this.compilerNode.parameters), structures);
        }
        insertParameter(index, structure) {
            return this.insertParameters(index, [structure])[0];
        }
        insertParameters(index, structures) {
            if (utils_1.ArrayUtils.isNullOrEmpty(structures))
                return [];
            const parameters = this.getParameters();
            const parameterCodes = structures.map(s => getStructureCode(s));
            index = manipulation_1.verifyAndGetIndex(index, parameters.length);
            if (parameters.length === 0) {
                const syntaxList = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenParenToken).getNextSibling();
                if (syntaxList == null || syntaxList.getKind() !== ts.SyntaxKind.SyntaxList)
                    throw new errors.NotImplementedError("Expected to find a syntax list after the open parens");
                manipulation_1.insertIntoSyntaxList({
                    insertPos: syntaxList.getPos(),
                    newText: parameterCodes.join(", "),
                    syntaxList,
                    childIndex: 0,
                    insertItemsCount: structures.length * 2 - 1
                });
            }
            else {
                manipulation_1.insertIntoCommaSeparatedNodes({ currentNodes: parameters, insertIndex: index, newTexts: parameterCodes });
            }
            const newParameters = this.getParameters().slice(index, index + structures.length);
            newParameters.forEach((p, i) => p.fill(structures[i]));
            return newParameters;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.parameters != null && structure.parameters.length > 0)
                this.addParameters(structure.parameters);
            return this;
        }
    };
}
exports.ParameteredNode = ParameteredNode;
function getStructureCode(structure) {
    let code = "";
    if (structure.isRestParameter)
        code += "...";
    code += structure.name;
    if (structure.type != null && structure.type.length > 0)
        code += `: ${structure.type}`;
    return code;
}



},{"./../../errors":137,"./../../manipulation":152,"./../../utils":179,"./../callBaseFill":60,"typescript":"typescript"}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const callBaseFill_1 = require("./../callBaseFill");
function QuestionTokenableNode(Base) {
    return class extends Base {
        hasQuestionToken() {
            return this.compilerNode.questionToken != null;
        }
        getQuestionTokenNode() {
            if (this.compilerNode.questionToken == null)
                return undefined;
            return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.questionToken, this.sourceFile);
        }
        setIsOptional(value) {
            const questionTokenNode = this.getQuestionTokenNode();
            const hasQuestionToken = questionTokenNode != null;
            if (value === hasQuestionToken)
                return this;
            if (value) {
                const colonNode = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ColonToken);
                manipulation_1.insertStraight({
                    insertPos: colonNode.getStart(),
                    parent: this,
                    newCode: "?"
                });
            }
            else
                manipulation_1.removeNodes([questionTokenNode]);
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.hasQuestionToken != null)
                this.setIsOptional(structure.hasQuestionToken);
            return this;
        }
    };
}
exports.QuestionTokenableNode = QuestionTokenableNode;



},{"./../../manipulation":152,"./../callBaseFill":60,"typescript":"typescript"}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../callBaseFill");
function ReadonlyableNode(Base) {
    return class extends Base {
        isReadonly() {
            return this.getReadonlyKeyword() != null;
        }
        getReadonlyKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.ReadonlyKeyword);
        }
        setIsReadonly(value) {
            this.toggleModifier("readonly", value);
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.isReadonly != null)
                this.setIsReadonly(structure.isReadonly);
            return this;
        }
    };
}
exports.ReadonlyableNode = ReadonlyableNode;



},{"./../callBaseFill":60,"typescript":"typescript"}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../callBaseFill");
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
function ReturnTypedNode(Base) {
    return class extends Base {
        getReturnType() {
            const typeChecker = this.global.typeChecker;
            const signature = typeChecker.getSignatureFromNode(this); // should always return a signature
            return typeChecker.getReturnTypeOfSignature(signature);
        }
        getReturnTypeNode() {
            return this.compilerNode.type == null ? undefined : this.global.compilerFactory.getTypeNode(this.compilerNode.type, this.sourceFile);
        }
        setReturnType(text) {
            const returnTypeNode = this.getReturnTypeNode();
            if (returnTypeNode != null && returnTypeNode.getText() === text)
                return this;
            // get replace length of previous return type
            const colonToken = returnTypeNode == null ? undefined : returnTypeNode.getPreviousSibling();
            /* istanbul ignore if */
            if (colonToken != null && colonToken.getKind() !== ts.SyntaxKind.ColonToken)
                throw new errors.NotImplementedError("Expected a colon token to be the previous sibling of a return type.");
            const replaceLength = colonToken == null ? 0 : returnTypeNode.getEnd() - colonToken.getPos();
            // insert new type
            const closeParenToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.CloseParenToken);
            manipulation_1.replaceStraight(this.getSourceFile(), closeParenToken.getEnd(), replaceLength, `: ${text}`);
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.returnType != null)
                this.setReturnType(structure.returnType);
            return this;
        }
    };
}
exports.ReturnTypedNode = ReturnTypedNode;



},{"./../../errors":137,"./../../manipulation":152,"./../callBaseFill":60,"typescript":"typescript"}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../callBaseFill");
const Scope_1 = require("./../common/Scope");
function ScopeableNode(Base) {
    return class extends Base {
        getScope() {
            return getScopeForNode(this);
        }
        setScope(scope) {
            setScopeForNode(this, scope);
            return this;
        }
        hasScopeKeyword() {
            return this.getScope() != null;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.scope != null)
                this.setScope(structure.scope);
            return this;
        }
    };
}
exports.ScopeableNode = ScopeableNode;
/**
 * Gets the scope for a node.
 * @internal
 * @param node - Node to check for.
 */
function getScopeForNode(node) {
    const modifierFlags = node.getCombinedModifierFlags();
    if ((modifierFlags & ts.ModifierFlags.Private) !== 0)
        return Scope_1.Scope.Private;
    else if ((modifierFlags & ts.ModifierFlags.Protected) !== 0)
        return Scope_1.Scope.Protected;
    else if ((modifierFlags & ts.ModifierFlags.Public) !== 0)
        return Scope_1.Scope.Public;
    else
        return undefined;
}
exports.getScopeForNode = getScopeForNode;
/**
 * Sets the scope for a node.
 * @internal
 * @param node - Node to set the scope for.
 * @param scope - Scope to be set to.
 */
function setScopeForNode(node, scope) {
    node.toggleModifier("public", scope === Scope_1.Scope.Public); // always be explicit with scope
    node.toggleModifier("protected", scope === Scope_1.Scope.Protected);
    node.toggleModifier("private", scope === Scope_1.Scope.Private);
}
exports.setScopeForNode = setScopeForNode;



},{"./../callBaseFill":60,"./../common/Scope":75,"typescript":"typescript"}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callBaseFill_1 = require("./../callBaseFill");
const Scope_1 = require("./../common/Scope");
const scopeableNode = require("./ScopeableNode");
function ScopedNode(Base) {
    return class extends Base {
        getScope() {
            return scopeableNode.getScopeForNode(this) || Scope_1.Scope.Public;
        }
        setScope(scope) {
            scopeableNode.setScopeForNode(this, scope === Scope_1.Scope.Public ? undefined : scope);
            return this;
        }
        hasScopeKeyword() {
            return scopeableNode.getScopeForNode(this) != null;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.scope != null)
                this.setScope(structure.scope);
            return this;
        }
    };
}
exports.ScopedNode = ScopedNode;



},{"./../callBaseFill":60,"./../common/Scope":75,"./ScopeableNode":48}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../callBaseFill");
function StaticableNode(Base) {
    return class extends Base {
        isStatic() {
            return this.hasModifier(ts.SyntaxKind.StaticKeyword);
        }
        getStaticKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.StaticKeyword);
        }
        setIsStatic(value) {
            this.toggleModifier("static", value);
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.isStatic != null)
                this.setIsStatic(structure.isStatic);
            return this;
        }
    };
}
exports.StaticableNode = StaticableNode;



},{"./../callBaseFill":60,"typescript":"typescript"}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
const utils_1 = require("./../../utils");
const callBaseFill_1 = require("./../callBaseFill");
function TypeParameteredNode(Base) {
    return class extends Base {
        getTypeParameters() {
            const typeParameters = (this.compilerNode.typeParameters || []); // why do I need this assert?
            return typeParameters.map(t => this.global.compilerFactory.getTypeParameterDeclaration(t, this.sourceFile));
        }
        addTypeParameter(structure) {
            return this.addTypeParameters([structure])[0];
        }
        addTypeParameters(structures) {
            return this.insertTypeParameters(manipulation_1.getEndIndexFromArray(this.compilerNode.typeParameters), structures);
        }
        insertTypeParameter(index, structure) {
            return this.insertTypeParameters(index, [structure])[0];
        }
        insertTypeParameters(index, structures) {
            if (utils_1.ArrayUtils.isNullOrEmpty(structures))
                return [];
            const typeParameters = this.getTypeParameters();
            const typeParamCodes = structures.map(s => getStructureCode(s));
            index = manipulation_1.verifyAndGetIndex(index, typeParameters.length);
            if (typeParameters.length === 0) {
                const insertPos = getNamedNode(this).getNameIdentifier().getEnd();
                manipulation_1.insertStraight({
                    insertPos,
                    parent: this,
                    newCode: `<${typeParamCodes.join(", ")}>`
                });
            }
            else {
                manipulation_1.insertIntoCommaSeparatedNodes({ currentNodes: typeParameters, insertIndex: index, newTexts: typeParamCodes });
            }
            return this.getTypeParameters().slice(index, index + structures.length);
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.typeParameters != null && structure.typeParameters.length > 0)
                this.addTypeParameters(structure.typeParameters);
            return this;
        }
    };
}
exports.TypeParameteredNode = TypeParameteredNode;
function getStructureCode(structure) {
    let code = structure.name;
    if (structure.constraint != null && structure.constraint.length > 0)
        code += ` extends ${structure.constraint}`;
    return code;
}
function getNamedNode(node) {
    const namedNode = node;
    /* istanbul ignore if */
    if (namedNode.getNameIdentifier == null)
        throw new errors.NotImplementedError("Not implemented scenario. Type parameters can only be added to a node with a name.");
    return namedNode;
}



},{"./../../errors":137,"./../../manipulation":152,"./../../utils":179,"./../callBaseFill":60}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../callBaseFill");
const manipulation_1 = require("./../../manipulation");
function TypedNode(Base) {
    return class extends Base {
        getType() {
            return this.global.typeChecker.getTypeAtLocation(this);
        }
        getTypeNode() {
            return this.compilerNode.type == null ? undefined : this.global.compilerFactory.getTypeNode(this.compilerNode.type, this.sourceFile);
        }
        setType(text) {
            const typeNode = this.getTypeNode();
            if (typeNode != null && typeNode.getText() === text)
                return this;
            // remove previous type
            const separatorSyntaxKind = getSeparatorSyntaxKindForNode(this);
            const separatorNode = this.getFirstChildByKind(separatorSyntaxKind);
            const replaceLength = typeNode == null ? 0 : typeNode.getWidth();
            let insertPosition;
            let insertText = "";
            if (separatorNode == null)
                insertText += separatorSyntaxKind === ts.SyntaxKind.EqualsToken ? " = " : ": ";
            if (typeNode == null) {
                const identifier = this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier);
                insertPosition = identifier.getEnd();
            }
            else {
                insertPosition = typeNode.getStart();
            }
            insertText += text;
            // insert new type
            manipulation_1.replaceStraight(this.getSourceFile(), insertPosition, replaceLength, insertText);
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.type != null)
                this.setType(structure.type);
            return this;
        }
    };
}
exports.TypedNode = TypedNode;
function getSeparatorSyntaxKindForNode(node) {
    switch (node.getKind()) {
        case ts.SyntaxKind.TypeAliasDeclaration:
            return ts.SyntaxKind.EqualsToken;
        default:
            return ts.SyntaxKind.ColonToken;
    }
}



},{"./../../manipulation":152,"./../callBaseFill":60,"typescript":"typescript"}],53:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./initializer/InitializerExpressionableNode"));



},{"./initializer/InitializerExpressionableNode":54}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../../errors");
const callBaseFill_1 = require("./../../callBaseFill");
const manipulation_1 = require("./../../../manipulation");
function InitializerExpressionableNode(Base) {
    return class extends Base {
        isInitializerExpressionableNode() {
            return true;
        }
        hasInitializer() {
            return this.compilerNode.initializer != null;
        }
        getInitializer() {
            return this.compilerNode.initializer == null ? undefined : this.global.compilerFactory.getExpression(this.compilerNode.initializer, this.sourceFile);
        }
        removeInitializer() {
            const initializer = this.getInitializer();
            if (initializer == null)
                return this;
            const previousSibling = initializer.getPreviousSibling();
            /* istanbul ignore if */
            if (previousSibling == null || previousSibling.getKind() !== ts.SyntaxKind.FirstAssignment)
                throw errors.getNotImplementedForSyntaxKindError(this.getKind());
            manipulation_1.removeNodes([previousSibling, initializer]);
            return this;
        }
        setInitializer(text) {
            errors.throwIfNotStringOrWhitespace(text, "text");
            if (this.hasInitializer())
                this.removeInitializer();
            const semiColonToken = this.getLastChildIfKind(ts.SyntaxKind.SemicolonToken);
            manipulation_1.insertStraight({
                insertPos: semiColonToken != null ? semiColonToken.getPos() : this.getEnd(),
                parent: this,
                newCode: ` = ${text}`
            });
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.initializer != null)
                this.setInitializer(structure.initializer);
            return this;
        }
    };
}
exports.InitializerExpressionableNode = InitializerExpressionableNode;



},{"./../../../errors":137,"./../../../manipulation":152,"./../../callBaseFill":60,"typescript":"typescript"}],55:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./name/NamedNode"));
__export(require("./name/PropertyNamedNode"));
__export(require("./name/BindingNamedNode"));
__export(require("./name/DeclarationNamedNode"));



},{"./name/BindingNamedNode":56,"./name/DeclarationNamedNode":57,"./name/NamedNode":58,"./name/PropertyNamedNode":59}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../../errors");
function BindingNamedNode(Base) {
    return class extends Base {
        getNameIdentifier() {
            const compilerNameNode = this.compilerNode.name;
            switch (compilerNameNode.kind) {
                case ts.SyntaxKind.Identifier:
                    return this.global.compilerFactory.getIdentifier(compilerNameNode, this.sourceFile);
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForSyntaxKindError(compilerNameNode.kind);
            }
        }
        getName() {
            return this.getNameIdentifier().getText();
        }
        rename(text) {
            errors.throwIfNotStringOrWhitespace(text, "text");
            this.getNameIdentifier().rename(text);
            return this;
        }
    };
}
exports.BindingNamedNode = BindingNamedNode;



},{"./../../../errors":137,"typescript":"typescript"}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../../errors");
function DeclarationNamedNode(Base) {
    return class extends Base {
        getNameIdentifierOrThrow() {
            const nameNode = this.getNameIdentifier();
            if (nameNode == null)
                throw new errors.InvalidOperationError("Expected a name node.");
            return nameNode;
        }
        getNameIdentifier() {
            const compilerNameNode = this.compilerNode.name;
            if (compilerNameNode == null)
                return undefined;
            switch (compilerNameNode.kind) {
                case ts.SyntaxKind.Identifier:
                    return this.global.compilerFactory.getIdentifier(compilerNameNode, this.sourceFile);
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForSyntaxKindError(compilerNameNode.kind);
            }
        }
        getName() {
            const nameNode = this.getNameIdentifier();
            return nameNode == null ? undefined : nameNode.getText();
        }
        rename(text) {
            errors.throwIfNotStringOrWhitespace(text, "text");
            const nameNode = this.getNameIdentifier();
            if (nameNode == null)
                throw errors.getNotImplementedForSyntaxKindError(this.getKind());
            nameNode.rename(text);
            return this;
        }
    };
}
exports.DeclarationNamedNode = DeclarationNamedNode;



},{"./../../../errors":137,"typescript":"typescript"}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../../../errors");
function NamedNode(Base) {
    return class extends Base {
        getNameIdentifier() {
            return this.global.compilerFactory.getIdentifier(this.compilerNode.name, this.sourceFile);
        }
        getName() {
            return this.getNameIdentifier().getText();
        }
        rename(newName) {
            if (newName === this.getName())
                return this;
            errors.throwIfNotStringOrWhitespace(newName, "newName");
            this.getNameIdentifier().rename(newName);
            return this;
        }
    };
}
exports.NamedNode = NamedNode;



},{"./../../../errors":137}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../../errors");
function PropertyNamedNode(Base) {
    return class extends Base {
        getNameIdentifier() {
            const compilerNameNode = this.compilerNode.name;
            switch (compilerNameNode.kind) {
                case ts.SyntaxKind.Identifier:
                    return this.global.compilerFactory.getIdentifier(compilerNameNode, this.sourceFile);
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForSyntaxKindError(compilerNameNode.kind);
            }
        }
        getName() {
            return this.getNameIdentifier().getText();
        }
        rename(text) {
            errors.throwIfNotStringOrWhitespace(text, "text");
            this.getNameIdentifier().rename(text);
            return this;
        }
    };
}
exports.PropertyNamedNode = PropertyNamedNode;



},{"./../../../errors":137,"typescript":"typescript"}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// todo: add code verification to ensure all fill functions call this
function callBaseFill(basePrototype, node, structure) {
    if (basePrototype.fill != null)
        basePrototype.fill.call(node, structure);
}
exports.callBaseFill = callBaseFill;



},{}],61:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./class/base"));
__export(require("./class/ClassDeclaration"));
__export(require("./class/ConstructorDeclaration"));
__export(require("./class/MethodDeclaration"));
__export(require("./class/PropertyDeclaration"));
__export(require("./class/GetAccessorDeclaration"));
__export(require("./class/SetAccessorDeclaration"));



},{"./class/ClassDeclaration":62,"./class/ConstructorDeclaration":63,"./class/GetAccessorDeclaration":64,"./class/MethodDeclaration":65,"./class/PropertyDeclaration":66,"./class/SetAccessorDeclaration":67,"./class/base":68}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
const utils_1 = require("./../../utils");
const common_1 = require("./../common");
const base_1 = require("./../base");
const base_2 = require("./base");
const function_1 = require("./../function");
const namespace_1 = require("./../namespace");
const callBaseFill_1 = require("./../callBaseFill");
const ConstructorDeclaration_1 = require("./ConstructorDeclaration");
const MethodDeclaration_1 = require("./MethodDeclaration");
const PropertyDeclaration_1 = require("./PropertyDeclaration");
const GetAccessorDeclaration_1 = require("./GetAccessorDeclaration");
const SetAccessorDeclaration_1 = require("./SetAccessorDeclaration");
exports.ClassDeclarationBase = base_1.ImplementsClauseableNode(base_1.HeritageClauseableNode(base_1.DecoratableNode(base_1.TypeParameteredNode(namespace_1.NamespaceChildableNode(base_1.DocumentationableNode(base_1.AmbientableNode(base_2.AbstractableNode(base_1.ExportableNode(base_1.ModifierableNode(base_1.NamedNode(common_1.Node)))))))))));
class ClassDeclaration extends exports.ClassDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.ClassDeclarationBase.prototype, this, structure);
        if (structure.extends != null)
            this.setExtends(structure.extends);
        if (structure.ctor != null)
            this.addConstructor(structure.ctor);
        if (structure.properties != null)
            this.addProperties(structure.properties);
        if (structure.methods != null)
            this.addMethods(structure.methods);
        return this;
    }
    /**
     * Sets the extends expression.
     * @param text - Text to set as the extends expression.
     */
    setExtends(text) {
        errors.throwIfNotStringOrWhitespace(text, "text");
        const heritageClauses = this.getHeritageClauses();
        const extendsClause = heritageClauses.find(c => c.compilerNode.token === ts.SyntaxKind.ExtendsKeyword);
        if (extendsClause != null) {
            const extendsClauseStart = extendsClause.getStart();
            manipulation_1.replaceStraight(this.getSourceFile(), extendsClauseStart, extendsClause.getEnd() - extendsClauseStart, `extends ${text}`);
            return this;
        }
        const implementsClause = heritageClauses.find(c => c.compilerNode.token === ts.SyntaxKind.ImplementsKeyword);
        let insertPos;
        if (implementsClause != null)
            insertPos = implementsClause.getStart();
        else
            insertPos = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken).getStart();
        const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[insertPos - 1]);
        let newText = `extends ${text} `;
        if (!isLastSpace)
            newText = " " + newText;
        if (implementsClause == null)
            manipulation_1.insertCreatingSyntaxList({
                parent: this,
                insertPos,
                newText
            });
        else
            manipulation_1.insertIntoSyntaxList({
                insertPos,
                newText,
                syntaxList: implementsClause.getParentSyntaxListOrThrow(),
                childIndex: 0,
                insertItemsCount: 1
            });
        return this;
    }
    /**
     * Gets the extends expression.
     */
    getExtends() {
        const heritageClauses = this.getHeritageClauses();
        const extendsClause = heritageClauses.find(c => c.compilerNode.token === ts.SyntaxKind.ExtendsKeyword);
        if (extendsClause == null)
            return undefined;
        const types = extendsClause.getTypes();
        return types.length === 0 ? undefined : types[0];
    }
    /**
     * Adds a constructor. Will remove the previous constructor if it exists.
     * @param structure - Structure of the constructor.
     */
    addConstructor(structure = {}) {
        return this.insertConstructor(manipulation_1.getEndIndexFromArray(this.compilerNode.members), structure);
    }
    /**
     * Inserts a constructor. Will remove the previous constructor if it exists.
     * @param index - Index to insert at.
     * @param structure - Structure of the constructor.
     */
    insertConstructor(index, structure = {}) {
        for (const c of this.getConstructors()) {
            c.remove();
        }
        const indentationText = this.getChildIndentationText();
        const newLineChar = this.global.manipulationSettings.getNewLineKind();
        const code = `${indentationText}constructor() {${newLineChar}${indentationText}}`;
        return manipulation_1.insertIntoBracesOrSourceFileWithFillAndGetChildren({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: [code],
            structures: [structure],
            previousBlanklineWhen: () => true,
            nextBlanklineWhen: () => true,
            expectedKind: ts.SyntaxKind.Constructor,
            fillFunction: (node, struct) => node.fill(struct)
        })[0];
    }
    /**
     * Gets the constructor declarations.
     */
    getConstructors() {
        return this.getAllMembers().filter(m => m.isConstructorDeclaration());
    }
    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure) {
        return this.addProperties([structure])[0];
    }
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures) {
        return this.insertProperties(manipulation_1.getEndIndexFromArray(this.compilerNode.members), structures);
    }
    /**
     * Insert property.
     * @param index - Index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index, structure) {
        return this.insertProperties(index, [structure])[0];
    }
    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index, structures) {
        const indentationText = this.getChildIndentationText();
        // create code
        const codes = [];
        for (const structure of structures) {
            let code = `${indentationText}`;
            if (structure.isStatic)
                code += "static ";
            code += structure.name;
            if (structure.hasQuestionToken)
                code += "?";
            if (structure.type != null && structure.type.length > 0)
                code += `: ${structure.type}`;
            code += ";";
            codes.push(code);
        }
        return manipulation_1.insertIntoBracesOrSourceFileWithFillAndGetChildren({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            previousBlanklineWhen: n => n.isBodyableNode() || n.isBodiedNode(),
            nextBlanklineWhen: n => n.isBodyableNode() || n.isBodiedNode(),
            expectedKind: ts.SyntaxKind.PropertyDeclaration,
            fillFunction: (node, structure) => node.fill(structure)
        });
    }
    getInstanceProperty(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getInstanceProperties(), nameOrFindFunction);
    }
    /**
     * Gets the class instance property declarations.
     */
    getInstanceProperties() {
        return this.getInstanceMembers()
            .filter(m => isClassPropertyType(m));
    }
    getStaticProperty(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getStaticProperties(), nameOrFindFunction);
    }
    /**
     * Gets the class instance property declarations.
     */
    getStaticProperties() {
        return this.getStaticMembers()
            .filter(m => isClassPropertyType(m));
    }
    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure) {
        return this.addMethods([structure])[0];
    }
    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures) {
        return this.insertMethods(manipulation_1.getEndIndexFromArray(this.compilerNode.members), structures);
    }
    /**
     * Insert method.
     * @param index - Index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index, structure) {
        return this.insertMethods(index, [structure])[0];
    }
    /**
     * Insert methods.
     * @param index - Index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index, structures) {
        const indentationText = this.getChildIndentationText();
        const newLineChar = this.global.manipulationSettings.getNewLineKind();
        // create code
        const codes = [];
        for (const structure of structures) {
            let code = indentationText;
            if (structure.isStatic)
                code += "static ";
            code += `${structure.name}()`;
            if (structure.returnType != null && structure.returnType.length > 0)
                code += `: ${structure.returnType}`;
            code += ` {` + newLineChar;
            code += indentationText + `}`;
            codes.push(code);
        }
        // insert, fill, and get created nodes
        return manipulation_1.insertIntoBracesOrSourceFileWithFillAndGetChildren({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            previousBlanklineWhen: () => true,
            nextBlanklineWhen: () => true,
            separatorNewlineWhen: () => true,
            expectedKind: ts.SyntaxKind.MethodDeclaration,
            fillFunction: (node, structure) => node.fill(structure)
        });
    }
    getInstanceMethod(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getInstanceMethods(), nameOrFindFunction);
    }
    /**
     * Gets the class instance method declarations.
     */
    getInstanceMethods() {
        return this.getInstanceMembers().filter(m => m instanceof MethodDeclaration_1.MethodDeclaration);
    }
    getStaticMethod(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getStaticMethods(), nameOrFindFunction);
    }
    /**
     * Gets the class instance method declarations.
     */
    getStaticMethods() {
        return this.getStaticMembers().filter(m => m instanceof MethodDeclaration_1.MethodDeclaration);
    }
    getInstanceMember(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getInstanceMembers(), nameOrFindFunction);
    }
    /**
     * Gets the instance members.
     */
    getInstanceMembers() {
        return this.getAllMembers().filter(m => !m.isConstructorDeclaration() && (m instanceof function_1.ParameterDeclaration || !m.isStatic()));
    }
    getStaticMember(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getStaticMembers(), nameOrFindFunction);
    }
    /**
     * Gets the static members.
     */
    getStaticMembers() {
        return this.getAllMembers().filter(m => !m.isConstructorDeclaration() && !(m instanceof function_1.ParameterDeclaration) && m.isStatic());
    }
    /**
     * Gets the constructors, methods, properties, and class parameter properties.
     */
    getAllMembers() {
        const members = this.compilerNode.members.map(m => this.global.compilerFactory.getNodeFromCompilerNode(m, this.sourceFile));
        const implementationCtors = members.filter(c => c.isConstructorDeclaration() && c.isImplementation());
        for (const ctor of implementationCtors) {
            // insert after the constructor
            let insertIndex = members.indexOf(ctor) + 1;
            for (const param of ctor.getParameters()) {
                if (param.isParameterProperty()) {
                    members.splice(insertIndex, 0, param);
                    insertIndex++;
                }
            }
        }
        // filter out the method declarations or constructor declarations without a body if not ambient
        return this.isAmbient() ? members : members.filter(m => !(m instanceof ConstructorDeclaration_1.ConstructorDeclaration || m instanceof MethodDeclaration_1.MethodDeclaration) || m.isImplementation());
    }
}
exports.ClassDeclaration = ClassDeclaration;
function isClassPropertyType(m) {
    return m instanceof PropertyDeclaration_1.PropertyDeclaration || m instanceof SetAccessorDeclaration_1.SetAccessorDeclaration || m instanceof GetAccessorDeclaration_1.GetAccessorDeclaration || m instanceof function_1.ParameterDeclaration;
}



},{"./../../errors":137,"./../../manipulation":152,"./../../utils":179,"./../base":31,"./../callBaseFill":60,"./../common":70,"./../function":91,"./../namespace":104,"./ConstructorDeclaration":63,"./GetAccessorDeclaration":64,"./MethodDeclaration":65,"./PropertyDeclaration":66,"./SetAccessorDeclaration":67,"./base":68,"typescript":"typescript"}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const getStructureFuncs = require("./../../manipulation/getStructureFunctions");
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
const function_1 = require("./../function");
exports.ConstructorDeclarationBase = function_1.OverloadableNode(base_1.ScopedNode(function_1.FunctionLikeDeclaration(base_1.BodyableNode(common_1.Node))));
class ConstructorDeclaration extends exports.ConstructorDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.ConstructorDeclarationBase.prototype, this, structure);
        if (structure.overloads != null && structure.overloads.length > 0)
            this.addOverloads(structure.overloads);
        return this;
    }
    /**
     * Add a constructor overload.
     * @param structure - Structure to add.
     */
    addOverload(structure) {
        return this.addOverloads([structure])[0];
    }
    /**
     * Add constructor overloads.
     * @param structures - Structures to add.
     */
    addOverloads(structures) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }
    /**
     * Inserts a constructor overload.
     * @param index - Index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index, structure) {
        return this.insertOverloads(index, [structure])[0];
    }
    /**
     * Inserts constructor overloads.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index, structures) {
        const indentationText = this.getIndentationText();
        const childCodes = structures.map(structure => `${indentationText}constructor();`);
        return function_1.insertOverloads({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromConstructorDeclarationOverload,
            fillNodeFromStructure: (node, structure) => node.fill(structure),
            expectedSyntaxKind: ts.SyntaxKind.Constructor
        });
    }
    /**
     * Remove the constructor.
     */
    remove() {
        const nodesToRemove = [this];
        if (this.isImplementation())
            nodesToRemove.push(...this.getOverloads());
        for (const nodeToRemove of nodesToRemove) {
            manipulation_1.removeFromBracesOrSourceFile({
                node: nodeToRemove
            });
        }
    }
}
exports.ConstructorDeclaration = ConstructorDeclaration;



},{"./../../manipulation":152,"./../../manipulation/getStructureFunctions":160,"./../base":31,"./../callBaseFill":60,"./../common":70,"./../function":91,"typescript":"typescript"}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const common_1 = require("./../common");
const base_1 = require("./../base");
const function_1 = require("./../function");
const base_2 = require("./base");
exports.GetAccessorDeclarationBase = base_1.DecoratableNode(base_2.AbstractableNode(base_1.ScopedNode(base_1.StaticableNode(function_1.FunctionLikeDeclaration(base_1.BodiedNode(base_1.PropertyNamedNode(common_1.Node)))))));
class GetAccessorDeclaration extends exports.GetAccessorDeclarationBase {
    /**
     * Gets the corresponding set accessor if one exists.
     */
    getSetAccessor() {
        const parent = this.getParentOrThrow();
        errors.throwIfNotSyntaxKind(parent, ts.SyntaxKind.ClassDeclaration, "Expected the parent to be a class declaration");
        const thisName = this.getName();
        for (const prop of parent.getInstanceProperties()) {
            if (prop.getName() === thisName && prop.getKind() === ts.SyntaxKind.SetAccessor)
                return prop;
        }
        return undefined;
    }
}
exports.GetAccessorDeclaration = GetAccessorDeclaration;



},{"./../../errors":137,"./../base":31,"./../common":70,"./../function":91,"./base":68,"typescript":"typescript"}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const getStructureFuncs = require("./../../manipulation/getStructureFunctions");
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
const function_1 = require("./../function");
const base_2 = require("./base");
exports.MethodDeclarationBase = function_1.OverloadableNode(base_1.DecoratableNode(base_2.AbstractableNode(base_1.ScopedNode(base_1.StaticableNode(base_1.AsyncableNode(base_1.GeneratorableNode(function_1.FunctionLikeDeclaration(base_1.BodyableNode(base_1.PropertyNamedNode(common_1.Node))))))))));
class MethodDeclaration extends exports.MethodDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.MethodDeclarationBase.prototype, this, structure);
        if (structure.overloads != null && structure.overloads.length > 0)
            this.addOverloads(structure.overloads);
        return this;
    }
    /**
     * Add a method overload.
     * @param structure - Structure to add.
     */
    addOverload(structure) {
        return this.addOverloads([structure])[0];
    }
    /**
     * Add method overloads.
     * @param structures - Structures to add.
     */
    addOverloads(structures) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }
    /**
     * Inserts a method overload.
     * @param index - Index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index, structure) {
        return this.insertOverloads(index, [structure])[0];
    }
    /**
     * Inserts method overloads.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index, structures) {
        const thisName = this.getName();
        const indentationText = this.getIndentationText();
        const childCodes = structures.map(structure => `${indentationText}${thisName}();`);
        return function_1.insertOverloads({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromMethodDeclarationOverload,
            fillNodeFromStructure: (node, structure) => node.fill(structure),
            expectedSyntaxKind: ts.SyntaxKind.MethodDeclaration
        });
    }
}
exports.MethodDeclaration = MethodDeclaration;



},{"./../../manipulation/getStructureFunctions":160,"./../base":31,"./../callBaseFill":60,"./../common":70,"./../function":91,"./base":68,"typescript":"typescript"}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
const base_2 = require("./base");
exports.PropertyDeclarationBase = base_1.DecoratableNode(base_2.AbstractableNode(base_1.ScopedNode(base_1.StaticableNode(base_1.DocumentationableNode(base_1.ReadonlyableNode(base_1.QuestionTokenableNode(base_1.InitializerExpressionableNode(base_1.TypedNode(base_1.PropertyNamedNode(base_1.ModifierableNode(common_1.Node)))))))))));
class PropertyDeclaration extends exports.PropertyDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.PropertyDeclarationBase.prototype, this, structure);
        return this;
    }
}
exports.PropertyDeclaration = PropertyDeclaration;



},{"./../base":31,"./../callBaseFill":60,"./../common":70,"./base":68}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const common_1 = require("./../common");
const base_1 = require("./../base");
const function_1 = require("./../function");
const base_2 = require("./base");
exports.SetAccessorDeclarationBase = base_1.DecoratableNode(base_2.AbstractableNode(base_1.ScopedNode(base_1.StaticableNode(function_1.FunctionLikeDeclaration(base_1.BodiedNode(base_1.PropertyNamedNode(common_1.Node)))))));
class SetAccessorDeclaration extends exports.SetAccessorDeclarationBase {
    /**
     * Gets the corresponding get accessor if one exists.
     */
    getGetAccessor() {
        const parent = this.getParentOrThrow();
        errors.throwIfNotSyntaxKind(parent, ts.SyntaxKind.ClassDeclaration, "Expected the parent to be a class declaration");
        const thisName = this.getName();
        for (const prop of parent.getInstanceProperties()) {
            if (prop.getName() === thisName && prop.getKind() === ts.SyntaxKind.GetAccessor)
                return prop;
        }
        return undefined;
    }
}
exports.SetAccessorDeclaration = SetAccessorDeclaration;



},{"./../../errors":137,"./../base":31,"./../common":70,"./../function":91,"./base":68,"typescript":"typescript"}],68:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./base/AbstractableNode"));



},{"./base/AbstractableNode":69}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const callBaseFill_1 = require("./../../callBaseFill");
function AbstractableNode(Base) {
    return class extends Base {
        getIsAbstract() {
            return this.getAbstractKeyword() != null;
        }
        getAbstractKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.AbstractKeyword);
        }
        setIsAbstract(isAbstract) {
            this.toggleModifier("abstract", isAbstract);
            return this;
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.isAbstract != null)
                this.setIsAbstract(structure.isAbstract);
            return this;
        }
    };
}
exports.AbstractableNode = AbstractableNode;



},{"./../../callBaseFill":60,"typescript":"typescript"}],70:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./common/Declaration"));
__export(require("./common/Expression"));
__export(require("./common/Identifier"));
__export(require("./common/Node"));
__export(require("./common/Scope"));
__export(require("./common/Signature"));
__export(require("./common/Symbol"));



},{"./common/Declaration":71,"./common/Expression":72,"./common/Identifier":73,"./common/Node":74,"./common/Scope":75,"./common/Signature":76,"./common/Symbol":77}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
const base_1 = require("./../base");
exports.DeclarationBase = base_1.DeclarationNamedNode(Node_1.Node);
class Declaration extends exports.DeclarationBase {
}
exports.Declaration = Declaration;



},{"./../base":31,"./Node":74}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
class Expression extends Node_1.Node {
    /**
     * Gets the contextual type of the expression.
     */
    getContextualType() {
        return this.global.typeChecker.getContextualType(this);
    }
}
exports.Expression = Expression;



},{"./Node":74}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
class Identifier extends Node_1.Node {
    /**
     * Gets the text for the identifier.
     */
    getText() {
        return this.compilerNode.text;
    }
    /**
     * Renames the identifier.
     * @param newName - New name of the identifier.
     */
    rename(newName) {
        this.global.languageService.renameNode(this, newName);
    }
    /**
     * Finds all the references of this identifier.
     */
    findReferences() {
        return this.global.languageService.findReferences(this.sourceFile, this);
    }
}
exports.Identifier = Identifier;



},{"./Node":74}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
class Node {
    /**
     * Initializes a new instance.
     * @internal
     * @param global - Global container.
     * @param node - Underlying node.
     * @param sourceFile - Source file for the node.
     */
    constructor(global, node, sourceFile) {
        this.global = global;
        this._compilerNode = node;
        this.sourceFile = sourceFile;
    }
    /**
     * Gets the underlying compiler node.
     */
    get compilerNode() {
        if (this._compilerNode == null)
            throw new errors.InvalidOperationError("Attempted to get information from a node that was removed from the AST.");
        return this._compilerNode;
    }
    /**
     * Releases the node from the cache and ast.
     * @internal
     */
    dispose() {
        for (const child of this.getChildren()) {
            child.dispose();
        }
        this.global.compilerFactory.removeNodeFromCache(this);
        this._compilerNode = undefined;
    }
    /**
     * Sets the source file.
     * @internal
     * @param sourceFile - Source file to set.
     */
    setSourceFile(sourceFile) {
        this.sourceFile = sourceFile;
        for (const child of this.getChildren())
            child.setSourceFile(sourceFile);
    }
    /**
     * Gets the syntax kind.
     */
    getKind() {
        return this.compilerNode.kind;
    }
    /**
     * Gets the syntax kind name.
     */
    getKindName() {
        return ts.SyntaxKind[this.compilerNode.kind];
    }
    /**
     * Gets the compiler symbol.
     */
    getSymbol() {
        const boundSymbol = this.compilerNode.symbol;
        if (boundSymbol != null)
            return this.global.compilerFactory.getSymbol(boundSymbol);
        const typeChecker = this.global.typeChecker;
        const typeCheckerSymbol = typeChecker.getSymbolAtLocation(this);
        if (typeCheckerSymbol != null)
            return typeCheckerSymbol;
        const nameNode = this.compilerNode.name;
        if (nameNode != null)
            return this.global.compilerFactory.getNodeFromCompilerNode(nameNode, this.sourceFile).getSymbol();
        return undefined;
    }
    /**
     * If the node contains the provided range (inclusive).
     * @param pos - Start position.
     * @param end - End position.
     */
    containsRange(pos, end) {
        return this.getPos() <= pos && end <= this.getEnd();
    }
    /**
     * Gets the first child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildByKindOrThrow(kind) {
        const firstChild = this.getFirstChildByKind(kind);
        if (firstChild == null)
            throw new errors.InvalidOperationError(`A child of the kind ${ts.SyntaxKind[kind]} was expected.`);
        return firstChild;
    }
    /**
     * Gets the first child by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildByKind(kind) {
        return this.getFirstChild(child => child.getKind() === kind);
    }
    /**
     * Gets the first child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKind(kind) {
        const firstChild = this.getFirstChild();
        return firstChild != null && firstChild.getKind() === kind ? firstChild : undefined;
    }
    /**
     * Gets the first child by a condition.
     * @param condition - Condition.
     */
    getFirstChild(condition) {
        for (const child of this.getChildren()) {
            if (condition == null || condition(child))
                return child;
        }
        return undefined;
    }
    /**
     * Gets the last child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildByKindOrThrow(kind) {
        const lastChild = this.getLastChildByKind(kind);
        if (lastChild == null)
            throw new errors.InvalidOperationError(`A child of the kind ${ts.SyntaxKind[kind]} was expected.`);
        return lastChild;
    }
    /**
     * Gets the last child by syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildByKind(kind) {
        return this.getLastChild(child => child.getKind() === kind);
    }
    /**
     * Gets the last child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildIfKind(kind) {
        const lastChild = this.getLastChild();
        return lastChild != null && lastChild.getKind() === kind ? lastChild : undefined;
    }
    /**
     * Gets the last child by a condition.
     * @param condition - Condition.
     */
    getLastChild(condition) {
        for (const child of this.getChildren().reverse()) {
            if (condition == null || condition(child))
                return child;
        }
        return undefined;
    }
    /**
     * Offset this node's positions (pos and end) and all of its children by the given offset.
     * @internal
     * @param offset - Offset.
     */
    offsetPositions(offset) {
        this.compilerNode.pos += offset;
        this.compilerNode.end += offset;
        for (const child of this.getChildren()) {
            child.offsetPositions(offset);
        }
    }
    /**
     * Gets the previous sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKind(kind) {
        const previousSibling = this.getPreviousSibling();
        return previousSibling != null && previousSibling.getKind() === kind ? previousSibling : undefined;
    }
    /**
     * Gets the next sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKind(kind) {
        const nextSibling = this.getNextSibling();
        return nextSibling != null && nextSibling.getKind() === kind ? nextSibling : undefined;
    }
    getPreviousSibling() {
        let previousSibling;
        for (const sibling of this.getSiblingsBefore()) {
            previousSibling = sibling;
        }
        return previousSibling;
    }
    getNextSibling() {
        const nextResult = this.getSiblingsAfter().next();
        return nextResult.done ? undefined : nextResult.value;
    }
    *getSiblingsBefore() {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        for (const child of parent.getChildrenIterator()) {
            if (child === this)
                return;
            yield child;
        }
    }
    *getSiblingsAfter() {
        // todo: optimize
        let foundChild = false;
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        for (const child of parent.getChildrenIterator()) {
            if (!foundChild) {
                foundChild = child === this;
                continue;
            }
            yield child;
        }
    }
    getChildren() {
        return this.compilerNode.getChildren().map(n => this.global.compilerFactory.getNodeFromCompilerNode(n, this.sourceFile));
    }
    /**
     * @internal
     */
    *getChildrenIterator() {
        for (const compilerChild of this.compilerNode.getChildren(this.sourceFile.compilerNode)) {
            yield this.global.compilerFactory.getNodeFromCompilerNode(compilerChild, this.sourceFile);
        }
    }
    /**
     * Gets the child syntax list or throws if it doesn't exist.
     */
    getChildSyntaxListOrThrow() {
        const syntaxList = this.getChildSyntaxList();
        if (syntaxList == null)
            throw new errors.InvalidOperationError("A child syntax list was expected.");
        return syntaxList;
    }
    /**
     * Gets the child syntax list if it exists.
     */
    getChildSyntaxList() {
        let node = this;
        if (node.isBodyableNode() || node.isBodiedNode()) {
            do {
                node = node.isBodyableNode() ? node.getBodyOrThrow() : node.getBody();
            } while ((node.isBodyableNode() || node.isBodiedNode()) && node.compilerNode.statements == null);
        }
        if (node.isSourceFile() || this.isBodyableNode() || this.isBodiedNode())
            return node.getFirstChildByKind(ts.SyntaxKind.SyntaxList);
        let passedBrace = false;
        for (const child of node.getChildrenIterator()) {
            if (!passedBrace)
                passedBrace = child.getKind() === ts.SyntaxKind.FirstPunctuation;
            else if (child.getKind() === ts.SyntaxKind.SyntaxList)
                return child;
        }
        return undefined;
    }
    /**
     * Gets the children based on a kind.
     * @param kind - Syntax kind.
     */
    getChildrenOfKind(kind) {
        return this.getChildren().filter(c => c.getKind() === kind);
    }
    *getAllChildren() {
        for (const compilerChild of this.compilerNode.getChildren(this.sourceFile.compilerNode)) {
            const child = this.global.compilerFactory.getNodeFromCompilerNode(compilerChild, this.sourceFile);
            yield child;
            for (const childChild of child.getAllChildren())
                yield childChild;
        }
    }
    /**
     * Gets the child count.
     */
    getChildCount() {
        return this.compilerNode.getChildCount(this.sourceFile.compilerNode);
    }
    /**
     * Gets the child at the provided position, or undefined if not found.
     * @param pos - Position to search for.
     */
    getChildAtPos(pos) {
        if (pos < this.getPos() || pos >= this.getEnd())
            return undefined;
        for (const child of this.getChildrenIterator()) {
            if (pos >= child.getPos() && pos < child.getEnd())
                return child;
        }
        return undefined;
    }
    /**
     * Gets the most specific descendant at the provided position, or undefined if not found.
     * @param pos - Position to search for.
     */
    getDescendantAtPos(pos) {
        let node;
        while (true) {
            const nextNode = (node || this).getChildAtPos(pos);
            if (nextNode == null)
                return node;
            else
                node = nextNode;
        }
    }
    /**
     * Gets the start position with leading trivia.
     */
    getPos() {
        return this.compilerNode.pos;
    }
    /**
     * Gets the end position.
     */
    getEnd() {
        return this.compilerNode.end;
    }
    /**
     * Gets the start without trivia.
     */
    getStart() {
        return this.compilerNode.getStart(this.sourceFile.compilerNode);
    }
    /**
     * Gets the width of the node (length without trivia).
     */
    getWidth() {
        return this.compilerNode.getWidth(this.sourceFile.compilerNode);
    }
    /**
     * Gets the full width of the node (length with trivia).
     */
    getFullWidth() {
        return this.compilerNode.getFullWidth();
    }
    /**
     * Gets the text without leading trivia.
     */
    getText() {
        return this.compilerNode.getText(this.sourceFile.compilerNode);
    }
    /**
     * Gets the full text with leading trivia.
     */
    getFullText() {
        return this.compilerNode.getFullText(this.sourceFile.compilerNode);
    }
    /**
     * Gets the combined modifier flags.
     */
    getCombinedModifierFlags() {
        return ts.getCombinedModifierFlags(this.compilerNode);
    }
    /**
     * @internal
     */
    replaceCompilerNode(compilerNode) {
        this._compilerNode = compilerNode;
    }
    /**
     * Gets the source file.
     */
    getSourceFile() {
        return this.sourceFile;
    }
    /**
     * Goes up the tree yielding all the parents in order.
     */
    *getParents() {
        let parent = this.getParent();
        while (parent != null) {
            yield parent;
            parent = parent.getParent();
        }
    }
    /**
     * Get the node's parent.
     */
    getParent() {
        return (this.compilerNode.parent == null) ? undefined : this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.parent, this.sourceFile);
    }
    /**
     * Gets the parent or throws an error if it doesn't exist.
     */
    getParentOrThrow() {
        const parentNode = this.getParent();
        if (parentNode == null)
            throw new errors.InvalidOperationError("A parent is required to do this operation.");
        return parentNode;
    }
    /**
     * Gets the first parent by syntax kind or throws if not found.
     * @param kind - Syntax kind.
     */
    getFirstParentByKindOrThrow(kind) {
        const parentNode = this.getFirstParentByKind(kind);
        if (parentNode == null)
            throw new errors.InvalidOperationError(`A parent of kind ${ts.SyntaxKind[kind]} is required to do this operation.`);
        return parentNode;
    }
    /**
     * Get the first parent by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstParentByKind(kind) {
        for (const parent of this.getParents()) {
            if (parent.getKind() === kind)
                return parent;
        }
        return undefined;
    }
    /**
     * @internal
     */
    appendNewLineSeparatorIfNecessary() {
        // todo: consider removing this method
        const text = this.getFullText();
        if (this.isSourceFile()) {
            const hasText = text.length > 0;
            if (hasText)
                this.ensureLastChildNewLine();
        }
        else
            this.ensureLastChildNewLine();
    }
    /**
     * @internal
     */
    ensureLastChildNewLine() {
        // todo: consider removing this method
        if (!this.isLastChildTextNewLine())
            this.appendChildNewLine();
    }
    /**
     * @internal
     */
    isLastChildTextNewLine() {
        // todo: consider removing this method
        const text = this.getFullText();
        /* istanbul ignore else */
        if (this.isSourceFile())
            return text.endsWith("\n");
        else if (this.isBodyableNode() || this.isBodiedNode()) {
            const body = this.isBodyableNode() ? this.getBodyOrThrow() : this.getBody();
            const bodyText = body.getFullText();
            return /\n\s*\}$/.test(bodyText);
        }
        else
            throw errors.getNotImplementedForSyntaxKindError(this.getKind());
    }
    /**
     * @internal
     */
    appendChildNewLine() {
        // todo: consider removing this method
        const newLineText = this.global.manipulationSettings.getNewLineKind();
        if (this.isSourceFile()) {
            this.sourceFile.compilerNode.text += newLineText;
            this.sourceFile.compilerNode.end += newLineText.length;
        }
        else {
            const indentationText = this.getIndentationText();
            const lastToken = this.getLastToken();
            const lastTokenPos = lastToken.getStart();
            manipulation_1.replaceNodeText(this.sourceFile, lastTokenPos, lastTokenPos, newLineText + indentationText);
        }
    }
    /**
     * Gets the last token of this node. Usually this is a close brace.
     */
    getLastToken() {
        const lastToken = this.compilerNode.getLastToken(this.sourceFile.compilerNode);
        /* istanbul ignore if */
        if (lastToken == null)
            throw new errors.NotImplementedError("Not implemented scenario where the last token does not exist");
        return this.global.compilerFactory.getNodeFromCompilerNode(lastToken, this.sourceFile);
    }
    /**
     * Gets if this node is in a syntax list.
     */
    isInSyntaxList() {
        return this.getParentSyntaxList() != null;
    }
    /**
     * Gets the parent if it's a syntax list or throws an error otherwise.
     */
    getParentSyntaxListOrThrow() {
        const parentSyntaxList = this.getParentSyntaxList();
        if (parentSyntaxList == null)
            throw new errors.InvalidOperationError("The parent must be a SyntaxList in order to get the required parent syntax list.");
        return parentSyntaxList;
    }
    /**
     * Gets the parent if it's a syntax list.
     */
    getParentSyntaxList() {
        const parent = this.getParent();
        if (parent == null)
            return undefined;
        const pos = this.getPos();
        const end = this.getEnd();
        for (const child of parent.getChildren()) {
            if (child.getPos() > pos || child === this)
                return undefined;
            if (child.getKind() === ts.SyntaxKind.SyntaxList && child.getPos() <= pos && child.getEnd() >= end)
                return child;
        }
        return undefined; // shouldn't happen
    }
    /**
     * Gets the child index of this node relative to the parent.
     */
    getChildIndex() {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        let i = 0;
        for (const child of parent.getChildren()) {
            if (child === this)
                return i;
            i++;
        }
        /* istanbul ignore next */
        throw new errors.NotImplementedError("For some reason the child's parent did not contain the child.");
    }
    /**
     * Gets if the current node is a source file.
     * @internal
     */
    isSourceFile() {
        return this.compilerNode.kind === ts.SyntaxKind.SourceFile;
    }
    /**
     * Gets if the current node is a constructor declaration.
     * @internal
     */
    isConstructorDeclaration() {
        return this.compilerNode.kind === ts.SyntaxKind.Constructor;
    }
    /**
     * Gets if the current node is a function declaration.
     * @internal
     */
    isFunctionDeclaration() {
        return this.compilerNode.kind === ts.SyntaxKind.FunctionDeclaration;
    }
    /**
     * Gets if the current node is an interface declaration.
     * @internal
     */
    isInterfaceDeclaration() {
        return this.compilerNode.kind === ts.SyntaxKind.InterfaceDeclaration;
    }
    /**
     * Gets if the current node is a namespace declaration.
     * @internal
     */
    isNamespaceDeclaration() {
        return this.compilerNode.kind === ts.SyntaxKind.ModuleDeclaration;
    }
    /**
     * Gets if the current node is a type alias declaration.
     * @internal
     */
    isTypeAliasDeclaration() {
        return this.compilerNode.kind === ts.SyntaxKind.TypeAliasDeclaration;
    }
    /**
     * Gets if the current node is a modifierable node.
     * @internal
     */
    isModifierableNode() {
        return this["addModifier"] != null;
    }
    /**
     * Gets if the current node is a method declaration.
     * @internal
     */
    isMethodDeclaration() {
        return this.compilerNode.kind === ts.SyntaxKind.MethodDeclaration;
    }
    /* Mixin type guards (overridden in mixins to set to true) */
    /**
     * Gets if this is a bodied node.
     */
    isBodiedNode() {
        return false;
    }
    /**
     * Gets if this is a bodyable node.
     */
    isBodyableNode() {
        return false;
    }
    /**
     * Gets if this is an initializer expressionable node.
     */
    isInitializerExpressionableNode() {
        return false;
    }
    /* End mixin type guards */
    /**
     * Gets the indentation text.
     */
    getIndentationText() {
        const sourceFileText = this.sourceFile.getFullText();
        const startLinePos = this.getStartLinePos();
        const startPos = this.getStart();
        let text = "";
        for (let i = startPos - 1; i >= startLinePos; i--) {
            const currentChar = sourceFileText[i];
            switch (currentChar) {
                case " ":
                case "\t":
                    text = currentChar + text;
                    break;
                case "\n":
                    return text;
                default:
                    text = "";
            }
        }
        return text;
    }
    /**
     * Gets the next indentation level text.
     */
    getChildIndentationText() {
        if (this.isSourceFile())
            return "";
        return this.getIndentationText() + this.global.manipulationSettings.getIndentationText();
    }
    /**
     * Gets the position of the start of the line that this node is on.
     */
    getStartLinePos() {
        const sourceFileText = this.sourceFile.getFullText();
        const startPos = this.getStart();
        for (let i = startPos - 1; i >= 0; i--) {
            const currentChar = sourceFileText.substr(i, 1);
            if (currentChar === "\n")
                return i + 1;
        }
        return 0;
    }
}
exports.Node = Node;



},{"./../../errors":137,"./../../manipulation":152,"typescript":"typescript"}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Scope;
(function (Scope) {
    Scope["Public"] = "public";
    Scope["Protected"] = "protected";
    Scope["Private"] = "private";
})(/* istanbul ignore next */Scope = exports.Scope || (exports.Scope = {}));



},{}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Signature {
    /**
     * Initializes a new instance of Signature.
     * @internal
     * @param global - GlobalContainer.
     * @param signature - Compiler signature.
     */
    constructor(global, signature) {
        this.global = global;
        this._compilerSignature = signature;
    }
    /**
     * Gets the underlying compiler signature.
     */
    get compilerSignature() {
        return this._compilerSignature;
    }
}
exports.Signature = Signature;



},{}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
class Symbol {
    /**
     * Gets the underlying compiler symbol.
     */
    get compilerSymbol() {
        return this._compilerSymbol;
    }
    /**
     * Initializes a new instance of Symbol.
     * @internal
     * @param global - Global container.
     * @param symbol - Compiler symbol.
     */
    constructor(global, symbol) {
        this.global = global;
        this._compilerSymbol = symbol;
    }
    /**
     * Gets the symbol name.
     */
    getName() {
        return this.compilerSymbol.getName();
    }
    /**
     * Gets the aliased symbol.
     */
    getAliasedSymbol() {
        return this.global.typeChecker.getAliasedSymbol(this);
    }
    /**
     * Gets if the symbol is an alias.
     */
    isAlias() {
        return (this.getFlags() & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias;
    }
    /**
     * Gets the symbol flags.
     */
    getFlags() {
        return this.compilerSymbol.getFlags();
    }
    /**
     * Gets if the symbol has the specified flags.
     * @param flags - Flags to check if the symbol has.
     */
    hasFlags(flags) {
        return (this.compilerSymbol.flags & flags) === flags;
    }
    /**
     * Gets if the symbols are equal.
     * @param symbol - Other symbol to check.
     */
    equals(symbol) {
        if (symbol == null)
            return false;
        return this.compilerSymbol === symbol.compilerSymbol;
    }
    /**
     * Gets the symbol declarations.
     */
    getDeclarations() {
        // todo: is it important that this might return undefined in ts 2.4?
        return (this.compilerSymbol.declarations || []).map(d => this.global.compilerFactory.getNodeFromCompilerNode(d, this.global.compilerFactory.getSourceFileForNode(d)));
    }
    /**
     * Get the exports of the symbol.
     * @param name - Name of the export.
     */
    getExportByName(name) {
        if (this.compilerSymbol.exports == null)
            return undefined;
        const tsSymbol = this.compilerSymbol.exports.get(name);
        return tsSymbol == null ? undefined : this.global.compilerFactory.getSymbol(tsSymbol);
    }
    /**
     * Gets the declared type of the symbol.
     */
    getDeclaredType() {
        return this.global.typeChecker.getDeclaredTypeOfSymbol(this);
    }
    /**
     * Gets the type of the symbol at a location.
     * @param node - Location to get the type at for this symbol.
     */
    getTypeAtLocation(node) {
        return this.global.typeChecker.getTypeOfSymbolAtLocation(this, node);
    }
    /**
     * Gets the fully qualified name.
     */
    getFullyQualifiedName() {
        return this.global.typeChecker.getFullyQualifiedName(this);
    }
}
exports.Symbol = Symbol;



},{"typescript":"typescript"}],78:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./decorator/Decorator"));



},{"./decorator/Decorator":79}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const common_1 = require("./../common");
exports.DecoratorBase = common_1.Node;
class Decorator extends exports.DecoratorBase {
    /**
     * Gets the decorator name.
     */
    getName() {
        const sourceFile = this.getSourceFile();
        function getNameFromExpression(expression) {
            if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                const propAccess = expression;
                return propAccess.name.getText(sourceFile.compilerNode);
            }
            return expression.getText(sourceFile.compilerNode);
        }
        if (this.isDecoratorFactory()) {
            const callExpression = this.compilerNode.expression;
            return getNameFromExpression(callExpression.expression);
        }
        return getNameFromExpression(this.compilerNode.expression);
    }
    /**
     * Gets the full decorator name.
     */
    getFullName() {
        const sourceFile = this.getSourceFile();
        if (this.isDecoratorFactory()) {
            const callExpression = this.compilerNode.expression;
            return callExpression.expression.getText(sourceFile.compilerNode);
        }
        return this.compilerNode.expression.getText(sourceFile.compilerNode);
    }
    /**
     * Gets if the decorator is a decorator factory.
     */
    isDecoratorFactory() {
        return this.compilerNode.expression.kind === ts.SyntaxKind.CallExpression;
    }
    /**
     * Gets the compiler call expression if a decorator factory.
     */
    getCallExpression() {
        if (!this.isDecoratorFactory())
            return undefined;
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile);
    }
}
exports.Decorator = Decorator;



},{"./../common":70,"typescript":"typescript"}],80:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./doc/JSDoc"));



},{"./doc/JSDoc":81}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./../common");
class JSDoc extends common_1.Node {
}
exports.JSDoc = JSDoc;



},{"./../common":70}],82:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./enum/EnumDeclaration"));
__export(require("./enum/EnumMember"));



},{"./enum/EnumDeclaration":83,"./enum/EnumMember":84}],83:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const utils_1 = require("./../../utils");
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const namespace_1 = require("./../namespace");
const base_1 = require("./../base");
const EnumMember_1 = require("./EnumMember");
exports.EnumDeclarationBase = namespace_1.NamespaceChildableNode(base_1.DocumentationableNode(base_1.AmbientableNode(base_1.ExportableNode(base_1.ModifierableNode(base_1.NamedNode(common_1.Node))))));
class EnumDeclaration extends exports.EnumDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.EnumDeclarationBase.prototype, this, structure);
        if (structure.isConst != null)
            this.setIsConstEnum(structure.isConst);
        if (structure.members != null && structure.members.length > 0)
            this.addMembers(structure.members);
        return this;
    }
    /**
     * Adds a member to the enum.
     * @param structure - Structure of the enum.
     */
    addMember(structure) {
        return this.addMembers([structure])[0];
    }
    /**
     * Adds members to the enum.
     * @param structures - Structures of the enums.
     */
    addMembers(structures) {
        return this.insertMembers(this.getMembers().length, structures);
    }
    /**
     * Inserts a member to the enum.
     * @param index - Index to insert at.
     * @param structure - Structure of the enum.
     */
    insertMember(index, structure) {
        return this.insertMembers(index, [structure])[0];
    }
    /**
     * Inserts members to an enum.
     * @param index - Index to insert at.
     * @param structures - Structures of the enums.
     */
    insertMembers(index, structures) {
        const members = this.getMembers();
        index = manipulation_1.verifyAndGetIndex(index, members.length);
        if (structures.length === 0)
            return [];
        const previousMember = members[index - 1];
        const previousMemberComma = previousMember == null ? undefined : previousMember.getNextSiblingIfKind(ts.SyntaxKind.CommaToken);
        const nextMember = members[index];
        const indentationText = this.getChildIndentationText();
        const newLineChar = this.global.manipulationSettings.getNewLineKind();
        const syntaxList = this.getChildSyntaxListOrThrow();
        const syntaxListChildren = syntaxList.getChildren();
        const insertChildIndex = previousMember == null ? 0 : syntaxListChildren.indexOf(previousMemberComma || previousMember) + 1;
        // create member code
        let numberChildren = 1;
        let code = "";
        if (previousMember != null && previousMemberComma == null) {
            code += ",";
            numberChildren++;
        }
        code += `${newLineChar}${getMemberText(structures[0])}`;
        for (const structure of structures.slice(1)) {
            code += `,${newLineChar}${getMemberText(structure)}`;
            numberChildren += 2;
        }
        if (nextMember != null) {
            code += ",";
            numberChildren++;
        }
        function getMemberText(structure) {
            let memberText = `${indentationText}${structure.name}`;
            if (typeof structure.value !== "undefined")
                memberText += ` = ${structure.value}`;
            return memberText;
        }
        // get the insert position
        let insertPos;
        if (previousMember == null)
            insertPos = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken).getEnd();
        else if (previousMemberComma == null)
            insertPos = previousMember.getEnd();
        else
            insertPos = previousMember.getNextSiblingIfKind(ts.SyntaxKind.CommaToken).getEnd();
        // insert
        manipulation_1.insertIntoSyntaxList({
            insertPos,
            newText: code,
            syntaxList,
            childIndex: insertChildIndex,
            insertItemsCount: numberChildren
        });
        // get the members
        const newMembers = this.getMembers().slice(index, index + structures.length);
        newMembers.forEach((m, i) => m.fill(structures[i]));
        return newMembers;
    }
    getMember(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getMembers(), nameOrFindFunction);
    }
    /**
     * Gets the enum's members.
     */
    getMembers() {
        return this.getChildSyntaxListOrThrow().getChildren().filter(c => c instanceof EnumMember_1.EnumMember);
    }
    /**
     * Toggle if it's a const enum
     */
    setIsConstEnum(value) {
        return this.toggleModifier("const", value);
    }
    /**
     * Gets if it's a const enum.
     */
    isConstEnum() {
        return this.getConstKeyword() != null;
    }
    /**
     * Gets the const enum keyword or undefined if not exists.
     */
    getConstKeyword() {
        return this.getFirstModifierByKind(ts.SyntaxKind.ConstKeyword);
    }
}
exports.EnumDeclaration = EnumDeclaration;



},{"./../../manipulation":152,"./../../utils":179,"./../base":31,"./../callBaseFill":60,"./../common":70,"./../namespace":104,"./EnumMember":84,"typescript":"typescript"}],84:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
exports.EnumMemberBase = base_1.DocumentationableNode(base_1.InitializerExpressionableNode(base_1.PropertyNamedNode(common_1.Node)));
class EnumMember extends exports.EnumMemberBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.EnumMemberBase.prototype, this, structure);
        if (structure.value != null)
            this.setValue(structure.value);
        return this;
    }
    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this.global.typeChecker.getConstantValue(this);
    }
    /**
     * Sets the enum value.
     * @param value - Enum value.
     */
    setValue(value) {
        let text;
        if (typeof value === "string") {
            const stringChar = this.global.manipulationSettings.getStringChar();
            text = stringChar + value + stringChar;
        }
        else {
            text = value.toString();
        }
        this.setInitializer(text);
        return this;
    }
    /**
     * Removes this enum member.
     */
    remove() {
        manipulation_1.removeNodes([this, this.getNextSiblingIfKind(ts.SyntaxKind.CommaToken)]);
    }
}
exports.EnumMember = EnumMember;



},{"./../../manipulation":152,"./../base":31,"./../callBaseFill":60,"./../common":70,"typescript":"typescript"}],85:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./file/ExportDeclaration"));
__export(require("./file/ExportSpecifier"));
__export(require("./file/ImportDeclaration"));
__export(require("./file/ImportSpecifier"));
__export(require("./file/SourceFile"));



},{"./file/ExportDeclaration":86,"./file/ExportSpecifier":87,"./file/ImportDeclaration":88,"./file/ImportSpecifier":89,"./file/SourceFile":90}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const utils_1 = require("./../../utils");
const common_1 = require("./../common");
const ExportSpecifier_1 = require("./ExportSpecifier");
class ExportDeclaration extends common_1.Node {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the import specifier.
     */
    setModuleSpecifier(text) {
        const stringLiteral = this.getLastChildByKind(ts.SyntaxKind.StringLiteral);
        if (stringLiteral == null) {
            const semiColonToken = this.getLastChildIfKind(ts.SyntaxKind.SemicolonToken);
            const stringChar = this.global.manipulationSettings.getStringChar();
            manipulation_1.insertStraight({
                insertPos: semiColonToken != null ? semiColonToken.getPos() : this.getEnd(),
                newCode: ` from ${stringChar}${text}${stringChar}`,
                parent: this
            });
        }
        else
            manipulation_1.replaceStraight(this.getSourceFile(), stringLiteral.getStart() + 1, stringLiteral.getWidth() - 2, text);
        return this;
    }
    /**
     * Gets the module specifier or undefined if it doesn't exist.
     */
    getModuleSpecifier() {
        const stringLiteral = this.getLastChildByKind(ts.SyntaxKind.StringLiteral);
        if (stringLiteral == null)
            return undefined;
        const text = stringLiteral.getText();
        return text.substring(1, text.length - 1);
    }
    /**
     * Gets if the module specifier exists
     */
    hasModuleSpecifier() {
        return this.getLastChildByKind(ts.SyntaxKind.StringLiteral) != null;
    }
    /**
     * Gets if this export declaration is a namespace export.
     */
    isNamespaceExport() {
        return !this.hasNamedExports();
    }
    /**
     * Gets if the export declaration has named exports.
     */
    hasNamedExports() {
        return this.getFirstChildByKind(ts.SyntaxKind.NamedExports) != null;
    }
    /**
     * Add a named export.
     * @param structure - Structure that represents the named export.
     */
    addNamedExport(structure) {
        return this.addNamedExports([structure])[0];
    }
    /**
     * Add named exports.
     * @param structures - Structures that represent the named exports.
     */
    addNamedExports(structures) {
        return this.insertNamedExports(this.getNamedExports().length, structures);
    }
    /**
     * Insert a named export.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the named export.
     */
    insertNamedExport(index, structure) {
        return this.insertNamedExports(index, [structure])[0];
    }
    /**
     * Inserts named exports into the export declaration.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the named exports.
     */
    insertNamedExports(index, structures) {
        if (utils_1.ArrayUtils.isNullOrEmpty(structures))
            return [];
        const namedExports = this.getNamedExports();
        const codes = structures.map(s => {
            let text = s.name;
            if (s.alias != null && s.alias.length > 0)
                text += ` as ${s.alias}`;
            return text;
        });
        index = manipulation_1.verifyAndGetIndex(index, namedExports.length);
        if (namedExports.length === 0) {
            const asteriskToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.AsteriskToken);
            manipulation_1.insertStraight({
                insertPos: asteriskToken.getStart(),
                parent: this,
                newCode: `{${codes.join(", ")}}`,
                replacing: {
                    nodes: [asteriskToken],
                    length: 1
                }
            });
        }
        else {
            manipulation_1.insertIntoCommaSeparatedNodes({ currentNodes: namedExports, insertIndex: index, newTexts: codes });
        }
        return this.getNamedExports().slice(index, index + structures.length);
    }
    /**
     * Gets the named exports.
     */
    getNamedExports() {
        const namedExports = this.getFirstChildByKind(ts.SyntaxKind.NamedExports);
        if (namedExports == null)
            return [];
        return namedExports.getChildSyntaxListOrThrow().getChildren().filter(c => c instanceof ExportSpecifier_1.ExportSpecifier);
    }
}
exports.ExportDeclaration = ExportDeclaration;



},{"./../../manipulation":152,"./../../utils":179,"./../common":70,"./ExportSpecifier":87,"typescript":"typescript"}],87:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const common_1 = require("./../common");
class ExportSpecifier extends common_1.Node {
    /**
     * Sets the name of what's being exported.
     */
    setName(name) {
        const nameIdentifier = this.getName();
        if (nameIdentifier.getText() === name)
            return this;
        const start = nameIdentifier.getStart();
        manipulation_1.replaceNodeText(this.sourceFile, start, start + nameIdentifier.getWidth(), name);
        return this;
    }
    /**
     * Renames the name of what's being exported.
     */
    renameName(name) {
        this.getName().rename(name);
        return this;
    }
    /**
     * Gets the name of what's being exported.
     */
    getName() {
        return this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier);
    }
    /**
     * Sets the alias for the name being exported.
     * @param alias - Alias to set.
     */
    setAlias(alias) {
        let aliasIdentifier = this.getAlias();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            const nameIdentifier = this.getName();
            manipulation_1.insertStraight({ insertPos: nameIdentifier.getEnd(), parent: this, newCode: ` as ${nameIdentifier.getText()}` });
            aliasIdentifier = this.getAlias();
        }
        aliasIdentifier.rename(alias);
        return this;
    }
    /**
     * Gets the alias, if it exists.
     */
    getAlias() {
        const asKeyword = this.getFirstChildByKind(ts.SyntaxKind.AsKeyword);
        if (asKeyword == null)
            return undefined;
        const aliasIdentifier = asKeyword.getNextSibling();
        if (aliasIdentifier == null || !(aliasIdentifier instanceof common_1.Identifier))
            return undefined;
        return aliasIdentifier;
    }
    /**
     * Gets the export declaration associated with this export specifier.
     */
    getExportDeclaration() {
        return this.getFirstParentByKindOrThrow(ts.SyntaxKind.ExportDeclaration);
    }
}
exports.ExportSpecifier = ExportSpecifier;



},{"./../../manipulation":152,"./../common":70,"typescript":"typescript"}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
const utils_1 = require("./../../utils");
const common_1 = require("./../common");
const ImportSpecifier_1 = require("./ImportSpecifier");
class ImportDeclaration extends common_1.Node {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the import specifier.
     */
    setModuleSpecifier(text) {
        const stringLiteral = this.getLastChildByKindOrThrow(ts.SyntaxKind.StringLiteral);
        manipulation_1.replaceStraight(this.getSourceFile(), stringLiteral.getStart() + 1, stringLiteral.getWidth() - 2, text);
        return this;
    }
    /**
     * Gets the module specifier.
     */
    getModuleSpecifier() {
        const stringLiteral = this.getLastChildByKindOrThrow(ts.SyntaxKind.StringLiteral);
        const text = stringLiteral.getText();
        return text.substring(1, text.length - 1);
    }
    /**
     * Sets the default import.
     * @param text - Text to set as the default import.
     */
    setDefaultImport(text) {
        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            defaultImport.rename(text);
            return this;
        }
        const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
        const importClause = this.getImportClause();
        if (importClause == null) {
            manipulation_1.insertStraight({
                insertPos: importKeyword.getEnd(),
                parent: this,
                newCode: ` ${text} from`
            });
            return this;
        }
        // a namespace import or named import must exist... insert it beforehand
        manipulation_1.insertStraight({
            insertPos: importKeyword.getEnd(),
            parent: importClause,
            newCode: ` ${text},`
        });
        return this;
    }
    /**
     * Gets the default import, if it exists.
     */
    getDefaultImport() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return undefined;
        const firstChild = importClause.getFirstChild();
        if (firstChild == null || firstChild.getKind() !== ts.SyntaxKind.Identifier)
            return undefined;
        return firstChild;
    }
    /**
     * Sets the namespace import.
     * @param text - Text to set as the namespace import.
     * @throws - InvalidOperationError if a named import exists.
     */
    setNamespaceImport(text) {
        const namespaceImport = this.getNamespaceImport();
        if (namespaceImport != null) {
            namespaceImport.rename(text);
            return this;
        }
        if (this.getNamedImports().length > 0)
            throw new errors.InvalidOperationError("Cannot add a namespace import to an import declaration that has named imports.");
        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            manipulation_1.insertStraight({ insertPos: defaultImport.getEnd(), parent: this.getImportClause(), newCode: `, * as ${text}` });
            return this;
        }
        const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
        manipulation_1.insertStraight({ insertPos: importKeyword.getEnd(), parent: this, newCode: ` * as ${text} from` });
        return this;
    }
    /**
     * Gets the namespace import, if it exists.
     */
    getNamespaceImport() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return undefined;
        const namespaceImport = importClause.getFirstChildByKind(ts.SyntaxKind.NamespaceImport);
        if (namespaceImport == null)
            return undefined;
        return namespaceImport.getFirstChildByKind(ts.SyntaxKind.Identifier);
    }
    /**
     * Add a named import.
     * @param structure - Structure that represents the named import.
     */
    addNamedImport(structure) {
        return this.addNamedImports([structure])[0];
    }
    /**
     * Add named imports.
     * @param structures - Structures that represent the named imports.
     */
    addNamedImports(structures) {
        return this.insertNamedImports(this.getNamedImports().length, structures);
    }
    /**
     * Insert a named import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the named import.
     */
    insertNamedImport(index, structure) {
        return this.insertNamedImports(index, [structure])[0];
    }
    /**
     * Inserts named imports into the import declaration.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the named imports.
     */
    insertNamedImports(index, structures) {
        if (utils_1.ArrayUtils.isNullOrEmpty(structures))
            return [];
        const namedImports = this.getNamedImports();
        const codes = structures.map(s => {
            let text = s.name;
            if (s.alias != null && s.alias.length > 0)
                text += ` as ${s.alias}`;
            return text;
        });
        index = manipulation_1.verifyAndGetIndex(index, namedImports.length);
        if (namedImports.length === 0) {
            const importClause = this.getImportClause();
            if (importClause == null) {
                const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
                manipulation_1.insertStraight({ insertPos: importKeyword.getEnd(), parent: this, newCode: ` {${codes.join(", ")}} from` });
            }
            else if (this.getNamespaceImport() != null)
                throw new errors.InvalidOperationError("Cannot add a named import to an import declaration that has a namespace import.");
            else
                manipulation_1.insertStraight({ insertPos: this.getDefaultImport().getEnd(), parent: importClause, newCode: `, {${codes.join(", ")}}` });
        }
        else {
            manipulation_1.insertIntoCommaSeparatedNodes({ currentNodes: namedImports, insertIndex: index, newTexts: codes });
        }
        return this.getNamedImports().slice(index, index + structures.length);
    }
    /**
     * Gets the named imports.
     */
    getNamedImports() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return [];
        const namedImports = importClause.getFirstChildByKind(ts.SyntaxKind.NamedImports);
        if (namedImports == null)
            return [];
        return namedImports.getChildSyntaxListOrThrow().getChildren().filter(c => c instanceof ImportSpecifier_1.ImportSpecifier);
    }
    getImportClause() {
        return this.getFirstChildByKind(ts.SyntaxKind.ImportClause);
    }
}
exports.ImportDeclaration = ImportDeclaration;



},{"./../../errors":137,"./../../manipulation":152,"./../../utils":179,"./../common":70,"./ImportSpecifier":89,"typescript":"typescript"}],89:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const common_1 = require("./../common");
class ImportSpecifier extends common_1.Node {
    /**
     * Sets the identifier being imported.
     * @param name - Name being imported.
     */
    setName(name) {
        const nameIdentifier = this.getName();
        if (nameIdentifier.getText() === name)
            return this;
        const start = nameIdentifier.getStart();
        manipulation_1.replaceNodeText(this.sourceFile, start, start + nameIdentifier.getWidth(), name);
        return this;
    }
    /**
     * Renames the identifier being imported.
     * @param name - New name.
     */
    renameName(name) {
        this.getName().rename(name);
        return this;
    }
    /**
     * Gets the name of what's being imported.
     */
    getName() {
        return this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier);
    }
    /**
     * Sets the alias for the name being imported.
     * @param alias - Alias to set.
     */
    setAlias(alias) {
        let aliasIdentifier = this.getAlias();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            const nameIdentifier = this.getName();
            manipulation_1.insertStraight({ insertPos: nameIdentifier.getEnd(), parent: this, newCode: ` as ${nameIdentifier.getText()}` });
            aliasIdentifier = this.getAlias();
        }
        aliasIdentifier.rename(alias);
        return this;
    }
    /**
     * Gets the alias, if it exists.
     */
    getAlias() {
        const asKeyword = this.getFirstChildByKind(ts.SyntaxKind.AsKeyword);
        if (asKeyword == null)
            return undefined;
        const aliasIdentifier = asKeyword.getNextSibling();
        if (aliasIdentifier == null || !(aliasIdentifier instanceof common_1.Identifier))
            return undefined;
        return aliasIdentifier;
    }
    /**
     * Gets the import declaration associated with this import specifier.
     */
    getImportDeclaration() {
        return this.getFirstParentByKindOrThrow(ts.SyntaxKind.ImportDeclaration);
    }
}
exports.ImportSpecifier = ImportSpecifier;



},{"./../../manipulation":152,"./../common":70,"typescript":"typescript"}],90:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
const utils_1 = require("./../../utils");
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const statement_1 = require("./../statement");
const ImportDeclaration_1 = require("./ImportDeclaration");
const ExportDeclaration_1 = require("./ExportDeclaration");
// todo: not sure why I need to explicitly type this in order to get VS to not complain... (TS 2.4.1)
exports.SourceFileBase = statement_1.StatementedNode(common_1.Node);
class SourceFile extends exports.SourceFileBase {
    /**
     * Initializes a new instance.
     * @internal
     * @param global - Global container.
     * @param node - Underlying node.
     */
    constructor(global, node) {
        // start hack :(
        super(global, node, undefined);
        /** @internal */
        this._isSaved = false;
        this.sourceFile = this;
        // end hack
    }
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.SourceFileBase.prototype, this, structure);
        if (structure.imports != null)
            this.addImports(structure.imports);
        if (structure.exports != null)
            this.addExports(structure.exports);
        return this;
    }
    /**
     * @internal
     */
    replaceCompilerNode(compilerNode) {
        super.replaceCompilerNode(compilerNode);
        this.global.resetProgram(); // make sure the program has the latest source file
        this._isSaved = true;
    }
    /**
     * Gets the file path.
     */
    getFilePath() {
        return this.compilerNode.fileName;
    }
    /**
     * Copy this source file to a new file.
     * @param filePath - A new file path. Can be relative to the original file or an absolute path.
     */
    copy(filePath) {
        const absoluteFilePath = utils_1.FileUtils.getAbsoluteOrRelativePathFromPath(filePath, utils_1.FileUtils.getDirName(this.getFilePath()));
        return this.global.compilerFactory.addSourceFileFromText(absoluteFilePath, this.getFullText());
    }
    /**
     * Asynchronously saves this file with any changes.
     */
    save() {
        return this.global.fileSystem.writeFile(this.getFilePath(), this.getFullText()).then(() => {
            this._isSaved = true;
        });
    }
    /**
     * Synchronously saves this file with any changes.
     */
    saveSync() {
        this.global.fileSystem.writeFileSync(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }
    /**
     * Gets any referenced files.
     */
    getReferencedFiles() {
        // todo: add tests
        const dirName = utils_1.FileUtils.getDirName(this.getFilePath());
        return (this.compilerNode.referencedFiles || [])
            .map(f => this.global.compilerFactory.getSourceFileFromFilePath(utils_1.FileUtils.pathJoin(dirName, f.fileName)))
            .filter(f => f != null);
    }
    /**
     * Gets the source files for any type reference directives.
     */
    getTypeReferenceDirectives() {
        // todo: add tests
        const dirName = utils_1.FileUtils.getDirName(this.getFilePath());
        return (this.compilerNode.typeReferenceDirectives || [])
            .map(f => this.global.compilerFactory.getSourceFileFromFilePath(utils_1.FileUtils.pathJoin(dirName, f.fileName)))
            .filter(f => f != null);
    }
    /**
     * Gets the source file language variant.
     */
    getLanguageVariant() {
        return this.compilerNode.languageVariant;
    }
    /**
     * Gets if this is a declaration file.
     */
    isDeclarationFile() {
        return this.compilerNode.isDeclarationFile;
    }
    /**
     * Gets if this source file has been saved or if the latest changes have been saved.
     */
    isSaved() {
        return this._isSaved;
    }
    /**
     * Sets if this source file has been saved.
     * @internal
     */
    setIsSaved(value) {
        this._isSaved = value;
    }
    /**
     * Add an import.
     * @param structure - Structure that represents the import.
     */
    addImport(structure) {
        return this.addImports([structure])[0];
    }
    /**
     * Add imports.
     * @param structures - Structures that represent the imports.
     */
    addImports(structures) {
        const imports = this.getImports();
        const insertIndex = imports.length === 0 ? 0 : imports[imports.length - 1].getChildIndex() + 1;
        return this.insertImports(insertIndex, structures);
    }
    /**
     * Insert an import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the import.
     */
    insertImport(index, structure) {
        return this.insertImports(index, [structure])[0];
    }
    /**
     * Insert imports into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the imports to insert.
     */
    insertImports(index, structures) {
        const newLineChar = this.global.manipulationSettings.getNewLineKind();
        const indentationText = this.getChildIndentationText();
        const texts = structures.map(structure => {
            const hasNamedImport = structure.namedImports != null && structure.namedImports.length > 0;
            let code = `${indentationText}import`;
            // validation
            if (hasNamedImport && structure.namespaceImport != null)
                throw new errors.InvalidOperationError("An import declaration cannot have both a namespace import and a named import.");
            // default import
            if (structure.defaultImport != null) {
                code += ` ${structure.defaultImport}`;
                if (hasNamedImport || structure.namespaceImport != null)
                    code += ",";
            }
            // namespace import
            if (structure.namespaceImport != null)
                code += ` * as ${structure.namespaceImport}`;
            // named imports
            if (structure.namedImports != null && structure.namedImports.length > 0) {
                const namedImportsCode = structure.namedImports.map(n => {
                    let namedImportCode = n.name;
                    if (n.alias != null)
                        namedImportCode += ` as ${n.alias}`;
                    return namedImportCode;
                }).join(", ");
                code += ` {${namedImportsCode}}`;
            }
            // from keyword
            if (structure.defaultImport != null || hasNamedImport || structure.namespaceImport != null)
                code += " from";
            code += ` "${structure.moduleSpecifier}";`;
            return code;
        });
        return this._insertMainChildren(index, texts, structures, ts.SyntaxKind.ImportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(previousMember instanceof ImportDeclaration_1.ImportDeclaration),
            nextBlanklineWhen: nextMember => !(nextMember instanceof ImportDeclaration_1.ImportDeclaration),
            separatorNewlineWhen: () => false
        });
    }
    /**
     * Gets the first import declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImport(condition) {
        return this.getImports().find(condition);
    }
    /**
     * Get the file's import declarations.
     */
    getImports() {
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ImportDeclaration);
    }
    /**
     * Add an export.
     * @param structure - Structure that represents the export.
     */
    addExport(structure) {
        return this.addExports([structure])[0];
    }
    /**
     * Add exports.
     * @param structures - Structures that represent the exports.
     */
    addExports(structures) {
        // always insert at end of file because of export {Identifier}; statements
        return this.insertExports(this.getChildSyntaxListOrThrow().getChildCount(), structures);
    }
    /**
     * Insert an export.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExport(index, structure) {
        return this.insertExports(index, [structure])[0];
    }
    /**
     * Insert exports into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExports(index, structures) {
        const newLineChar = this.global.manipulationSettings.getNewLineKind();
        const stringChar = this.global.manipulationSettings.getStringChar();
        const indentationText = this.getChildIndentationText();
        const texts = structures.map(structure => {
            const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
            let code = `${indentationText}export`;
            if (structure.namedExports != null && structure.namedExports.length > 0) {
                const namedExportsCode = structure.namedExports.map(n => {
                    let namedExportCode = n.name;
                    if (n.alias != null)
                        namedExportCode += ` as ${n.alias}`;
                    return namedExportCode;
                }).join(", ");
                code += ` {${namedExportsCode}}`;
            }
            else if (!hasModuleSpecifier)
                code += " {}";
            else
                code += " *";
            if (hasModuleSpecifier)
                code += ` from ${stringChar}${structure.moduleSpecifier}${stringChar}`;
            code += `;`;
            return code;
        });
        return this._insertMainChildren(index, texts, structures, ts.SyntaxKind.ExportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(previousMember instanceof ExportDeclaration_1.ExportDeclaration),
            nextBlanklineWhen: nextMember => !(nextMember instanceof ExportDeclaration_1.ExportDeclaration),
            separatorNewlineWhen: () => false
        });
    }
    /**
     * Gets the first export declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export by.
     */
    getExport(condition) {
        return this.getExports().find(condition);
    }
    /**
     * Get the file's export declarations.
     */
    getExports() {
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ExportDeclaration);
    }
    /**
     * Gets the default export symbol of the file.
     */
    getDefaultExportSymbol() {
        const sourceFileSymbol = this.getSymbol();
        // will be undefined when the source file doesn't have an export
        if (sourceFileSymbol == null)
            return undefined;
        return sourceFileSymbol.getExportByName("default");
    }
    /**
     * Gets the compiler diagnostics.
     */
    getDiagnostics() {
        // todo: implement cancellation token
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.global.program.compilerObject, this.compilerNode);
        return compilerDiagnostics.map(d => this.global.compilerFactory.getDiagnostic(d));
    }
    /**
     * Removes any "export default";
     */
    removeDefaultExport(defaultExportSymbol) {
        defaultExportSymbol = defaultExportSymbol || this.getDefaultExportSymbol();
        if (defaultExportSymbol == null)
            return this;
        const declaration = defaultExportSymbol.getDeclarations()[0];
        if (declaration.compilerNode.kind === ts.SyntaxKind.ExportAssignment)
            manipulation_1.removeNodes([declaration]);
        else if (declaration.isModifierableNode()) {
            const exportKeyword = declaration.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword);
            const defaultKeyword = declaration.getFirstModifierByKind(ts.SyntaxKind.DefaultKeyword);
            manipulation_1.removeNodes([exportKeyword, defaultKeyword]);
        }
        return this;
    }
    /**
     * Emits the source file.
     */
    emit(options) {
        return this.global.program.emit(Object.assign({ targetSourceFile: this }, options));
    }
}
exports.SourceFile = SourceFile;



},{"./../../errors":137,"./../../manipulation":152,"./../../utils":179,"./../callBaseFill":60,"./../common":70,"./../statement":107,"./ExportDeclaration":86,"./ImportDeclaration":88,"typescript":"typescript"}],91:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./function/FunctionDeclaration"));
__export(require("./function/FunctionLikeDeclaration"));
__export(require("./function/ParameterDeclaration"));
__export(require("./function/SignaturedDeclaration"));
__export(require("./function/OverloadableNode"));



},{"./function/FunctionDeclaration":92,"./function/FunctionLikeDeclaration":93,"./function/OverloadableNode":94,"./function/ParameterDeclaration":95,"./function/SignaturedDeclaration":96}],92:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const common_1 = require("./../common");
const getStructureFuncs = require("./../../manipulation/getStructureFunctions");
const base_1 = require("./../base");
const statement_1 = require("./../statement");
const namespace_1 = require("./../namespace");
const callBaseFill_1 = require("./../callBaseFill");
const FunctionLikeDeclaration_1 = require("./FunctionLikeDeclaration");
const OverloadableNode_1 = require("./OverloadableNode");
exports.FunctionDeclarationBase = OverloadableNode_1.OverloadableNode(base_1.AsyncableNode(base_1.GeneratorableNode(FunctionLikeDeclaration_1.FunctionLikeDeclaration(statement_1.StatementedNode(base_1.AmbientableNode(namespace_1.NamespaceChildableNode(base_1.ExportableNode(base_1.ModifierableNode(base_1.BodyableNode(base_1.NamedNode(common_1.Node)))))))))));
class FunctionDeclaration extends exports.FunctionDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.FunctionDeclarationBase.prototype, this, structure);
        if (structure.overloads != null && structure.overloads.length > 0)
            this.addOverloads(structure.overloads);
        return this;
    }
    /**
     * Adds a function overload.
     * @param structure - Structure of the overload.
     */
    addOverload(structure) {
        return this.addOverloads([structure])[0];
    }
    /**
     * Adds function overloads.
     * @param structures - Structures of the overloads.
     */
    addOverloads(structures) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }
    /**
     * Inserts a function overload.
     * @param index - Index to insert.
     * @param structure - Structure of the overload.
     */
    insertOverload(index, structure) {
        return this.insertOverloads(index, [structure])[0];
    }
    /**
     * Inserts function overloads.
     * @param index - Index to insert.
     * @param structure - Structures of the overloads.
     */
    insertOverloads(index, structures) {
        const indentationText = this.getIndentationText();
        const thisName = this.getName();
        const childCodes = structures.map(structure => `${indentationText}function ${thisName}();`);
        return OverloadableNode_1.insertOverloads({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromFunctionDeclarationOverload,
            fillNodeFromStructure: (node, structure) => node.fill(structure),
            expectedSyntaxKind: ts.SyntaxKind.FunctionDeclaration
        });
    }
}
exports.FunctionDeclaration = FunctionDeclaration;



},{"./../../manipulation/getStructureFunctions":160,"./../base":31,"./../callBaseFill":60,"./../common":70,"./../namespace":104,"./../statement":107,"./FunctionLikeDeclaration":93,"./OverloadableNode":94,"typescript":"typescript"}],93:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./../base");
const statement_1 = require("./../statement");
const SignaturedDeclaration_1 = require("./SignaturedDeclaration");
function FunctionLikeDeclaration(Base) {
    return base_1.DocumentationableNode(SignaturedDeclaration_1.SignaturedDeclaration(statement_1.StatementedNode(base_1.ModifierableNode(Base))));
}
exports.FunctionLikeDeclaration = FunctionLikeDeclaration;



},{"./../base":31,"./../statement":107,"./SignaturedDeclaration":96}],94:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manipulation_1 = require("./../../manipulation");
function OverloadableNode(Base) {
    return class extends Base {
        getOverloads() {
            return getOverloadsAndImplementation(this).filter(n => n.isOverload());
        }
        getImplementation() {
            if (this.isImplementation())
                return this;
            return getOverloadsAndImplementation(this).find(n => n.isImplementation());
        }
        isOverload() {
            return !this.isImplementation();
        }
        isImplementation() {
            return this.getBody() != null;
        }
    };
}
exports.OverloadableNode = OverloadableNode;
function getOverloadsAndImplementation(node) {
    const parentSyntaxList = node.getParentSyntaxListOrThrow();
    const name = getNameIfNamedNode(node);
    const kind = node.getKind();
    return parentSyntaxList.getChildren().filter(n => {
        const hasSameName = getNameIfNamedNode(n) === name;
        const hasSameKind = n.getKind() === kind;
        return hasSameName && hasSameKind;
    });
}
function getNameIfNamedNode(node) {
    const nodeAsNamedNode = node;
    if (nodeAsNamedNode.getName instanceof Function)
        return nodeAsNamedNode.getName();
    return undefined;
}
/**
 * @internal
 */
function insertOverloads(opts) {
    if (opts.structures.length === 0)
        return [];
    const overloads = opts.node.getOverloads();
    const overloadsCount = overloads.length;
    const parentSyntaxList = opts.node.getParentSyntaxListOrThrow();
    const firstIndex = overloads.length > 0 ? overloads[0].getChildIndex() : opts.node.getChildIndex();
    const index = manipulation_1.verifyAndGetIndex(opts.index, overloadsCount);
    const mainIndex = firstIndex + index;
    const thisStructure = opts.getThisStructure(opts.node.getImplementation() || opts.node);
    const structures = opts.structures;
    for (let i = 0; i < structures.length; i++) {
        structures[i] = Object.assign(Object.assign({}, thisStructure), structures[i]);
        // structures[i] = {...thisStructure, ...structures[i]}; // not supported by TS as of 2.4.1
    }
    manipulation_1.insertIntoBracesOrSourceFile({
        parent: opts.node.getParentOrThrow(),
        children: parentSyntaxList.getChildren(),
        index: mainIndex,
        childCodes: opts.childCodes,
        structures,
        separator: opts.node.global.manipulationSettings.getNewLineKind(),
        previousBlanklineWhen: () => index === 0,
        separatorNewlineWhen: () => false,
        nextBlanklineWhen: () => false
    });
    const children = manipulation_1.getRangeFromArray(parentSyntaxList.getChildren(), mainIndex, structures.length, opts.expectedSyntaxKind);
    children.forEach((child, i) => {
        opts.fillNodeFromStructure(child, structures[i]);
    });
    return children;
}
exports.insertOverloads = insertOverloads;



},{"./../../manipulation":152}],95:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./../common");
const manipulation_1 = require("./../../manipulation");
const base_1 = require("./../base");
const callBaseFill_1 = require("./../callBaseFill");
exports.ParameterDeclarationBase = base_1.QuestionTokenableNode(base_1.DecoratableNode(base_1.ScopeableNode(base_1.ReadonlyableNode(base_1.ModifierableNode(base_1.TypedNode(base_1.InitializerExpressionableNode(base_1.DeclarationNamedNode(common_1.Node))))))));
class ParameterDeclaration extends exports.ParameterDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.ParameterDeclarationBase.prototype, this, structure);
        if (structure.isRestParameter != null)
            this.setIsRestParameter(structure.isRestParameter);
        return this;
    }
    /**
     * Gets the dot dot dot token (...) for a rest parameter.
     */
    getDotDotDotToken() {
        return this.compilerNode.dotDotDotToken == null ? undefined : this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.dotDotDotToken, this.sourceFile);
    }
    /**
     * Gets if it's a rest parameter.
     */
    isRestParameter() {
        return this.compilerNode.dotDotDotToken != null;
    }
    /**
     * Gets if this is a parameter property.
     */
    isParameterProperty() {
        return this.getScope() != null || this.isReadonly();
    }
    /**
     * Sets if it's a rest parameter.
     * @param value - Sets if it's a rest parameter or not.
     */
    setIsRestParameter(value) {
        if (this.isRestParameter() === value)
            return this;
        if (value)
            manipulation_1.insertStraight({ insertPos: this.getNameIdentifierOrThrow().getStart(), parent: this, newCode: "..." });
        else
            manipulation_1.removeNodes([this.getDotDotDotToken()], { removePrecedingSpaces: false });
        return this;
    }
    /**
     * Gets if it's optional.
     */
    isOptional() {
        return this.compilerNode.questionToken != null || this.isRestParameter() || this.hasInitializer();
    }
}
exports.ParameterDeclaration = ParameterDeclaration;



},{"./../../manipulation":152,"./../base":31,"./../callBaseFill":60,"./../common":70}],96:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./../base");
function SignaturedDeclaration(Base) {
    return base_1.TypeParameteredNode(base_1.ReturnTypedNode(base_1.ParameteredNode(Base)));
}
exports.SignaturedDeclaration = SignaturedDeclaration;



},{"./../base":31}],97:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./general/HeritageClause"));



},{"./general/HeritageClause":98}],98:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./../common");
class HeritageClause extends common_1.Node {
    /**
     * Gets all the types for the heritage clause.
     */
    getTypes() {
        if (this.compilerNode.types == null)
            return [];
        return this.compilerNode.types.map(t => this.global.compilerFactory.getExpressionWithTypeArguments(t, this.sourceFile));
    }
}
exports.HeritageClause = HeritageClause;



},{"./../common":70}],99:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./interface/ConstructSignatureDeclaration"));
__export(require("./interface/InterfaceDeclaration"));
__export(require("./interface/MethodSignature"));
__export(require("./interface/PropertySignature"));



},{"./interface/ConstructSignatureDeclaration":100,"./interface/InterfaceDeclaration":101,"./interface/MethodSignature":102,"./interface/PropertySignature":103}],100:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
const function_1 = require("./../function");
exports.ConstructSignatureDeclarationBase = base_1.DocumentationableNode(function_1.SignaturedDeclaration(common_1.Node));
class ConstructSignatureDeclaration extends exports.ConstructSignatureDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.ConstructSignatureDeclarationBase.prototype, this, structure);
        return this;
    }
}
exports.ConstructSignatureDeclaration = ConstructSignatureDeclaration;



},{"./../base":31,"./../callBaseFill":60,"./../common":70,"./../function":91}],101:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const utils_1 = require("./../../utils");
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
const namespace_1 = require("./../namespace");
exports.InterfaceDeclarationBase = base_1.ExtendsClauseableNode(base_1.HeritageClauseableNode(base_1.TypeParameteredNode(base_1.DocumentationableNode(base_1.AmbientableNode(namespace_1.NamespaceChildableNode(base_1.ExportableNode(base_1.ModifierableNode(base_1.NamedNode(common_1.Node)))))))));
class InterfaceDeclaration extends exports.InterfaceDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.InterfaceDeclarationBase.prototype, this, structure);
        if (structure.constructSignatures != null)
            this.addConstructSignatures(structure.constructSignatures);
        if (structure.properties != null)
            this.addProperties(structure.properties);
        if (structure.methods != null)
            this.addMethods(structure.methods);
        return this;
    }
    /**
     * Add construct signature.
     * @param structure - Structure representing the construct signature.
     */
    addConstructSignature(structure) {
        return this.addConstructSignatures([structure])[0];
    }
    /**
     * Add construct signatures.
     * @param structures - Structures representing the construct signatures.
     */
    addConstructSignatures(structures) {
        return this.insertConstructSignatures(manipulation_1.getEndIndexFromArray(this.compilerNode.members), structures);
    }
    /**
     * Insert construct signature.
     * @param index - Index to insert at.
     * @param structure - Structure representing the construct signature.
     */
    insertConstructSignature(index, structure) {
        return this.insertConstructSignatures(index, [structure])[0];
    }
    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the construct signatures.
     */
    insertConstructSignatures(index, structures) {
        const indentationText = this.getChildIndentationText();
        // create code
        const codes = [];
        for (const structure of structures) {
            let code = `${indentationText}new()`;
            if (structure.returnType != null && structure.returnType.length > 0)
                code += `: ${structure.returnType}`;
            code += ";";
            codes.push(code);
        }
        return manipulation_1.insertIntoBracesOrSourceFileWithFillAndGetChildren({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            expectedKind: ts.SyntaxKind.ConstructSignature,
            fillFunction: (node, structure) => node.fill(structure)
        });
    }
    /**
     * Gets the first construct signature by a find function.
     * @param findFunction - Function to find the construct signature by.
     */
    getConstructSignature(findFunction) {
        return this.getConstructSignatures().find(findFunction);
    }
    /**
     * Gets the interface method signatures.
     */
    getConstructSignatures() {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.ConstructSignature)
            .map(m => this.global.compilerFactory.getConstructSignatureDeclaration(m, this.sourceFile));
    }
    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure) {
        return this.addMethods([structure])[0];
    }
    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures) {
        return this.insertMethods(manipulation_1.getEndIndexFromArray(this.compilerNode.members), structures);
    }
    /**
     * Insert method.
     * @param index - Index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index, structure) {
        return this.insertMethods(index, [structure])[0];
    }
    /**
     * Insert methods.
     * @param index - Index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index, structures) {
        const indentationText = this.getChildIndentationText();
        // create code
        const codes = [];
        for (const structure of structures) {
            let code = indentationText;
            code += structure.name;
            if (structure.hasQuestionToken)
                code += "?";
            code += "()";
            if (structure.returnType != null && structure.returnType.length > 0)
                code += `: ${structure.returnType}`;
            code += ";";
            codes.push(code);
        }
        // insert, fill, and get created nodes
        return manipulation_1.insertIntoBracesOrSourceFileWithFillAndGetChildren({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            expectedKind: ts.SyntaxKind.MethodSignature,
            fillFunction: (node, structure) => node.fill(structure)
        });
    }
    getMethod(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getMethods(), nameOrFindFunction);
    }
    /**
     * Gets the interface method signatures.
     */
    getMethods() {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.MethodSignature)
            .map(m => this.global.compilerFactory.getMethodSignature(m, this.sourceFile));
    }
    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure) {
        return this.addProperties([structure])[0];
    }
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures) {
        return this.insertProperties(manipulation_1.getEndIndexFromArray(this.compilerNode.members), structures);
    }
    /**
     * Insert property.
     * @param index - Index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index, structure) {
        return this.insertProperties(index, [structure])[0];
    }
    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index, structures) {
        const indentationText = this.getChildIndentationText();
        // create code
        const codes = [];
        for (const structure of structures) {
            let code = `${indentationText}`;
            code += structure.name;
            if (structure.hasQuestionToken)
                code += "?";
            if (structure.type != null && structure.type.length > 0)
                code += `: ${structure.type}`;
            code += ";";
            codes.push(code);
        }
        return manipulation_1.insertIntoBracesOrSourceFileWithFillAndGetChildren({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            expectedKind: ts.SyntaxKind.PropertySignature,
            fillFunction: (node, structure) => node.fill(structure)
        });
    }
    getProperty(nameOrFindFunction) {
        return utils_1.getNamedNodeByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
    }
    /**
     * Gets the interface property signatures.
     */
    getProperties() {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.PropertySignature)
            .map(m => this.global.compilerFactory.getPropertySignature(m, this.sourceFile));
    }
    /**
     * Gets all members.
     */
    getAllMembers() {
        return this.compilerNode.members.map(m => this.global.compilerFactory.getNodeFromCompilerNode(m, this.sourceFile));
    }
}
exports.InterfaceDeclaration = InterfaceDeclaration;



},{"./../../manipulation":152,"./../../utils":179,"./../base":31,"./../callBaseFill":60,"./../common":70,"./../namespace":104,"typescript":"typescript"}],102:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
const function_1 = require("./../function");
exports.MethodSignatureBase = base_1.DocumentationableNode(base_1.QuestionTokenableNode(function_1.SignaturedDeclaration(base_1.PropertyNamedNode(common_1.Node))));
class MethodSignature extends exports.MethodSignatureBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.MethodSignatureBase.prototype, this, structure);
        return this;
    }
}
exports.MethodSignature = MethodSignature;



},{"./../base":31,"./../callBaseFill":60,"./../common":70,"./../function":91}],103:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
exports.PropertySignatureBase = base_1.DocumentationableNode(base_1.ReadonlyableNode(base_1.QuestionTokenableNode(base_1.InitializerExpressionableNode(base_1.TypedNode(base_1.PropertyNamedNode(base_1.ModifierableNode(common_1.Node)))))));
class PropertySignature extends exports.PropertySignatureBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.PropertySignatureBase.prototype, this, structure);
        return this;
    }
}
exports.PropertySignature = PropertySignature;



},{"./../base":31,"./../callBaseFill":60,"./../common":70}],104:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./namespace/NamespaceDeclaration"));
__export(require("./namespace/NamespaceChildableNode"));



},{"./namespace/NamespaceChildableNode":105,"./namespace/NamespaceDeclaration":106}],105:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
function NamespaceChildableNode(Base) {
    return class extends Base {
        getParentNamespace() {
            let parent = this.getParentOrThrow();
            if (parent.getKind() !== ts.SyntaxKind.ModuleBlock)
                return undefined;
            while (parent.getParentOrThrow().getKind() === ts.SyntaxKind.ModuleDeclaration)
                parent = parent.getParentOrThrow();
            return parent;
        }
    };
}
exports.NamespaceChildableNode = NamespaceChildableNode;



},{"typescript":"typescript"}],106:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../../errors");
const manipulation_1 = require("./../../manipulation");
const callBaseFill_1 = require("./../callBaseFill");
const utils_1 = require("./../../utils");
const common_1 = require("./../common");
const base_1 = require("./../base");
const statement_1 = require("./../statement");
const NamespaceChildableNode_1 = require("./NamespaceChildableNode");
exports.NamespaceDeclarationBase = NamespaceChildableNode_1.NamespaceChildableNode(statement_1.StatementedNode(base_1.DocumentationableNode(base_1.AmbientableNode(base_1.ExportableNode(base_1.ModifierableNode(base_1.BodiedNode(base_1.NamedNode(common_1.Node))))))));
class NamespaceDeclaration extends exports.NamespaceDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.NamespaceDeclarationBase.prototype, this, structure);
        if (structure.hasModuleKeyword != null)
            this.setHasModuleKeyword(structure.hasModuleKeyword);
        return this;
    }
    /**
     * Gets the full name of the namespace.
     */
    getName() {
        return this.getNameIdentifiers().map(n => n.getText()).join(".");
    }
    /**
     * Sets the name without renaming references.
     * @param newName - New full namespace name.
     */
    setName(newName) {
        const nameNodes = this.getNameIdentifiers();
        const openIssueText = `Please open an issue if you really need this and I'll up the priority.`;
        if (nameNodes.length > 1)
            throw new errors.NotImplementedError(`Not implemented to set a namespace name that uses dot notation. ${openIssueText}`);
        if (newName.indexOf(".") >= 0)
            throw new errors.NotImplementedError(`Not implemented to set a namespace name to a name containing a period. ${openIssueText}`);
        manipulation_1.replaceNodeText(this.sourceFile, nameNodes[0].getStart(), nameNodes[0].getEnd(), newName);
        return this;
    }
    /**
     * Renames the name.
     * @param newName - New name.
     */
    rename(newName) {
        const nameNodes = this.getNameIdentifiers();
        if (nameNodes.length > 1)
            throw new errors.NotSupportedError(`Cannot rename a namespace name that uses dot notation. Rename the individual nodes via .${"getNameIdentifiers"}()`);
        if (newName.indexOf(".") >= 0)
            throw new errors.NotSupportedError(`Cannot rename a namespace name to a name containing a period.`);
        nameNodes[0].rename(newName);
        return this;
    }
    /**
     * Gets the name identifiers.
     */
    getNameIdentifiers() {
        const nodes = [];
        let current = this;
        do {
            nodes.push(this.global.compilerFactory.getIdentifier(current.compilerNode.name, this.sourceFile));
            current = current.getFirstChildByKind(ts.SyntaxKind.ModuleDeclaration);
        } while (current != null);
        return nodes;
    }
    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasNamespaceKeyword() {
        return (this.compilerNode.flags & ts.NodeFlags.Namespace) === ts.NodeFlags.Namespace;
    }
    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasModuleKeyword() {
        return !this.hasNamespaceKeyword();
    }
    /**
     * Set if this namespace has a namespace keyword.
     * @param value - Whether to set it or not.
     */
    setHasNamespaceKeyword(value = true) {
        if (this.hasNamespaceKeyword() === value)
            return this;
        const declarationTypeKeyword = this.getDeclarationTypeKeyword();
        /* istanbul ignore if */
        if (declarationTypeKeyword == null) {
            utils_1.Logger.warn("The declaration type keyword of a namespace was undefined.");
            return this;
        }
        manipulation_1.replaceNodeText(this.getSourceFile(), declarationTypeKeyword.getStart(), declarationTypeKeyword.getEnd(), value ? "namespace" : "module");
        return this;
    }
    /**
     * Set if this namespace has a namepsace keyword.
     * @param value - Whether to set it or not.
     */
    setHasModuleKeyword(value = true) {
        return this.setHasNamespaceKeyword(!value);
    }
    /**
     * Gets the namespace or module keyword.
     */
    getDeclarationTypeKeyword() {
        return this.getFirstChild(child => child.getKind() === ts.SyntaxKind.NamespaceKeyword ||
            child.getKind() === ts.SyntaxKind.ModuleKeyword);
    }
}
exports.NamespaceDeclaration = NamespaceDeclaration;



},{"./../../errors":137,"./../../manipulation":152,"./../../utils":179,"./../base":31,"./../callBaseFill":60,"./../common":70,"./../statement":107,"./NamespaceChildableNode":105,"typescript":"typescript"}],107:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./statement/StatementedNode"));



},{"./statement/StatementedNode":108}],108:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const utils_1 = require("./../../utils");
const callBaseFill_1 = require("./../callBaseFill");
function StatementedNode(Base) {
    return class extends Base {
        /* Classes */
        addClass(structure) {
            return this.addClasses([structure])[0];
        }
        addClasses(structures) {
            return this.insertClasses(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }
        insertClass(index, structure) {
            return this.insertClasses(index, [structure])[0];
        }
        insertClasses(index, structures) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}class ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren(index, texts, structures, ts.SyntaxKind.ClassDeclaration, (child, i) => {
                child.fill(structures[i]);
            });
            return newChildren;
        }
        getClasses() {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ClassDeclaration);
        }
        getClass(nameOrFindFunction) {
            return utils_1.getNamedNodeByNameOrFindFunction(this.getClasses(), nameOrFindFunction);
        }
        /* Enums */
        addEnum(structure) {
            return this.addEnums([structure])[0];
        }
        addEnums(structures) {
            return this.insertEnums(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }
        insertEnum(index, structure) {
            return this.insertEnums(index, [structure])[0];
        }
        insertEnums(index, structures) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}${structure.isConst ? "const " : ""}enum ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren(index, texts, structures, ts.SyntaxKind.EnumDeclaration, (child, i) => {
                child.fill(structures[i]);
            });
            return newChildren;
        }
        getEnums() {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.EnumDeclaration);
        }
        getEnum(nameOrFindFunction) {
            return utils_1.getNamedNodeByNameOrFindFunction(this.getEnums(), nameOrFindFunction);
        }
        /* Functions */
        addFunction(structure) {
            return this.addFunctions([structure])[0];
        }
        addFunctions(structures) {
            return this.insertFunctions(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }
        insertFunction(index, structure) {
            return this.insertFunctions(index, [structure])[0];
        }
        insertFunctions(index, structures) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}function ${structure.name}() {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren(index, texts, structures, ts.SyntaxKind.FunctionDeclaration, (child, i) => {
                child.fill(structures[i]);
            });
            return newChildren;
        }
        getFunctions() {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.FunctionDeclaration)
                .filter(f => f.isAmbient() || f.isImplementation());
        }
        getFunction(nameOrFindFunction) {
            return utils_1.getNamedNodeByNameOrFindFunction(this.getFunctions(), nameOrFindFunction);
        }
        /* Interfaces */
        addInterface(structure) {
            return this.addInterfaces([structure])[0];
        }
        addInterfaces(structures) {
            return this.insertInterfaces(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }
        insertInterface(index, structure) {
            return this.insertInterfaces(index, [structure])[0];
        }
        insertInterfaces(index, structures) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}interface ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren(index, texts, structures, ts.SyntaxKind.InterfaceDeclaration, (child, i) => {
                child.fill(structures[i]);
            });
            return newChildren;
        }
        getInterfaces() {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.InterfaceDeclaration);
        }
        getInterface(nameOrFindFunction) {
            return utils_1.getNamedNodeByNameOrFindFunction(this.getInterfaces(), nameOrFindFunction);
        }
        /* Namespaces */
        addNamespace(structure) {
            return this.addNamespaces([structure])[0];
        }
        addNamespaces(structures) {
            return this.insertNamespaces(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }
        insertNamespace(index, structure) {
            return this.insertNamespaces(index, [structure])[0];
        }
        insertNamespaces(index, structures) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => {
                return `${indentationText}${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name} {${newLineChar}${indentationText}}`;
            });
            const newChildren = this._insertMainChildren(index, texts, structures, ts.SyntaxKind.ModuleDeclaration, (child, i) => {
                child.fill(structures[i]);
            });
            return newChildren;
        }
        getNamespaces() {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ModuleDeclaration);
        }
        getNamespace(nameOrFindFunction) {
            return utils_1.getNamedNodeByNameOrFindFunction(this.getNamespaces(), nameOrFindFunction);
        }
        /* Type aliases */
        addTypeAlias(structure) {
            return this.addTypeAliases([structure])[0];
        }
        addTypeAliases(structures) {
            return this.insertTypeAliases(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }
        insertTypeAlias(index, structure) {
            return this.insertTypeAliases(index, [structure])[0];
        }
        insertTypeAliases(index, structures) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => {
                return `${indentationText}type ${structure.name} = ${structure.type};`;
            });
            const newChildren = this._insertMainChildren(index, texts, structures, ts.SyntaxKind.TypeAliasDeclaration, (child, i) => {
                child.fill(structures[i]);
            }, {
                previousBlanklineWhen: previousMember => !previousMember.isTypeAliasDeclaration(),
                separatorNewlineWhen: () => false,
                nextBlanklineWhen: nextMember => !nextMember.isTypeAliasDeclaration()
            });
            return newChildren;
        }
        getTypeAliases() {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.TypeAliasDeclaration);
        }
        getTypeAlias(nameOrFindFunction) {
            return utils_1.getNamedNodeByNameOrFindFunction(this.getTypeAliases(), nameOrFindFunction);
        }
        getVariableStatements() {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.VariableStatement);
        }
        getVariableStatement(findFunction) {
            return this.getVariableStatements().find(findFunction);
        }
        getVariableDeclarationLists() {
            return this.getVariableStatements().map(s => s.getDeclarationList());
        }
        getVariableDeclarationList(findFunction) {
            return this.getVariableDeclarationLists().find(findFunction);
        }
        getVariableDeclarations() {
            const variables = [];
            for (const list of this.getVariableDeclarationLists()) {
                variables.push(...list.getDeclarations());
            }
            return variables;
        }
        getVariableDeclaration(nameOrFindFunction) {
            return utils_1.getNamedNodeByNameOrFindFunction(this.getVariableDeclarations(), nameOrFindFunction);
        }
        fill(structure) {
            callBaseFill_1.callBaseFill(Base.prototype, this, structure);
            if (structure.classes != null && structure.classes.length > 0)
                this.addClasses(structure.classes);
            if (structure.enums != null && structure.enums.length > 0)
                this.addEnums(structure.enums);
            if (structure.functions != null && structure.functions.length > 0)
                this.addFunctions(structure.functions);
            if (structure.interfaces != null && structure.interfaces.length > 0)
                this.addInterfaces(structure.interfaces);
            if (structure.namespaces != null && structure.namespaces.length > 0)
                this.addNamespaces(structure.namespaces);
            if (structure.typeAliases != null && structure.typeAliases.length > 0)
                this.addTypeAliases(structure.typeAliases);
            return this;
        }
        // todo: make this passed an object
        _insertMainChildren(index, childCodes, structures, expectedSyntaxKind, withEachChild, opts = {}) {
            const syntaxList = this.getChildSyntaxListOrThrow();
            const mainChildren = syntaxList.getChildren();
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            index = manipulation_1.verifyAndGetIndex(index, mainChildren.length);
            // insert into a temp file
            const finalChildCodes = [];
            for (let i = 0; i < childCodes.length; i++) {
                utils_1.using(this.global.compilerFactory.createTempSourceFileFromText(childCodes[i]), tempSourceFile => {
                    if (withEachChild != null) {
                        const tempSyntaxList = tempSourceFile.getChildSyntaxListOrThrow();
                        withEachChild(tempSyntaxList.getChildren()[0], i);
                    }
                    finalChildCodes.push(tempSourceFile.getFullText());
                });
            }
            // insert
            const doBlankLine = () => true;
            manipulation_1.insertIntoBracesOrSourceFile({
                parent: this,
                children: mainChildren,
                index,
                childCodes: finalChildCodes,
                structures,
                separator: newLineChar,
                previousBlanklineWhen: opts.previousBlanklineWhen || doBlankLine,
                separatorNewlineWhen: opts.separatorNewlineWhen || doBlankLine,
                nextBlanklineWhen: opts.nextBlanklineWhen || doBlankLine
            });
            this.appendNewLineSeparatorIfNecessary();
            // get children
            return manipulation_1.getRangeFromArray(syntaxList.getChildren(), index, childCodes.length, expectedSyntaxKind);
        }
    };
}
exports.StatementedNode = StatementedNode;



},{"./../../manipulation":152,"./../../utils":179,"./../callBaseFill":60,"typescript":"typescript"}],109:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./tools/results"));
__export(require("./tools/LanguageService"));
__export(require("./tools/Program"));
__export(require("./tools/TypeChecker"));



},{"./tools/LanguageService":110,"./tools/Program":111,"./tools/TypeChecker":112,"./tools/results":113}],110:[function(require,module,exports){
(function (process){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const manipulation_1 = require("./../../manipulation");
const errors = require("./../../errors");
const utils_1 = require("./../../utils");
const Program_1 = require("./Program");
const results_1 = require("./results");
class LanguageService {
    /** @internal */
    constructor(global) {
        this.sourceFiles = [];
        this.global = global;
        // I don't know what I'm doing for some of this...
        let version = 0;
        const fileExists = (path) => this.global.compilerFactory.containsSourceFileAtPath(path) || global.fileSystem.fileExists(path);
        const languageServiceHost = {
            getCompilationSettings: () => global.compilerOptions,
            getNewLine: () => global.manipulationSettings.getNewLineKind(),
            getScriptFileNames: () => this.sourceFiles.map(s => s.getFilePath()),
            getScriptVersion: fileName => {
                return (version++).toString();
            },
            getScriptSnapshot: fileName => {
                if (!fileExists(fileName))
                    return undefined;
                return ts.ScriptSnapshot.fromString(this.global.compilerFactory.getSourceFileFromFilePath(fileName).getFullText());
            },
            getCurrentDirectory: () => global.fileSystem.getCurrentDirectory(),
            getDefaultLibFileName: options => ts.getDefaultLibFilePath(global.compilerOptions),
            useCaseSensitiveFileNames: () => true,
            readFile: (path, encoding) => {
                if (this.global.compilerFactory.containsSourceFileAtPath(path))
                    return this.global.compilerFactory.getSourceFileFromFilePath(path).getFullText();
                return this.global.fileSystem.readFile(path, encoding);
            },
            fileExists,
            directoryExists: dirName => this.global.compilerFactory.containsFileInDirectory(dirName) || this.global.fileSystem.directoryExists(dirName)
        };
        this.compilerHost = {
            getSourceFile: (fileName, languageVersion, onError) => {
                return this.global.compilerFactory.getSourceFileFromFilePath(fileName).compilerNode;
            },
            // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
            // getDefaultLibLocation: (...) => {},
            getDefaultLibFileName: (options) => languageServiceHost.getDefaultLibFileName(options),
            writeFile: (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
                this.global.fileSystem.writeFileSync(fileName, data);
            },
            getCurrentDirectory: () => languageServiceHost.getCurrentDirectory(),
            getDirectories: (path) => {
                console.log("ATTEMPT TO GET DIRECTORIES");
                return [];
            },
            fileExists: (fileName) => languageServiceHost.fileExists(fileName),
            readFile: (fileName) => languageServiceHost.readFile(fileName),
            getCanonicalFileName: (fileName) => utils_1.FileUtils.getStandardizedAbsolutePath(fileName),
            useCaseSensitiveFileNames: () => languageServiceHost.useCaseSensitiveFileNames(),
            getNewLine: () => languageServiceHost.getNewLine(),
            getEnvironmentVariable: (name) => process.env[name]
        };
        this._compilerObject = ts.createLanguageService(languageServiceHost);
    }
    /**
     * Gets the compiler language service.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Resets the program. This should be done whenever any modifications happen.
     * @internal
     */
    resetProgram() {
        if (this.program != null)
            this.program.reset(this.getSourceFiles().map(s => s.getFilePath()), this.compilerHost);
    }
    /**
     * Gets the language service's program.
     */
    getProgram() {
        if (this.program == null)
            this.program = new Program_1.Program(this.global, this.getSourceFiles().map(s => s.getFilePath()), this.compilerHost);
        return this.program;
    }
    renameNode(node, newName) {
        errors.throwIfNotStringOrWhitespace(newName, "newName");
        if (node.getText() === newName)
            return;
        this.renameLocations(this.findRenameLocations(node), newName);
    }
    renameLocations(renameLocations, newName) {
        const renameLocationsBySourceFile = new utils_1.KeyValueCache();
        for (const renameLocation of renameLocations) {
            const locations = renameLocationsBySourceFile.getOrCreate(renameLocation.getSourceFile(), () => []);
            locations.push(renameLocation);
        }
        for (const [sourceFile, locations] of renameLocationsBySourceFile.getEntries()) {
            let difference = 0;
            for (const textSpan of locations.map(l => l.getTextSpan())) {
                let start = textSpan.getStart();
                start -= difference;
                manipulation_1.replaceNodeText(sourceFile, start, start + textSpan.getLength(), newName);
                difference += textSpan.getLength() - newName.length;
            }
        }
    }
    findReferences(sourceFile, posOrNode) {
        const pos = typeof posOrNode === "number" ? posOrNode : posOrNode.getStart();
        const results = this.compilerObject.findReferences(sourceFile.getFilePath(), pos) || [];
        return results.map(s => new results_1.ReferencedSymbol(this.global, s));
    }
    findRenameLocations(node) {
        const sourceFile = node.getSourceFile();
        const renameLocations = this.compilerObject.findRenameLocations(sourceFile.getFilePath(), node.getStart(), false, false) || [];
        return renameLocations.map(l => new results_1.RenameLocation(this.global, l));
    }
    addSourceFile(sourceFile) {
        // todo: these source files should be strictly stored in the factory cache
        this.sourceFiles.push(sourceFile);
        this.resetProgram();
    }
    removeSourceFile(sourceFile) {
        const index = this.sourceFiles.indexOf(sourceFile);
        if (index === -1)
            return false;
        this.sourceFiles.splice(index, 1);
        this.resetProgram();
        sourceFile.dispose(); // todo: don't dispose, just remove the language service for this node
        return true;
    }
    getSourceFiles() {
        return this.sourceFiles;
    }
}
exports.LanguageService = LanguageService;



}).call(this,require('_process'))
},{"./../../errors":137,"./../../manipulation":152,"./../../utils":179,"./Program":111,"./results":113,"_process":25,"typescript":"typescript"}],111:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const TypeChecker_1 = require("./TypeChecker");
const results_1 = require("./results");
/**
 * Wrapper around Program.
 */
class Program {
    /** @internal */
    constructor(global, rootNames, host) {
        this.global = global;
        this.typeChecker = new TypeChecker_1.TypeChecker(this.global);
        this.reset(rootNames, host);
    }
    /**
     * Gets the underlying compiler program.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Resets the program.
     * @internal
     */
    reset(rootNames, host) {
        this._compilerObject = ts.createProgram(rootNames, this.global.compilerOptions, host, this._compilerObject);
        this.typeChecker.reset(this._compilerObject.getTypeChecker());
    }
    /**
     * Get the program's type checker.
     */
    getTypeChecker() {
        return this.typeChecker;
    }
    /**
     * Emits the TypeScript files to the specified target.
     */
    emit(options = {}) {
        const targetSourceFile = options != null && options.targetSourceFile != null ? options.targetSourceFile.compilerNode : undefined;
        const cancellationToken = undefined; // todo: expose this
        const emitOnlyDtsFiles = options != null && options.emitOnlyDtsFiles != null ? options.emitOnlyDtsFiles : undefined;
        const customTransformers = undefined; // todo: expose this
        const emitResult = this.compilerObject.emit(targetSourceFile, undefined, cancellationToken, emitOnlyDtsFiles, customTransformers);
        return new results_1.EmitResult(this.global, emitResult);
    }
}
exports.Program = Program;



},{"./TypeChecker":112,"./results":113,"typescript":"typescript"}],112:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
/**
 * Wrapper around the TypeChecker.
 */
class TypeChecker {
    /** @internal */
    constructor(global) {
        this.global = global;
    }
    /**
     * Gets the compiler's TypeChecker.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Resets the type checker.
     * @internal
     */
    reset(typeChecker) {
        this._compilerObject = typeChecker;
    }
    /**
     * Gets the apparent type of a type.
     * @param type - Type to get the apparent type of.
     */
    getApparentType(type) {
        return this.global.compilerFactory.getType(this.compilerObject.getApparentType(type.compilerType));
    }
    /**
     * Gets the constant value of a declaration.
     * @param node - Node to get the constant value from.
     */
    getConstantValue(node) {
        return this.compilerObject.getConstantValue(node.compilerNode);
    }
    /**
     * Gets the fully qualified name of a symbol.
     * @param symbol - Symbol to get the fully qualified name of.
     */
    getFullyQualifiedName(symbol) {
        return this.compilerObject.getFullyQualifiedName(symbol.compilerSymbol);
    }
    /**
     * Gets the type at the specified location.
     * @param node - Node to get the type for.
     */
    getTypeAtLocation(node) {
        return this.global.compilerFactory.getType(this.compilerObject.getTypeAtLocation(node.compilerNode));
    }
    /**
     * Gets the contextual type of an expression.
     * @param expression - Expression.
     */
    getContextualType(expression) {
        const contextualType = this.compilerObject.getContextualType(expression.compilerNode);
        return contextualType == null ? undefined : this.global.compilerFactory.getType(contextualType);
    }
    /**
     * Gets the type of a symbol at the specified location.
     * @param symbol - Symbol to get the type for.
     * @param node - Location to get the type for.
     */
    getTypeOfSymbolAtLocation(symbol, node) {
        return this.global.compilerFactory.getType(this.compilerObject.getTypeOfSymbolAtLocation(symbol.compilerSymbol, node.compilerNode));
    }
    /**
     * Gets the declared type of a symbol.
     * @param symbol - Symbol to get the type for.
     */
    getDeclaredTypeOfSymbol(symbol) {
        return this.global.compilerFactory.getType(this.compilerObject.getDeclaredTypeOfSymbol(symbol.compilerSymbol));
    }
    /**
     * Gets the symbol at the specified location or undefined if none exists.
     * @param node - Node to get the symbol for.
     */
    getSymbolAtLocation(node) {
        const compilerSymbol = this.compilerObject.getSymbolAtLocation(node.compilerNode);
        return compilerSymbol == null ? undefined : this.global.compilerFactory.getSymbol(compilerSymbol);
    }
    /**
     * Gets the aliased symbol of a symbol.
     * @param symbol - Symbol to get the alias symbol of.
     */
    getAliasedSymbol(symbol) {
        if (!symbol.hasFlags(ts.SymbolFlags.Alias))
            return undefined;
        const tsAliasSymbol = this.compilerObject.getAliasedSymbol(symbol.compilerSymbol);
        return tsAliasSymbol == null ? undefined : this.global.compilerFactory.getSymbol(tsAliasSymbol);
    }
    /**
     * Gets the properties of a type.
     * @param type - Type.
     */
    getPropertiesOfType(type) {
        return this.compilerObject.getPropertiesOfType(type.compilerType).map(p => this.global.compilerFactory.getSymbol(p));
    }
    /**
     * Gets the type text
     * @param type - Type to get the text of.
     * @param enclosingNode - Enclosing node.
     * @param typeFormatFlags - Type format flags.
     */
    getTypeText(type, enclosingNode, typeFormatFlags) {
        if (typeFormatFlags == null)
            typeFormatFlags = this.getDefaultTypeFormatFlags(enclosingNode);
        const compilerNode = enclosingNode == null ? undefined : enclosingNode.compilerNode;
        return this.compilerObject.typeToString(type.compilerType, compilerNode, typeFormatFlags);
    }
    /**
     * Gets the return type of a signature.
     * @param signature - Signature to get the return type of.
     */
    getReturnTypeOfSignature(signature) {
        return this.global.compilerFactory.getType(this.compilerObject.getReturnTypeOfSignature(signature.compilerSignature));
    }
    /**
     * Gets a signature from a node.
     * @param node - Node to get the signature from.
     */
    getSignatureFromNode(node) {
        const signature = this.compilerObject.getSignatureFromDeclaration(node.compilerNode);
        return signature == null ? undefined : this.global.compilerFactory.getSignature(signature);
    }
    getDefaultTypeFormatFlags(enclosingNode) {
        let formatFlags = (ts.TypeFormatFlags.UseTypeOfFunction | ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType |
            ts.TypeFormatFlags.WriteTypeArgumentsOfSignature);
        if (enclosingNode != null && enclosingNode.getKind() === ts.SyntaxKind.TypeAliasDeclaration)
            formatFlags |= ts.TypeFormatFlags.InTypeAlias;
        return formatFlags;
    }
}
exports.TypeChecker = TypeChecker;



},{"typescript":"typescript"}],113:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./results/DefinitionInfo"));
__export(require("./results/Diagnostic"));
__export(require("./results/DiagnosticMessageChain"));
__export(require("./results/DocumentSpan"));
__export(require("./results/EmitResult"));
__export(require("./results/ReferencedSymbol"));
__export(require("./results/ReferencedSymbolDefinitionInfo"));
__export(require("./results/ReferenceEntry"));
__export(require("./results/RenameLocation"));
__export(require("./results/SymbolDisplayPart"));
__export(require("./results/TextSpan"));



},{"./results/DefinitionInfo":114,"./results/Diagnostic":115,"./results/DiagnosticMessageChain":116,"./results/DocumentSpan":117,"./results/EmitResult":118,"./results/ReferenceEntry":119,"./results/ReferencedSymbol":120,"./results/ReferencedSymbolDefinitionInfo":121,"./results/RenameLocation":122,"./results/SymbolDisplayPart":123,"./results/TextSpan":124}],114:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../../utils");
const TextSpan_1 = require("./TextSpan");
/**
 * Definition info.
 */
class DefinitionInfo {
    /**
     * @internal
     */
    constructor(global, compilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
    }
    /**
     * Gets the compiler object.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Gets the source file this reference is in.
     */
    getSourceFile() {
        return this.global.compilerFactory.getSourceFileFromFilePath(this.compilerObject.fileName);
    }
    /**
     * Gets the text span.
     */
    getTextSpan() {
        return new TextSpan_1.TextSpan(this.compilerObject.textSpan);
    }
    /**
     * Gets the kind.
     */
    getKind() {
        return this.compilerObject.kind;
    }
    /**
     * Gets the name.
     */
    getName() {
        return this.compilerObject.name;
    }
    /**
     * Gets the container kind.
     */
    getContainerKind() {
        return this.compilerObject.containerKind;
    }
    /**
     * Gets the container name.
     */
    getContainerName() {
        return this.compilerObject.containerName;
    }
}
__decorate([
    utils_1.Memoize
], DefinitionInfo.prototype, "getTextSpan", null);
exports.DefinitionInfo = DefinitionInfo;



},{"./../../../utils":179,"./TextSpan":124}],115:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Diagnostic.
 */
class Diagnostic {
    /** @internal */
    constructor(global, compilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
    }
    /**
     * Gets the underlying compiler diagnostic.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Gets the source file.
     */
    getSourceFile() {
        const file = this.compilerObject.file;
        return file == null ? undefined : this.global.compilerFactory.getSourceFile(file);
    }
    /**
     * Gets the message text.
     */
    getMessageText() {
        const messageText = this._compilerObject.messageText;
        if (typeof messageText === "string")
            return messageText;
        return this.global.compilerFactory.getDiagnosticMessageChain(messageText);
    }
    /**
     * Gets the start.
     */
    getStart() {
        return this.compilerObject.start;
    }
    /**
     * Gets the length.
     */
    getLength() {
        return this.compilerObject.length;
    }
    /**
     * Gets the diagnostic category.
     */
    getCategory() {
        return this.compilerObject.category;
    }
    /**
     * Gets the code of the diagnostic.
     */
    getCode() {
        return this.compilerObject.code;
    }
    /**
     * Gets the source.
     */
    getSource() {
        return this.compilerObject.source;
    }
}
exports.Diagnostic = Diagnostic;



},{}],116:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Diagnostic message chain.
 */
class DiagnosticMessageChain {
    /** @internal */
    constructor(global, compilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
    }
    /**
     * Gets the underlying compiler object.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Gets the message text.
     */
    getMessageText() {
        return this.compilerObject.messageText;
    }
    /**
     * Gets th enext diagnostic message chain in the chain.
     */
    getNext() {
        const next = this.compilerObject.next;
        if (next == null)
            return undefined;
        return this.global.compilerFactory.getDiagnosticMessageChain(next);
    }
    /**
     * Gets the code of the diagnostic message chain.
     */
    getCode() {
        return this.compilerObject.code;
    }
    /**
     * Gets the category of the diagnostic message chain.
     */
    getCategory() {
        return this.compilerObject.category;
    }
}
exports.DiagnosticMessageChain = DiagnosticMessageChain;



},{}],117:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../../utils");
const TextSpan_1 = require("./TextSpan");
/**
 * Document span.
 */
class DocumentSpan {
    /**
     * @internal
     */
    constructor(global, compilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
        // store this node so that it's start doesn't go out of date because of manipulation (though the text span may)
        this.node = this.getSourceFile().getDescendantAtPos(this.getTextSpan().getStart());
    }
    /**
     * Gets the compiler object.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Gets the source file this reference is in.
     */
    getSourceFile() {
        return this.global.compilerFactory.getSourceFileFromFilePath(this.compilerObject.fileName);
    }
    /**
     * Gets the text span.
     */
    getTextSpan() {
        return new TextSpan_1.TextSpan(this.compilerObject.textSpan);
    }
    /**
     * Gets the node at the start of the text span.
     */
    getNode() {
        return this.node;
    }
}
__decorate([
    utils_1.Memoize
], DocumentSpan.prototype, "getTextSpan", null);
exports.DocumentSpan = DocumentSpan;



},{"./../../../utils":179,"./TextSpan":124}],118:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Diagnostic_1 = require("./Diagnostic");
const utils_1 = require("./../../../utils");
/**
 * Result of an emit.
 */
class EmitResult {
    /**
     * @internal
     */
    constructor(global, compilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
    }
    /**
     * TypeScript compiler emit result.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * If the emit was skipped.
     */
    getEmitSkipped() {
        return this.compilerObject.emitSkipped;
    }
    /**
     * Contains declaration emit diagnostics.
     */
    getDiagnostics() {
        return this.compilerObject.diagnostics.map(d => new Diagnostic_1.Diagnostic(this.global, d));
    }
}
__decorate([
    utils_1.Memoize
], EmitResult.prototype, "getDiagnostics", null);
exports.EmitResult = EmitResult;



},{"./../../../utils":179,"./Diagnostic":115}],119:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DocumentSpan_1 = require("./DocumentSpan");
class ReferenceEntry extends DocumentSpan_1.DocumentSpan {
    /**
     * @internal
     */
    constructor(global, compilerObject) {
        super(global, compilerObject);
    }
    getIsWriteAccess() {
        // todo: not sure what this does
        return this.compilerObject.isWriteAccess;
    }
    /**
     * If this is the definition reference.
     */
    getIsDefinition() {
        return this.compilerObject.isDefinition;
    }
    getIsInString() {
        // todo: not sure what this does and why it can be undefined
        return this.compilerObject.isInString;
    }
}
exports.ReferenceEntry = ReferenceEntry;



},{"./DocumentSpan":117}],120:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../../utils");
const ReferenceEntry_1 = require("./ReferenceEntry");
const ReferencedSymbolDefinitionInfo_1 = require("./ReferencedSymbolDefinitionInfo");
/**
 * Referenced symbol.
 */
class ReferencedSymbol {
    /**
     * @internal
     */
    constructor(global, compilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
        // it's important to store the references so that the nodes referenced inside will point
        // to the right node in case the user does manipulation between getting this object and getting the references
        this.references = this.compilerObject.references.map(r => new ReferenceEntry_1.ReferenceEntry(global, r));
    }
    /**
     * Gets the compiler referenced symbol.
     */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Gets the definition.
     */
    getDefinition() {
        return new ReferencedSymbolDefinitionInfo_1.ReferencedSymbolDefinitionInfo(this.global, this.compilerObject.definition);
    }
    /**
     * Gets the references.
     */
    getReferences() {
        return this.references;
    }
}
__decorate([
    utils_1.Memoize
], ReferencedSymbol.prototype, "getDefinition", null);
exports.ReferencedSymbol = ReferencedSymbol;



},{"./../../../utils":179,"./ReferenceEntry":119,"./ReferencedSymbolDefinitionInfo":121}],121:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../../utils");
const DefinitionInfo_1 = require("./DefinitionInfo");
const SymbolDisplayPart_1 = require("./SymbolDisplayPart");
class ReferencedSymbolDefinitionInfo extends DefinitionInfo_1.DefinitionInfo {
    /**
     * @internal
     */
    constructor(global, compilerObject) {
        super(global, compilerObject);
    }
    /**
     * Gets the display parts.
     */
    getDisplayParts() {
        return this.compilerObject.displayParts.map(p => new SymbolDisplayPart_1.SymbolDisplayPart(p));
    }
}
__decorate([
    utils_1.Memoize
], ReferencedSymbolDefinitionInfo.prototype, "getDisplayParts", null);
exports.ReferencedSymbolDefinitionInfo = ReferencedSymbolDefinitionInfo;



},{"./../../../utils":179,"./DefinitionInfo":114,"./SymbolDisplayPart":123}],122:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DocumentSpan_1 = require("./DocumentSpan");
/**
 * Rename location.
 */
class RenameLocation extends DocumentSpan_1.DocumentSpan {
}
exports.RenameLocation = RenameLocation;



},{"./DocumentSpan":117}],123:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Symbol display part.
 */
class SymbolDisplayPart {
    /** @internal */
    constructor(compilerObject) {
        this._compilerObject = compilerObject;
    }
    /** Gets the compiler text span. */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Gets the text.
     */
    getText() {
        return this.compilerObject.text;
    }
    /**
     * Gets the kind.
     */
    getKind() {
        return this.compilerObject.kind;
    }
}
exports.SymbolDisplayPart = SymbolDisplayPart;



},{}],124:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a span of text.
 */
class TextSpan {
    /** @internal */
    constructor(compilerObject) {
        this._compilerObject = compilerObject;
    }
    /** Gets the compiler text span. */
    get compilerObject() {
        return this._compilerObject;
    }
    /**
     * Gets the start.
     */
    getStart() {
        return this.compilerObject.start;
    }
    /**
     * Gets the length.
     */
    getLength() {
        return this.compilerObject.length;
    }
}
exports.TextSpan = TextSpan;



},{}],125:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./type/Type"));
__export(require("./type/TypeNode"));
__export(require("./type/TypeAliasDeclaration"));
__export(require("./type/TypeParameterDeclaration"));
__export(require("./type/ExpressionWithTypeArguments"));



},{"./type/ExpressionWithTypeArguments":126,"./type/Type":127,"./type/TypeAliasDeclaration":128,"./type/TypeNode":129,"./type/TypeParameterDeclaration":130}],126:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeNode_1 = require("./TypeNode");
class ExpressionWithTypeArguments extends TypeNode_1.TypeNode {
    /**
     * Gets the expression node.
     */
    getExpression() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile);
    }
    /**
     * Gets the type arguments.
     */
    getTypeArguments() {
        const typeArguments = this.compilerNode.typeArguments;
        if (typeArguments == null)
            return [];
        return typeArguments.map(a => this.global.compilerFactory.getTypeNode(a, this.sourceFile));
    }
}
exports.ExpressionWithTypeArguments = ExpressionWithTypeArguments;



},{"./TypeNode":129}],127:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const utils_1 = require("./../../utils");
class Type {
    /**
     * Initializes a new instance of Type.
     * @internal
     * @param global - Global container.
     * @param type - Compiler type.
     */
    constructor(global, type) {
        this.global = global;
        this._compilerType = type;
    }
    /**
     * Gets the underlying compiler type.
     */
    get compilerType() {
        return this._compilerType;
    }
    /**
     * Gets the type text.
     * @param enclosingNode - The enclosing node.
     * @param typeFormatFlags - Format flags for the type text.
     */
    getText(enclosingNode, typeFormatFlags) {
        return this.global.typeChecker.getTypeText(this, enclosingNode, typeFormatFlags);
    }
    /**
     * Gets the alias symbol if it exists.
     */
    getAliasSymbol() {
        return this.compilerType.aliasSymbol == null ? undefined : this.global.compilerFactory.getSymbol(this.compilerType.aliasSymbol);
    }
    /**
     * Gets the alias type arguments.
     */
    getAliasTypeArguments() {
        const aliasTypeArgs = this.compilerType.aliasTypeArguments || [];
        return aliasTypeArgs.map(t => this.global.compilerFactory.getType(t));
    }
    /**
     * Gets the apparent type.
     */
    getApparentType() {
        return this.global.typeChecker.getApparentType(this);
    }
    /**
     * Gets the base types.
     */
    getBaseTypes() {
        const baseTypes = this.compilerType.getBaseTypes() || [];
        return baseTypes.map(t => this.global.compilerFactory.getType(t));
    }
    /**
     * Gets the call signatures.
     */
    getCallSignatures() {
        return this.compilerType.getCallSignatures().map(s => this.global.compilerFactory.getSignature(s));
    }
    /**
     * Gets the construct signatures.
     */
    getConstructSignatures() {
        return this.compilerType.getConstructSignatures().map(s => this.global.compilerFactory.getSignature(s));
    }
    /**
     * Gets the properties of the type.
     */
    getProperties() {
        return this.compilerType.getProperties().map(s => this.global.compilerFactory.getSymbol(s));
    }
    getProperty(nameOrFindFunction) {
        return utils_1.getSymbolByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
    }
    /**
     * Gets the apparent properties of the type.
     */
    getApparentProperties() {
        return this.compilerType.getApparentProperties().map(s => this.global.compilerFactory.getSymbol(s));
    }
    getApparentProperty(nameOrFindFunction) {
        return utils_1.getSymbolByNameOrFindFunction(this.getApparentProperties(), nameOrFindFunction);
    }
    /**
     * Gets the non-nullable type.
     */
    getNonNullableType() {
        return this.global.compilerFactory.getType(this.compilerType.getNonNullableType());
    }
    /**
     * Gets the number index type.
     */
    getNumberIndexType() {
        const numberIndexType = this.compilerType.getNumberIndexType();
        return numberIndexType == null ? undefined : this.global.compilerFactory.getType(numberIndexType);
    }
    /**
     * Gets the string index type.
     */
    getStringIndexType() {
        const stringIndexType = this.compilerType.getStringIndexType();
        return stringIndexType == null ? undefined : this.global.compilerFactory.getType(stringIndexType);
    }
    /**
     * Gets the union types.
     */
    getUnionTypes() {
        if (!this.isUnionType())
            return [];
        return this.compilerType.types.map(t => this.global.compilerFactory.getType(t));
    }
    /**
     * Gets the intersection types.
     */
    getIntersectionTypes() {
        if (!this.isIntersectionType())
            return [];
        return this.compilerType.types.map(t => this.global.compilerFactory.getType(t));
    }
    /**
     * Gets the symbol of the type.
     */
    getSymbol() {
        const tsSymbol = this.compilerType.getSymbol();
        return tsSymbol == null ? undefined : this.global.compilerFactory.getSymbol(tsSymbol);
    }
    /**
     * Gets if this is an anonymous type.
     */
    isAnonymousType() {
        return (this.getObjectFlags() & ts.ObjectFlags.Anonymous) !== 0;
    }
    /**
     * Gets if this is a boolean type.
     */
    isBooleanType() {
        return (this.compilerType.flags & ts.TypeFlags.Boolean) !== 0;
    }
    /**
     * Gets if this is an enum type.
     */
    isEnumType() {
        return (this.compilerType.flags & ts.TypeFlags.Enum) !== 0;
    }
    /**
     * Gets if this is an interface type.
     */
    isInterfaceType() {
        return (this.getObjectFlags() & ts.ObjectFlags.Interface) !== 0;
    }
    /**
     * Gets if this is an intersection type.
     */
    isIntersectionType() {
        return (this.compilerType.flags & ts.TypeFlags.Intersection) !== 0;
    }
    /**
     * Gets if this is an object type.
     */
    isObjectType() {
        return (this.compilerType.flags & ts.TypeFlags.Object) !== 0;
    }
    /**
     * Gets if this is a union type.
     */
    isUnionType() {
        return (this.compilerType.flags & ts.TypeFlags.Union) !== 0;
    }
    /**
     * Gets the type flags.
     */
    getFlags() {
        return this.compilerType.flags;
    }
    /**
     * Gets the object flags.
     */
    getObjectFlags() {
        if (!this.isObjectType())
            return 0;
        return this.compilerType.objectFlags || 0;
    }
}
exports.Type = Type;



},{"./../../utils":179,"typescript":"typescript"}],128:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callBaseFill_1 = require("./../callBaseFill");
const common_1 = require("./../common");
const base_1 = require("./../base");
// todo: type node should not be able to return undefined
exports.TypeAliasDeclarationBase = base_1.TypeParameteredNode(base_1.TypedNode(base_1.DocumentationableNode(base_1.AmbientableNode(base_1.ExportableNode(base_1.ModifierableNode(base_1.NamedNode(common_1.Node)))))));
class TypeAliasDeclaration extends exports.TypeAliasDeclarationBase {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure) {
        callBaseFill_1.callBaseFill(exports.TypeAliasDeclarationBase.prototype, this, structure);
        return this;
    }
}
exports.TypeAliasDeclaration = TypeAliasDeclaration;



},{"./../base":31,"./../callBaseFill":60,"./../common":70}],129:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./../common");
class TypeNode extends common_1.Node {
}
exports.TypeNode = TypeNode;



},{"./../common":70}],130:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./../base");
const common_1 = require("./../common");
exports.TypeParameterDeclarationBase = base_1.NamedNode(common_1.Node);
class TypeParameterDeclaration extends exports.TypeParameterDeclarationBase {
    /**
     * Gets the constraint node.
     */
    getConstraintNode() {
        return this.compilerNode.constraint == null ? undefined : this.global.compilerFactory.getTypeNode(this.compilerNode.constraint, this.sourceFile);
    }
}
exports.TypeParameterDeclaration = TypeParameterDeclaration;



},{"./../base":31,"./../common":70}],131:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./variable/VariableDeclarationList"));
__export(require("./variable/VariableDeclaration"));
__export(require("./variable/VariableStatement"));
__export(require("./variable/VariableDeclarationType"));



},{"./variable/VariableDeclaration":132,"./variable/VariableDeclarationList":133,"./variable/VariableDeclarationType":134,"./variable/VariableStatement":135}],132:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./../common");
const base_1 = require("./../base");
exports.VariableDeclarationBase = base_1.TypedNode(base_1.InitializerExpressionableNode(base_1.BindingNamedNode(common_1.Node)));
class VariableDeclaration extends exports.VariableDeclarationBase {
}
exports.VariableDeclaration = VariableDeclaration;



},{"./../base":31,"./../common":70}],133:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const common_1 = require("./../common");
const VariableDeclarationType_1 = require("./VariableDeclarationType");
class VariableDeclarationList extends common_1.Node {
    /**
     * Get the variable declarations.
     */
    getDeclarations() {
        return this.compilerNode.declarations.map(d => this.global.compilerFactory.getVariableDeclaration(d, this.sourceFile));
    }
    /**
     * Gets the variable declaration type.
     */
    getDeclarationType() {
        const nodeFlags = this.compilerNode.flags;
        if (nodeFlags & ts.NodeFlags.Let)
            return VariableDeclarationType_1.VariableDeclarationType.Let;
        else if (nodeFlags & ts.NodeFlags.Const)
            return VariableDeclarationType_1.VariableDeclarationType.Const;
        else
            return VariableDeclarationType_1.VariableDeclarationType.Var;
    }
}
exports.VariableDeclarationList = VariableDeclarationList;



},{"./../common":70,"./VariableDeclarationType":134,"typescript":"typescript"}],134:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VariableDeclarationType;
(function (VariableDeclarationType) {
    VariableDeclarationType["Var"] = "var";
    VariableDeclarationType["Let"] = "let";
    VariableDeclarationType["Const"] = "const";
})(/* istanbul ignore next */VariableDeclarationType = exports.VariableDeclarationType || (exports.VariableDeclarationType = {}));



},{}],135:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./../common");
const base_1 = require("./../base");
const namespace_1 = require("./../namespace");
exports.VariableStatementBase = namespace_1.NamespaceChildableNode(base_1.DocumentationableNode(base_1.AmbientableNode(base_1.ExportableNode(base_1.ModifierableNode(common_1.Node)))));
class VariableStatement extends exports.VariableStatementBase {
    /**
     * Gets the declaration list of variables.
     */
    getDeclarationList() {
        return this.global.compilerFactory.getVariableDeclarationList(this.compilerNode.declarationList, this.sourceFile);
    }
}
exports.VariableStatement = VariableStatement;



},{"./../base":31,"./../common":70,"./../namespace":104}],136:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./errors");
const compiler_1 = require("./compiler");
const GlobalContainer_1 = require("./GlobalContainer");
const DefaultFileSystemHost_1 = require("./DefaultFileSystemHost");
/**
 * Creates a wrapped node from a compiler node.
 * @param node - Node to create a wrapped node from.
 * @param sourceFile - Optional source file of the node to help improve performance.
 */
function createWrappedNode(node, sourceFile) {
    let wrappedSourceFile;
    if (sourceFile == null)
        wrappedSourceFile = getSourceFileFromNode(node);
    else if (sourceFile instanceof compiler_1.SourceFile)
        wrappedSourceFile = sourceFile;
    else
        wrappedSourceFile = getWrappedSourceFile(sourceFile);
    return wrappedSourceFile.global.compilerFactory.getNodeFromCompilerNode(node, wrappedSourceFile);
}
exports.createWrappedNode = createWrappedNode;
function getSourceFileFromNode(node) {
    if (node.kind === ts.SyntaxKind.SourceFile)
        return getWrappedSourceFile(node);
    if (node.parent == null)
        throw new errors.InvalidOperationError("Please ensure the node was created from a source file with 'setParentNodes' set to 'true'.");
    let parent = node;
    while (parent.parent != null)
        parent = parent.parent;
    if (parent.kind !== ts.SyntaxKind.SourceFile)
        throw new errors.NotImplementedError("For some reason the top parent was not a source file.");
    return getWrappedSourceFile(parent);
}
function getWrappedSourceFile(sourceFile) {
    return getGlobalContainer().compilerFactory.getSourceFile(sourceFile);
}
function getGlobalContainer() {
    return new GlobalContainer_1.GlobalContainer(new DefaultFileSystemHost_1.DefaultFileSystemHost(), {}, false);
}



},{"./DefaultFileSystemHost":26,"./GlobalContainer":27,"./compiler":30,"./errors":137,"typescript":"typescript"}],137:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./errors/BaseError"));
__export(require("./errors/ArgumentError"));
__export(require("./errors/ArgumentNullOrWhitespaceError"));
__export(require("./errors/ArgumentTypeError"));
__export(require("./errors/DirectoryNotFoundError"));
__export(require("./errors/FileNotFoundError"));
__export(require("./errors/NotSupportedError"));
__export(require("./errors/helpers"));
__export(require("./errors/InvalidOperationError"));
__export(require("./errors/NotImplementedError"));



},{"./errors/ArgumentError":138,"./errors/ArgumentNullOrWhitespaceError":139,"./errors/ArgumentTypeError":141,"./errors/BaseError":142,"./errors/DirectoryNotFoundError":143,"./errors/FileNotFoundError":144,"./errors/InvalidOperationError":145,"./errors/NotImplementedError":146,"./errors/NotSupportedError":147,"./errors/helpers":148}],138:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class ArgumentError extends BaseError_1.BaseError {
    constructor(argName, message) {
        super(`Argument Error (${argName}): ${message}`);
        this.argName = argName;
    }
}
exports.ArgumentError = ArgumentError;



},{"./BaseError":142}],139:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class ArgumentNullOrWhitespaceError extends BaseError_1.BaseError {
    constructor(argName) {
        super(`Argument '${argName}' was null or whitespace.`);
        this.argName = argName;
    }
}
exports.ArgumentNullOrWhitespaceError = ArgumentNullOrWhitespaceError;



},{"./BaseError":142}],140:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class ArgumentOutOfRangeError extends BaseError_1.BaseError {
    constructor(argName, value, range) {
        super(`Argument Error (${argName}): Range is ${range[0]} to ${range[1]}, but ${value} was provided.`);
        this.argName = argName;
    }
}
exports.ArgumentOutOfRangeError = ArgumentOutOfRangeError;



},{"./BaseError":142}],141:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class ArgumentTypeError extends BaseError_1.BaseError {
    constructor(argName, expectedType, actualType) {
        super(`Argument '${argName}' expects type '${expectedType}', but was '${actualType}'.`);
        this.argName = argName;
        this.expectedType = expectedType;
        this.actualType = actualType;
    }
}
exports.ArgumentTypeError = ArgumentTypeError;



},{"./BaseError":142}],142:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.BaseError = BaseError;



},{}],143:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class DirectoryNotFoundError extends BaseError_1.BaseError {
    constructor(dirPath) {
        super(`Directory not found: ${dirPath}`);
        this.dirPath = dirPath;
    }
}
exports.DirectoryNotFoundError = DirectoryNotFoundError;



},{"./BaseError":142}],144:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class FileNotFoundError extends BaseError_1.BaseError {
    constructor(filePath) {
        super(`File not found: ${filePath}`);
        this.filePath = filePath;
    }
}
exports.FileNotFoundError = FileNotFoundError;



},{"./BaseError":142}],145:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class InvalidOperationError extends BaseError_1.BaseError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.InvalidOperationError = InvalidOperationError;



},{"./BaseError":142}],146:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class NotImplementedError extends BaseError_1.BaseError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.NotImplementedError = NotImplementedError;



},{"./BaseError":142}],147:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
class NotSupportedError extends BaseError_1.BaseError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.NotSupportedError = NotSupportedError;



},{"./BaseError":142}],148:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const ArgumentTypeError_1 = require("./ArgumentTypeError");
const ArgumentNullOrWhitespaceError_1 = require("./ArgumentNullOrWhitespaceError");
const ArgumentOutOfRangeError_1 = require("./ArgumentOutOfRangeError");
const NotImplementedError_1 = require("./NotImplementedError");
/**
 * Thows if not a type.
 * @param value - Value to check the type of.
 * @param expectedType - Expected type.
 * @param argName - Argument name.
 */
function throwIfNotType(value, expectedType, argName) {
    if (typeof value !== expectedType)
        throw new ArgumentTypeError_1.ArgumentTypeError(argName, expectedType, typeof value);
}
exports.throwIfNotType = throwIfNotType;
/**
 * Throws if the value is not a string or is whitespace.
 * @param value - Value to check.
 * @param argName - Arg name.
 */
function throwIfNotStringOrWhitespace(value, argName) {
    if (typeof value !== "string")
        throw new ArgumentTypeError_1.ArgumentTypeError(argName, "string", typeof value);
    if (value.trim().length === 0)
        throw new ArgumentNullOrWhitespaceError_1.ArgumentNullOrWhitespaceError(argName);
}
exports.throwIfNotStringOrWhitespace = throwIfNotStringOrWhitespace;
/**
 * Throws a NotImplementedError if a node doesn't match the expected syntax kind.
 * @param node - Node.
 * @param syntaxKind - Syntax kind that's expected.
 * @param message - Optional message to throw.
 */
function throwIfNotSyntaxKind(node, syntaxKind, message) {
    if (node.getKind() !== syntaxKind)
        throw new NotImplementedError_1.NotImplementedError(message || `Expected node to be syntax kind ${ts.SyntaxKind[syntaxKind]}, but was ${node.getKindName()}.`);
}
exports.throwIfNotSyntaxKind = throwIfNotSyntaxKind;
/**
 * Throws an ArgumentOutOfRangeError if an argument's value is out of a range.
 * @param value - Value.
 * @param range - Range.
 * @param argName - Argument name.
 */
function throwIfOutOfRange(value, range, argName, messageRange) {
    messageRange = messageRange || range;
    if (value < range[0] || value > range[1])
        throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError(argName, value, messageRange);
}
exports.throwIfOutOfRange = throwIfOutOfRange;
/**
 * Gets an error saying that a feature is not implemented for a certain syntax kind.
 * @param syntaxKind - Syntax kind that isn't implemented.
 */
function getNotImplementedForSyntaxKindError(syntaxKind) {
    return new NotImplementedError_1.NotImplementedError(`Not implemented feature for syntax kind '${ts.SyntaxKind[syntaxKind]}'.`);
}
exports.getNotImplementedForSyntaxKindError = getNotImplementedForSyntaxKindError;



},{"./ArgumentNullOrWhitespaceError":139,"./ArgumentOutOfRangeError":140,"./ArgumentTypeError":141,"./NotImplementedError":146,"typescript":"typescript"}],149:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./factories/CompilerFactory"));



},{"./factories/CompilerFactory":150}],150:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const compiler = require("./../compiler");
const errors = require("./../errors");
const utils_1 = require("./../utils");
/**
 * Factory for creating compiler wrappers.
 * @internal
 */
class CompilerFactory {
    /**
     * Initializes a new instance of CompilerFactory.
     * @param global - Global container.
     */
    constructor(global) {
        this.global = global;
        this.sourceFileCacheByFilePath = new utils_1.KeyValueCache();
        this.normalizedDirectories = new Set();
        this.nodeCache = new utils_1.KeyValueCache();
        this.sourceFileAddedEventContainer = new utils_1.EventContainer();
    }
    /**
     * Occurs when a source file is added to the cache.
     * @param subscription - Subscripton.
     */
    onSourceFileAdded(subscription) {
        this.sourceFileAddedEventContainer.subscribe(subscription);
    }
    /**
     * Creates a source file from a file path and text.
     * Adds it to the cache.
     * @param filePath - File path for the source file.
     * @param sourceText - Text to create the source file with.
     */
    addSourceFileFromText(filePath, sourceText) {
        const absoluteFilePath = utils_1.FileUtils.getStandardizedAbsolutePath(filePath);
        if (this.containsSourceFileAtPath(absoluteFilePath))
            throw new errors.InvalidOperationError(`A source file already exists at the provided file path: ${absoluteFilePath}`);
        const compilerSourceFile = ts.createSourceFile(absoluteFilePath, sourceText, this.global.manipulationSettings.getScriptTarget(), true);
        return this.getSourceFile(compilerSourceFile);
    }
    /**
     * Creates a temporary source file that won't be added to the language service.
     * @param sourceText - Text to create the source file with.
     * @param filePath - File path to use.
     * @returns Wrapped source file.
     */
    createTempSourceFileFromText(sourceText, filePath = "tsSimpleAstTempFile.ts") {
        const compilerSourceFile = ts.createSourceFile(filePath, sourceText, this.global.manipulationSettings.getScriptTarget(), true);
        const sourceFile = new compiler.SourceFile(this.global, compilerSourceFile);
        this.nodeCache.set(compilerSourceFile, sourceFile);
        return sourceFile;
    }
    /**
     * Gets a source file from a file path. Will use the file path cache if the file exists.
     * @param filePath - File path to get the file from.
     */
    getSourceFileFromFilePath(filePath) {
        const absoluteFilePath = utils_1.FileUtils.getStandardizedAbsolutePath(filePath);
        let sourceFile = this.sourceFileCacheByFilePath.get(absoluteFilePath);
        if (sourceFile == null) {
            if (this.global.fileSystem.fileExists(absoluteFilePath)) {
                utils_1.Logger.log(`Loading file: ${absoluteFilePath}`);
                sourceFile = this.addSourceFileFromText(absoluteFilePath, this.global.fileSystem.readFile(absoluteFilePath));
                sourceFile.setIsSaved(true); // source files loaded from the disk are saved to start with
            }
            if (sourceFile != null) {
                // ensure these are added to the ast
                sourceFile.getReferencedFiles();
                sourceFile.getTypeReferenceDirectives();
            }
        }
        return sourceFile;
    }
    /**
     * Gets if the internal cache contains a source file at a specific file path.
     * @param filePath - File path to check.
     */
    containsSourceFileAtPath(filePath) {
        const absoluteFilePath = utils_1.FileUtils.getStandardizedAbsolutePath(filePath);
        return this.sourceFileCacheByFilePath.get(absoluteFilePath) != null;
    }
    /**
     * Gets if the internal cache contains a source file with the specified directory path.
     * @param dirPath - Directory path to check.
     */
    containsFileInDirectory(dirPath) {
        const normalizedDirPath = utils_1.FileUtils.getStandardizedAbsolutePath(dirPath);
        return this.normalizedDirectories.has(normalizedDirPath);
    }
    /**
     * Gets the source file for a node.
     * @param compilerNode - Compiler node to get the source file of.
     */
    getSourceFileForNode(compilerNode) {
        let currentNode = compilerNode;
        while (currentNode.kind !== ts.SyntaxKind.SourceFile) {
            if (currentNode.parent == null)
                throw new errors.NotImplementedError("Could not find node source file.");
            currentNode = currentNode.parent;
        }
        return this.getSourceFile(currentNode);
    }
    /**
     * Gets a wrapped compiler type based on the node's kind.
     * For example, an enum declaration will be returned a wrapped enum declaration.
     * @param node - Node to get the wrapped object from.
     */
    getNodeFromCompilerNode(compilerNode, sourceFile) {
        switch (compilerNode.kind) {
            case ts.SyntaxKind.SourceFile:
                return this.getSourceFile(compilerNode);
            case ts.SyntaxKind.ClassDeclaration:
                return this.getClassDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.Constructor:
                return this.getConstructorDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.ConstructSignature:
                return this.getConstructSignatureDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.Decorator:
                return this.getDecorator(compilerNode, sourceFile);
            case ts.SyntaxKind.EnumDeclaration:
                return this.getEnumDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.EnumMember:
                return this.getEnumMember(compilerNode, sourceFile);
            case ts.SyntaxKind.ExportDeclaration:
                return this.getExportDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.ExportSpecifier:
                return this.getExportSpecifier(compilerNode, sourceFile);
            case ts.SyntaxKind.ExpressionWithTypeArguments:
                return this.getExpressionWithTypeArguments(compilerNode, sourceFile);
            case ts.SyntaxKind.FunctionDeclaration:
                return this.getFunctionDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.GetAccessor:
                return this.getGetAccessorDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.HeritageClause:
                return this.getHeritageClause(compilerNode, sourceFile);
            case ts.SyntaxKind.Identifier:
                return this.getIdentifier(compilerNode, sourceFile);
            case ts.SyntaxKind.ImportDeclaration:
                return this.getImportDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.ImportSpecifier:
                return this.getImportSpecifier(compilerNode, sourceFile);
            case ts.SyntaxKind.InterfaceDeclaration:
                return this.getInterfaceDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.MethodDeclaration:
                return this.getMethodDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.MethodSignature:
                return this.getMethodSignature(compilerNode, sourceFile);
            case ts.SyntaxKind.ModuleDeclaration:
                return this.getNamespaceDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.NumericLiteral:
                return this.getExpression(compilerNode, sourceFile);
            case ts.SyntaxKind.Parameter:
                return this.getParameterDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.PropertyDeclaration:
                return this.getPropertyDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.PropertySignature:
                return this.getPropertySignature(compilerNode, sourceFile);
            case ts.SyntaxKind.SetAccessor:
                return this.getSetAccessorDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.TypeAliasDeclaration:
                return this.getTypeAliasDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.TypeParameter:
                return this.getTypeParameterDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.VariableDeclaration:
                return this.getVariableDeclaration(compilerNode, sourceFile);
            case ts.SyntaxKind.VariableDeclarationList:
                return this.getVariableDeclarationList(compilerNode, sourceFile);
            case ts.SyntaxKind.VariableStatement:
                return this.getVariableStatement(compilerNode, sourceFile);
            case ts.SyntaxKind.JSDocComment:
                return this.getJSDoc(compilerNode, sourceFile);
            default:
                return this.nodeCache.getOrCreate(compilerNode, () => new compiler.Node(this.global, compilerNode, sourceFile));
        }
    }
    /**
     * Gets a wrapped class declaration from a compiler object.
     * @param classDeclaration - Class declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getClassDeclaration(classDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(classDeclaration, () => new compiler.ClassDeclaration(this.global, classDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped class constructor declaration from a compiler object.
     * @param constructorDeclaration - Constructor declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getConstructorDeclaration(constructorDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(constructorDeclaration, () => new compiler.ConstructorDeclaration(this.global, constructorDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped construct signature declaration from a compiler object.
     * @param constructSignature - Construct signature compiler object.
     * @param sourceFile - Source file for the node.
     */
    getConstructSignatureDeclaration(constructSignature, sourceFile) {
        return this.nodeCache.getOrCreate(constructSignature, () => new compiler.ConstructSignatureDeclaration(this.global, constructSignature, sourceFile));
    }
    /**
     * Gets a wrapped decorator from a compiler object.
     * @param decorator - Decorator compiler object.
     * @param sourceFile - Source file for the node.
     */
    getDecorator(decorator, sourceFile) {
        return this.nodeCache.getOrCreate(decorator, () => new compiler.Decorator(this.global, decorator, sourceFile));
    }
    /**
     * Gets a wrapped enum declaration from a compiler object.
     * @param enumDeclaration - Enum declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getEnumDeclaration(enumDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(enumDeclaration, () => new compiler.EnumDeclaration(this.global, enumDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped enum member declaration from a compiler object.
     * @param enumMemberDeclaration - Enum member declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getEnumMember(enumMemberDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(enumMemberDeclaration, () => new compiler.EnumMember(this.global, enumMemberDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped export declaration from a compiler object.
     * @param declaration - Export declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getExportDeclaration(declaration, sourceFile) {
        return this.nodeCache.getOrCreate(declaration, () => new compiler.ExportDeclaration(this.global, declaration, sourceFile));
    }
    /**
     * Gets a wrapped export specifier from a compiler object.
     * @param specifier - Export specifier compiler object.
     * @param sourceFile - Source file for the node.
     */
    getExportSpecifier(specifier, sourceFile) {
        return this.nodeCache.getOrCreate(specifier, () => new compiler.ExportSpecifier(this.global, specifier, sourceFile));
    }
    /**
     * Gets an expression with type arguments from a compiler object.
     * @param expressionWithTypeArguments - Expression with type arguments compiler object.
     * @param sourceFile - Source file for the node.
     */
    getExpressionWithTypeArguments(node, sourceFile) {
        return this.nodeCache.getOrCreate(node, () => new compiler.ExpressionWithTypeArguments(this.global, node, sourceFile));
    }
    /**
     * Gets a wrapped function declaration from a compiler object.
     * @param functionDeclaration - Function declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getFunctionDeclaration(functionDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(functionDeclaration, () => new compiler.FunctionDeclaration(this.global, functionDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped get accessor declaration from a compiler object.
     * @param propertySignature - Get accessor declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getGetAccessorDeclaration(getAccessor, sourceFile) {
        return this.nodeCache.getOrCreate(getAccessor, () => new compiler.GetAccessorDeclaration(this.global, getAccessor, sourceFile));
    }
    /**
     * Gets a wrapped heritage clause from a compiler object.
     * @param heritageClause - Heritage clause compiler object.
     * @param sourceFile - Source file for the node.
     */
    getHeritageClause(heritageClause, sourceFile) {
        return this.nodeCache.getOrCreate(heritageClause, () => new compiler.HeritageClause(this.global, heritageClause, sourceFile));
    }
    /**
     * Gets a wrapped interface declaration from a compiler object.
     * @param interfaceDeclaration - Interface declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getInterfaceDeclaration(interfaceDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(interfaceDeclaration, () => new compiler.InterfaceDeclaration(this.global, interfaceDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped class method declaration from a compiler object.
     * @param methodDeclaration - Method declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getMethodDeclaration(methodDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(methodDeclaration, () => new compiler.MethodDeclaration(this.global, methodDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped method signature from a compiler object.
     * @param methodSignature - Method signature compiler object.
     * @param sourceFile - Source file for the node.
     */
    getMethodSignature(methodSignature, sourceFile) {
        return this.nodeCache.getOrCreate(methodSignature, () => new compiler.MethodSignature(this.global, methodSignature, sourceFile));
    }
    /**
     * Gets a wrapped namespace declaration from a compiler object.
     * @param namespaceDeclaration - Namespace declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getNamespaceDeclaration(namespaceDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(namespaceDeclaration, () => new compiler.NamespaceDeclaration(this.global, namespaceDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped parameter declaration from a compiler object.
     * @param parameterDeclaration - Parameter declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getParameterDeclaration(parameterDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(parameterDeclaration, () => new compiler.ParameterDeclaration(this.global, parameterDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped class property declaration from a compiler object.
     * @param propertyDeclaration - Property declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getPropertyDeclaration(propertyDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(propertyDeclaration, () => new compiler.PropertyDeclaration(this.global, propertyDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped property signature from a compiler object.
     * @param propertySignature - Property signature compiler object.
     * @param sourceFile - Source file for the node.
     */
    getPropertySignature(propertySignature, sourceFile) {
        return this.nodeCache.getOrCreate(propertySignature, () => new compiler.PropertySignature(this.global, propertySignature, sourceFile));
    }
    /**
     * Gets a wrapped set accessor declaration from a compiler object.
     * @param propertySignature - Get accessor declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getSetAccessorDeclaration(setAccessor, sourceFile) {
        return this.nodeCache.getOrCreate(setAccessor, () => new compiler.SetAccessorDeclaration(this.global, setAccessor, sourceFile));
    }
    /**
     * Gets a wrapped type alias declaration from a compiler object.
     * @param typeAliasDeclaration - TypeAlias declaration compiler object.
     * @param sourceFile - Source file for the node.
     */
    getTypeAliasDeclaration(typeAliasDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(typeAliasDeclaration, () => new compiler.TypeAliasDeclaration(this.global, typeAliasDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped variable declaration list from a compiler object.
     * @param declarationList - Compiler variable declaration list.
     * @param sourceFile - Source file for the node.
     */
    getVariableDeclarationList(declarationList, sourceFile) {
        return this.nodeCache.getOrCreate(declarationList, () => new compiler.VariableDeclarationList(this.global, declarationList, sourceFile));
    }
    /**
     * Gets a wrapped variable statement from a compiler object.
     * @param variableStatement - Compiler variable statement.
     * @param sourceFile - Source file for the node.
     */
    getVariableStatement(statement, sourceFile) {
        return this.nodeCache.getOrCreate(statement, () => new compiler.VariableStatement(this.global, statement, sourceFile));
    }
    /**
     * Gets a wrapped variable declaration from a compiler object.
     * @param declaration - Compiler variable declaration.
     * @param sourceFile - Source file for the node.
     */
    getVariableDeclaration(declaration, sourceFile) {
        return this.nodeCache.getOrCreate(declaration, () => new compiler.VariableDeclaration(this.global, declaration, sourceFile));
    }
    /**
     * Gets a wrapped JS doc declaration from a compiler object.
     * @param declaration - Compiler JS doc declaration.
     * @param sourceFile - Source file for the node.
     */
    getJSDoc(declaration, sourceFile) {
        return this.nodeCache.getOrCreate(declaration, () => new compiler.JSDoc(this.global, declaration, sourceFile));
    }
    /**
     * Gets a wrapped source file from a compiler source file.
     * @param sourceFile - Compiler source file.
     */
    getSourceFile(compilerSourceFile) {
        return this.nodeCache.getOrCreate(compilerSourceFile, () => {
            const sourceFile = new compiler.SourceFile(this.global, compilerSourceFile);
            this.sourceFileCacheByFilePath.set(sourceFile.getFilePath(), sourceFile);
            // add to list of directories
            const normalizedDir = utils_1.FileUtils.getStandardizedAbsolutePath(utils_1.FileUtils.getDirName(sourceFile.getFilePath()));
            if (!this.normalizedDirectories.has(normalizedDir))
                this.normalizedDirectories.add(normalizedDir);
            // fire the event
            this.sourceFileAddedEventContainer.fire({
                addedSourceFile: sourceFile
            });
            return sourceFile;
        });
    }
    /**
     * Gets a wrapped identifier from a compiler identifier.
     * @param identifier - Compiler identifier.
     * @param sourceFile - Source file for the node.
     */
    getIdentifier(identifier, sourceFile) {
        return this.nodeCache.getOrCreate(identifier, () => new compiler.Identifier(this.global, identifier, sourceFile));
    }
    /**
     * Gets a wrapped import declaration from a compiler import declaration.
     * @param importDeclaration - Compiler import declaration.
     * @param sourceFile - Source file for the node.
     */
    getImportDeclaration(importDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(importDeclaration, () => new compiler.ImportDeclaration(this.global, importDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped import specifier from a compiler import specifier.
     * @param importSpecifier - Compiler import specifier.
     * @param sourceFile - Source file for the node.
     */
    getImportSpecifier(importSpecifier, sourceFile) {
        return this.nodeCache.getOrCreate(importSpecifier, () => new compiler.ImportSpecifier(this.global, importSpecifier, sourceFile));
    }
    /**
     * Gets a wrapped expression from a compiler expression.
     * @param expression - Compiler expression.
     * @param sourceFile - Source file for the node.
     */
    getExpression(expression, sourceFile) {
        return this.nodeCache.getOrCreate(expression, () => new compiler.Expression(this.global, expression, sourceFile));
    }
    /**
     * Gets a wrapped type node from a compiler type node.
     * @param typeNode - Compiler type node.
     * @param sourceFile - Source file for the node.
     */
    getTypeNode(typeNode, sourceFile) {
        return this.nodeCache.getOrCreate(typeNode, () => new compiler.TypeNode(this.global, typeNode, sourceFile));
    }
    /**
     * Gets a wrapped type parameter declaration from a compiler type parameter declaration.
     * @param typeParameterDeclaration - Compiler type parameter declaration.
     * @param sourceFile - Source file for the node.
     */
    getTypeParameterDeclaration(typeParameterDeclaration, sourceFile) {
        return this.nodeCache.getOrCreate(typeParameterDeclaration, () => new compiler.TypeParameterDeclaration(this.global, typeParameterDeclaration, sourceFile));
    }
    /**
     * Gets a wrapped type from a compiler type.
     * @param type - Compiler type.
     */
    getType(type) {
        return new compiler.Type(this.global, type);
    }
    /**
     * Gets a wrapped signature from a compiler signature.
     * @param signature - Compiler signature.
     */
    getSignature(signature) {
        return new compiler.Signature(this.global, signature);
    }
    /**
     * Gets a wrapped symbol from a compiler symbol.
     * @param symbol - Compiler symbol.
     */
    getSymbol(symbol) {
        return new compiler.Symbol(this.global, symbol);
    }
    /**
     * Gets a wrapped diagnostic from a compiler diagnostic.
     * @param diagnostic - Compiler diagnostic.
     */
    getDiagnostic(diagnostic) {
        return new compiler.Diagnostic(this.global, diagnostic);
    }
    /**
     * Gets a wrapped diagnostic message chain from a compiler diagnostic message chain.
     * @param diagnostic - Compiler diagnostic message chain.
     */
    getDiagnosticMessageChain(diagnosticMessageChain) {
        return new compiler.DiagnosticMessageChain(this.global, diagnosticMessageChain);
    }
    /**
     * Replaces a compiler node in the cache.
     * @param oldNode - Old node to remove.
     * @param newNode - New node to use.
     */
    replaceCompilerNode(oldNode, newNode) {
        const nodeToReplace = oldNode instanceof compiler.Node ? oldNode.compilerNode : oldNode;
        const node = oldNode instanceof compiler.Node ? oldNode : this.nodeCache.get(oldNode);
        this.nodeCache.replaceKey(nodeToReplace, newNode);
        if (node != null)
            node.replaceCompilerNode(newNode);
    }
    /**
     * Removes a node from the cache.
     * @param node - Node to remove.
     */
    removeNodeFromCache(node) {
        const compilerNode = node.compilerNode;
        this.nodeCache.removeByKey(compilerNode);
        if (compilerNode.kind === ts.SyntaxKind.SourceFile) {
            const sourceFile = compilerNode;
            this.sourceFileCacheByFilePath.removeByKey(sourceFile.fileName);
        }
    }
}
exports.CompilerFactory = CompilerFactory;



},{"./../compiler":30,"./../errors":137,"./../utils":179,"typescript":"typescript"}],151:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./compiler"));
var TsSimpleAst_1 = require("./TsSimpleAst");
exports.default = TsSimpleAst_1.TsSimpleAst;
__export(require("./ManipulationSettings"));
var createWrappedNode_1 = require("./createWrappedNode");
exports.createWrappedNode = createWrappedNode_1.createWrappedNode;



},{"./ManipulationSettings":28,"./TsSimpleAst":29,"./compiler":30,"./createWrappedNode":136}],152:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./manipulation/fillAndGetChildren"));
__export(require("./manipulation/getNodeOrNodesToReturn"));
__export(require("./manipulation/getEndIndexFromArray"));
__export(require("./manipulation/getRangeFromArray"));
__export(require("./manipulation/insertIntoCommaSeparatedNodes"));
__export(require("./manipulation/insertIntoSyntaxList"));
__export(require("./manipulation/insertCreatingSyntaxList"));
__export(require("./manipulation/insertIntoBracesOrSourceFile"));
__export(require("./manipulation/insertIntoBracesOrSourceFileWithFillAndGetChildren"));
__export(require("./manipulation/insertStraight"));
__export(require("./manipulation/replaceStraight"));
__export(require("./manipulation/removeNodes"));
__export(require("./manipulation/removeFromBracesOrSourceFile"));
__export(require("./manipulation/replaceNodeText"));
__export(require("./manipulation/verifyAndGetIndex"));



},{"./manipulation/fillAndGetChildren":154,"./manipulation/getEndIndexFromArray":155,"./manipulation/getNodeOrNodesToReturn":158,"./manipulation/getRangeFromArray":159,"./manipulation/insertCreatingSyntaxList":161,"./manipulation/insertIntoBracesOrSourceFile":162,"./manipulation/insertIntoBracesOrSourceFileWithFillAndGetChildren":163,"./manipulation/insertIntoCommaSeparatedNodes":164,"./manipulation/insertIntoSyntaxList":165,"./manipulation/insertStraight":166,"./manipulation/removeFromBracesOrSourceFile":167,"./manipulation/removeNodes":168,"./manipulation/replaceNodeText":169,"./manipulation/replaceStraight":170,"./manipulation/verifyAndGetIndex":178}],153:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function areNodesEqual(a, b) {
    if (a == null && b == null)
        return true;
    if (a == null || b == null)
        return false;
    if (a.getPos() === b.getPos() && a.getKind() === b.getKind())
        return true;
    return false;
}
exports.areNodesEqual = areNodesEqual;



},{}],154:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getRangeFromArray_1 = require("./getRangeFromArray");
function fillAndGetChildren(opts) {
    const children = getRangeFromArray_1.getRangeFromArray(opts.allChildren, opts.index, opts.structures.length, opts.expectedKind);
    if (opts.fillFunction != null) {
        for (let i = 0; i < children.length; i++) {
            opts.fillFunction(children[i], opts.structures[i]);
        }
    }
    return children;
}
exports.fillAndGetChildren = fillAndGetChildren;



},{"./getRangeFromArray":159}],155:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Gets the end index from a possibly undefined array.
 * @param array - Array that could possibly be undefined.
 */
function getEndIndexFromArray(array) {
    return array == null ? 0 : array.length;
}
exports.getEndIndexFromArray = getEndIndexFromArray;



},{}],156:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* istanbul ignore next */
function getInsertErrorMessageText(preText, currentNode, newNode) {
    let text = `${preText} Perhaps a syntax error was inserted (Current: ${currentNode.getKindName()} -- New: ${newNode.getKindName()}).\n\nCode:\n`;
    const sourceFileText = newNode.getSourceFile().getFullText();
    const startPos = sourceFileText.lastIndexOf("\n", newNode.getPos()) + 1;
    let endPos = sourceFileText.indexOf("\n", newNode.getEnd());
    if (endPos === -1)
        endPos = sourceFileText.length;
    text += sourceFileText.substring(startPos, endPos);
    return text;
}
exports.getInsertErrorMessageText = getInsertErrorMessageText;



},{}],157:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fromAbstractableNode(node) {
    return {
        isAbstract: node.getIsAbstract()
    };
}
exports.fromAbstractableNode = fromAbstractableNode;
function fromAmbientableNode(node) {
    return {
        hasDeclareKeyword: node.hasDeclareKeyword()
    };
}
exports.fromAmbientableNode = fromAmbientableNode;
function fromAsyncableNode(node) {
    return {
        isAsync: node.isAsync()
    };
}
exports.fromAsyncableNode = fromAsyncableNode;
function fromExportableNode(node) {
    return {
        isDefaultExport: node.hasDefaultKeyword(),
        isExported: node.hasExportKeyword()
    };
}
exports.fromExportableNode = fromExportableNode;
function fromGeneratorableNode(node) {
    return {
        isGenerator: node.isGenerator()
    };
}
exports.fromGeneratorableNode = fromGeneratorableNode;
function fromReturnTypedNode(node) {
    const returnTypeNode = node.getReturnTypeNode();
    return {
        returnType: returnTypeNode == null ? undefined : returnTypeNode.getText()
    };
}
exports.fromReturnTypedNode = fromReturnTypedNode;
function fromStaticableNode(node) {
    return {
        isStatic: node.isStatic()
    };
}
exports.fromStaticableNode = fromStaticableNode;
function fromScopeableNode(node) {
    return {
        scope: node.getScope()
    };
}
exports.fromScopeableNode = fromScopeableNode;
function fromScopedNode(node) {
    return {
        scope: node.hasScopeKeyword() ? node.getScope() : undefined
    };
}
exports.fromScopedNode = fromScopedNode;
function fromExtendsClauseableNode(node) {
    const exts = node.getExtends();
    return {
        extends: exts.length === 0 ? undefined : exts.map(e => e.getText())
    };
}
exports.fromExtendsClauseableNode = fromExtendsClauseableNode;
function fromImplementsClauseableNode(node) {
    const implementsNodes = node.getImplements();
    return {
        implements: implementsNodes.length === 0 ? undefined : implementsNodes.map(e => e.getText())
    };
}
exports.fromImplementsClauseableNode = fromImplementsClauseableNode;
function fromQuestionTokenableNode(node) {
    return {
        hasQuestionToken: node.hasQuestionToken()
    };
}
exports.fromQuestionTokenableNode = fromQuestionTokenableNode;
function fromReadonlyableNode(node) {
    return {
        isReadonly: node.isReadonly()
    };
}
exports.fromReadonlyableNode = fromReadonlyableNode;
function fromTypedNode(node) {
    const typeNode = node.getTypeNode();
    return {
        type: typeNode == null ? undefined : typeNode.getText()
    };
}
exports.fromTypedNode = fromTypedNode;
function fromInitializerExpressionableNode(node) {
    const initializer = node.getInitializer();
    return {
        initializer: initializer == null ? undefined : initializer.getText()
    };
}
exports.fromInitializerExpressionableNode = fromInitializerExpressionableNode;
function fromNamedNode(node) {
    return {
        name: node.getName()
    };
}
exports.fromNamedNode = fromNamedNode;



},{}],158:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getNodeOrNodesToReturn(nodes, index, length) {
    return length > 0 ? nodes.slice(index, index + length) : nodes[index];
}
exports.getNodeOrNodesToReturn = getNodeOrNodesToReturn;



},{}],159:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../errors");
function getRangeFromArray(array, index, length, expectedKind) {
    const children = array.slice(index, index + length);
    if (children.length !== length)
        throw new errors.NotImplementedError(`Unexpected! Inserted ${length} child/children, but ${children.length} were inserted.`);
    for (const child of children) {
        if (child.getKind() !== expectedKind)
            throw new errors.NotImplementedError(`Unexpected! Inserting syntax kind of ${ts.SyntaxKind[expectedKind]}` +
                `, but ${child.getKindName()} was inserted.`);
    }
    return children;
}
exports.getRangeFromArray = getRangeFromArray;



},{"./../errors":137,"typescript":"typescript"}],160:[function(require,module,exports){
"use strict";
/* tslint:disable */
// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate
Object.defineProperty(exports, "__esModule", { value: true });
const getMixinStructureFuncs = require("./getMixinStructureFunctions");
function fromConstructorDeclarationOverload(node) {
    let structure = {};
    Object.assign(structure, getMixinStructureFuncs.fromScopedNode(node));
    return structure;
}
exports.fromConstructorDeclarationOverload = fromConstructorDeclarationOverload;
function fromMethodDeclarationOverload(node) {
    let structure = {};
    Object.assign(structure, getMixinStructureFuncs.fromStaticableNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromAbstractableNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromScopedNode(node));
    return structure;
}
exports.fromMethodDeclarationOverload = fromMethodDeclarationOverload;
function fromFunctionDeclarationOverload(node) {
    let structure = {};
    Object.assign(structure, getMixinStructureFuncs.fromAmbientableNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromExportableNode(node));
    return structure;
}
exports.fromFunctionDeclarationOverload = fromFunctionDeclarationOverload;



},{"./getMixinStructureFunctions":157}],161:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replaceTree_1 = require("./replaceTree");
function insertCreatingSyntaxList(opts) {
    const { parent, insertPos, newText } = opts;
    const sourceFile = parent.getSourceFile();
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    replaceTree_1.replaceTreeCreatingSyntaxList({
        parent,
        replacementSourceFile: tempSourceFile
    });
}
exports.insertCreatingSyntaxList = insertCreatingSyntaxList;



},{"./replaceTree":171}],162:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const insertIntoSyntaxList_1 = require("./insertIntoSyntaxList");
const textChecks_1 = require("./textChecks");
/**
 * Used to insert non-comma separated nodes into braces or a source file.
 */
function insertIntoBracesOrSourceFile(opts) {
    const { parent, index, childCodes, separator, children } = opts;
    const sourceFile = parent.getSourceFile();
    const insertPos = getInsertPosition(index, parent, children);
    const newLineChar = sourceFile.global.manipulationSettings.getNewLineKind();
    let newText = "";
    for (let i = 0; i < childCodes.length; i++) {
        if (i > 0) {
            newText += separator;
            if (opts.separatorNewlineWhen != null && opts.separatorNewlineWhen(opts.structures[i - 1], opts.structures[i]))
                newText += newLineChar;
        }
        newText += childCodes[i];
    }
    if (index !== 0)
        newText = separator + newText;
    else if (insertPos !== 0)
        newText = newLineChar + newText;
    else if (sourceFile.getFullWidth() > 0)
        newText = newText + separator;
    if (opts.previousBlanklineWhen != null) {
        const previousMember = children[index - 1];
        const firstStructure = opts.structures[0];
        if (previousMember != null && opts.previousBlanklineWhen(previousMember, firstStructure))
            newText = newLineChar + newText;
    }
    if (opts.nextBlanklineWhen != null) {
        const nextMember = children[index];
        const lastStructure = opts.structures[opts.structures.length - 1];
        if (nextMember != null && opts.nextBlanklineWhen(nextMember, lastStructure)) {
            if (!textChecks_1.isBlankLineAtPos(sourceFile, insertPos))
                newText = newText + newLineChar;
        }
    }
    insertIntoSyntaxList_1.insertIntoSyntaxList({
        insertPos,
        newText,
        syntaxList: parent.getChildSyntaxListOrThrow(),
        childIndex: index,
        insertItemsCount: childCodes.length
    });
}
exports.insertIntoBracesOrSourceFile = insertIntoBracesOrSourceFile;
function getInsertPosition(index, parent, children) {
    if (index === 0) {
        if (parent.isSourceFile())
            return 0;
        else {
            const parentContainer = getParentContainer(parent);
            const openBraceToken = parentContainer.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken);
            return openBraceToken.getEnd();
        }
    }
    return children[index - 1].getEnd();
}
function getParentContainer(parent) {
    if (parent.isBodiedNode())
        return parent.getBody();
    if (parent.isBodyableNode())
        return parent.getBodyOrThrow();
    else
        return parent;
}



},{"./insertIntoSyntaxList":165,"./textChecks":172,"typescript":"typescript"}],163:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyAndGetIndex_1 = require("./verifyAndGetIndex");
const insertIntoBracesOrSourceFile_1 = require("./insertIntoBracesOrSourceFile");
const fillAndGetChildren_1 = require("./fillAndGetChildren");
/**
 * Glues together insertIntoBracesOrSourceFile and fillAndGetChildren.
 * @param opts - Options to do this operation.
 */
function insertIntoBracesOrSourceFileWithFillAndGetChildren(opts) {
    if (opts.structures.length === 0)
        return [];
    const startChildren = opts.getChildren();
    const index = verifyAndGetIndex_1.verifyAndGetIndex(opts.index, startChildren.length);
    insertIntoBracesOrSourceFile_1.insertIntoBracesOrSourceFile(Object.assign({}, opts, { children: startChildren, separator: opts.sourceFile.global.manipulationSettings.getNewLineKind(), index }));
    return fillAndGetChildren_1.fillAndGetChildren(Object.assign({}, opts, { allChildren: opts.getChildren(), index }));
}
exports.insertIntoBracesOrSourceFileWithFillAndGetChildren = insertIntoBracesOrSourceFileWithFillAndGetChildren;



},{"./fillAndGetChildren":154,"./insertIntoBracesOrSourceFile":162,"./verifyAndGetIndex":178}],164:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const insertIntoSyntaxList_1 = require("./insertIntoSyntaxList");
function insertIntoCommaSeparatedNodes(opts) {
    const { currentNodes, insertIndex, newTexts } = opts;
    const nextNode = currentNodes[insertIndex];
    const numberOfSyntaxListItemsInserting = newTexts.length * 2;
    if (nextNode == null) {
        const previousNode = currentNodes[insertIndex - 1];
        insertIntoSyntaxList_1.insertIntoSyntaxList({
            insertPos: previousNode.getEnd(),
            newText: `, ${newTexts.join(", ")}`,
            syntaxList: previousNode.getParentSyntaxListOrThrow(),
            childIndex: previousNode.getChildIndex() + 1,
            insertItemsCount: numberOfSyntaxListItemsInserting
        });
    }
    else {
        insertIntoSyntaxList_1.insertIntoSyntaxList({
            insertPos: nextNode.getStart(),
            newText: `${newTexts.join(", ")}, `,
            syntaxList: nextNode.getParentSyntaxListOrThrow(),
            childIndex: nextNode.getChildIndex(),
            insertItemsCount: numberOfSyntaxListItemsInserting
        });
    }
}
exports.insertIntoCommaSeparatedNodes = insertIntoCommaSeparatedNodes;



},{"./insertIntoSyntaxList":165}],165:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replaceTree_1 = require("./replaceTree");
/**
 * Insert into a syntax list.
 */
function insertIntoSyntaxList(opts) {
    const { insertPos, newText, syntaxList, childIndex, insertItemsCount } = opts;
    const sourceFile = syntaxList.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    replaceTree_1.replaceTreeWithChildIndex({
        replacementSourceFile: tempSourceFile,
        parent: syntaxList,
        childIndex,
        childCount: insertItemsCount
    });
}
exports.insertIntoSyntaxList = insertIntoSyntaxList;



},{"./replaceTree":171}],166:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../errors");
const utils_1 = require("./../utils");
const getInsertErrorMessageText_1 = require("./getInsertErrorMessageText");
/**
 * Simple insert where the new nodes are well defined.
 */
function insertStraight(options) {
    const { insertPos, parent, newCode, replacing } = options;
    const sourceFile = parent.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newCode + currentText.substring(replacing != null ? insertPos + replacing.length : insertPos);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    const allChildrenIterator = utils_1.ArrayUtils.getIterator([sourceFile, ...Array.from(sourceFile.getAllChildren())]);
    const endPos = insertPos + newCode.length;
    handleNode(tempSourceFile);
    function handleNode(newNode) {
        let currentNode = allChildrenIterator.next().value;
        while (replacing != null && replacing.nodes.indexOf(currentNode) >= 0) {
            currentNode.dispose();
            currentNode = allChildrenIterator.next().value;
        }
        const parentMatches = parent.getPos() === newNode.getPos() && parent.getKind() === newNode.getKind();
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText_1.getInsertErrorMessageText("Error inserting straight.", currentNode, newNode));
        for (const newNodeChild of newNode.getChildren()) {
            if (parentMatches) {
                const newNodeChildStart = newNodeChild.getStart();
                if (newNodeChildStart >= insertPos && newNodeChildStart < endPos) {
                    newNodeChild.setSourceFile(sourceFile);
                    continue;
                }
            }
            handleNode(newNodeChild);
        }
        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
exports.insertStraight = insertStraight;



},{"./../errors":137,"./../utils":179,"./getInsertErrorMessageText":156}],167:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../errors");
const getInsertErrorMessageText_1 = require("./getInsertErrorMessageText");
const areNodesEqual_1 = require("./areNodesEqual");
const textSeek_1 = require("./textSeek");
function removeFromBracesOrSourceFile(opts) {
    const { node } = opts;
    const sourceFile = node.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const syntaxList = node.getParentSyntaxListOrThrow();
    const syntaxListParent = syntaxList.getParent();
    const currentText = sourceFile.getFullText();
    const removingIndex = node.getChildIndex();
    const childrenCount = syntaxList.getChildCount();
    let removeRangeStart = getStart(currentText, node.getPos());
    const removeRangeEnd = textSeek_1.getPosAtNextNonBlankLine(currentText, node.getEnd());
    if (removingIndex === 0 || removingIndex === childrenCount - 1)
        removeRangeStart = textSeek_1.getPosAfterPreviousNonBlankLine(currentText, removeRangeStart);
    const newFileText = currentText.substring(0, removeRangeStart) + currentText.substring(removeRangeEnd);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    handleNode(sourceFile, tempSourceFile);
    node.dispose();
    function handleNode(currentNode, newNode) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText_1.getInsertErrorMessageText("Error removing nodes!", currentNode, newNode));
        const currentNodeChildren = currentNode.getChildrenIterator();
        for (const newNodeChild of newNode.getChildrenIterator()) {
            if (areNodesEqual_1.areNodesEqual(newNodeChild, syntaxList) && areNodesEqual_1.areNodesEqual(newNodeChild.getParent(), syntaxListParent))
                handleSyntaxList(currentNodeChildren.next().value, newNodeChild);
            else
                handleNode(currentNodeChildren.next().value, newNodeChild);
        }
        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
    function handleSyntaxList(currentNode, newNode) {
        const currentNodeChildren = currentNode.getChildrenIterator();
        let i = 0;
        for (const newNodeChild of newNode.getChildren()) {
            if (i === removingIndex) {
                // skip over the removing node
                currentNodeChildren.next().value;
            }
            const currentChild = currentNodeChildren.next().value;
            handleNode(currentChild, newNodeChild);
            i++;
        }
        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
exports.removeFromBracesOrSourceFile = removeFromBracesOrSourceFile;
function getStart(text, pos) {
    // 1. find first non-space character
    // 2. get start of line or pos
    const spaceRegex = /\s/;
    const firstNonSpacePos = getFirstNonSpacePos();
    for (let i = firstNonSpacePos - 1; i >= pos; i--) {
        if (text[i] === "\n")
            return i + 1;
    }
    return pos;
    function getFirstNonSpacePos() {
        for (let i = pos; i < text.length; i++) {
            if (!spaceRegex.test(text[i]))
                return i;
        }
        return pos;
    }
}



},{"./../errors":137,"./areNodesEqual":153,"./getInsertErrorMessageText":156,"./textSeek":174}],168:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../errors");
const getInsertErrorMessageText_1 = require("./getInsertErrorMessageText");
function removeNodes(nodes, opts = {}) {
    const nonNullNodes = nodes.filter(n => n != null);
    if (nonNullNodes.length === 0 || nonNullNodes[0].getPos() === nonNullNodes[nonNullNodes.length - 1].getEnd())
        return;
    ensureNodePositionsContiguous(nonNullNodes);
    const sourceFile = nonNullNodes[0].getSourceFile();
    // get the start and end position
    const { removePrecedingSpaces = true } = opts;
    const parentStart = nonNullNodes[0].getParentOrThrow().getStart();
    const nodeStart = nonNullNodes[0].getStart();
    const currentText = sourceFile.getFullText();
    const removeRangeStart = removePrecedingSpaces ? Math.max(parentStart, nonNullNodes[0].getPos()) : nodeStart;
    let removeRangeEnd = nonNullNodes[nonNullNodes.length - 1].getEnd();
    // trim any end spaces when the current node is the first node of the parent
    const isFirstNodeOfParent = nodeStart === parentStart;
    if (isFirstNodeOfParent) {
        const whitespaceRegex = /[^\S\r\n]/;
        while (whitespaceRegex.test(currentText[removeRangeEnd]))
            removeRangeEnd++;
    }
    // remove the nodes
    const newFileText = currentText.substring(0, removeRangeStart) + currentText.substring(removeRangeEnd);
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    handleNode(sourceFile, tempSourceFile);
    function handleNode(currentNode, newNode) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText_1.getInsertErrorMessageText("Error removing nodes!", currentNode, newNode));
        const newChildren = newNode.getChildren();
        let newChildIndex = 0;
        for (const currentChild of currentNode.getChildrenIterator()) {
            if (nonNullNodes.indexOf(currentChild) >= 0) {
                currentChild.dispose();
                continue;
            }
            const newChild = newChildren[newChildIndex];
            if (newChild == null) {
                currentChild.dispose();
                continue;
            }
            const isSyntaxListDisappearing = currentChild.getKind() === ts.SyntaxKind.SyntaxList && newChild.getKind() !== ts.SyntaxKind.SyntaxList;
            if (isSyntaxListDisappearing) {
                currentChild.dispose();
                continue;
            }
            handleNode(currentChild, newChild);
            newChildIndex++;
        }
        sourceFile.global.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
exports.removeNodes = removeNodes;
function ensureNodePositionsContiguous(nodes) {
    let lastPosition = nodes[0].getPos();
    for (const node of nodes) {
        if (node.getPos() !== lastPosition)
            throw new Error("Node to remove must be contiguous.");
        lastPosition = node.getEnd();
    }
}



},{"./../errors":137,"./getInsertErrorMessageText":156,"typescript":"typescript"}],169:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Replaces text in a source file. Good for renaming identifiers. Not good for creating new nodes!
 * @param sourceFile - Source file to replace in.
 * @param replaceStart - Start of where to replace.
 * @param replaceEnd - End of where to replace.
 * @param newText - The new text to go in place.
 */
function replaceNodeText(sourceFile, replaceStart, replaceEnd, newText) {
    const difference = newText.length - (replaceEnd - replaceStart);
    replaceForNode(sourceFile);
    sourceFile.global.resetProgram();
    function replaceForNode(node) {
        const currentStart = node.getStart();
        const compilerNode = node.compilerNode;
        // do the children first so that the underlying _children array is filled in based on the source file
        for (const child of node.getChildren()) {
            replaceForNode(child);
        }
        if (node.containsRange(replaceStart, replaceEnd)) {
            const text = compilerNode.text;
            if (text != null) {
                const relativeStart = replaceStart - currentStart;
                const relativeEnd = replaceEnd - currentStart;
                compilerNode.text = text.substring(0, relativeStart) + newText + text.substring(relativeEnd);
            }
            compilerNode.end += difference;
        }
        else if (currentStart > replaceStart) {
            compilerNode.pos += difference;
            compilerNode.end += difference;
        }
    }
}
exports.replaceNodeText = replaceNodeText;



},{}],170:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../errors");
const getInsertErrorMessageText_1 = require("./getInsertErrorMessageText");
/**
 * Replace insert where the new and old nodes are well defined.
 */
function replaceStraight(sourceFile, replacePos, replaceLength, newText) {
    const compilerFactory = sourceFile.global.compilerFactory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, replacePos) + newText + currentText.substring(replacePos + replaceLength);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    const endPos = replacePos + newText.length;
    const removedNodes = [];
    // todo: use replaceTree function
    handleNode(sourceFile, tempSourceFile);
    removedNodes.forEach(n => n.dispose());
    function handleNode(currentNode, newNode) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText_1.getInsertErrorMessageText("Error replacing straight.", currentNode, newNode));
        const currentNodeChildren = currentNode.getChildrenIterator();
        let currentNodeChild;
        for (const newNodeChild of newNode.getChildrenIterator()) {
            // todo: is getStart slow? Maybe something could be added or changed here for performance reasons
            const newNodeChildStart = newNodeChild.getStart();
            if (newNodeChildStart >= replacePos && newNodeChildStart < endPos)
                continue;
            let currentNodeChildStart;
            currentNodeChild = undefined;
            do {
                if (currentNodeChild != null)
                    removedNodes.push(currentNodeChild);
                currentNodeChild = currentNodeChildren.next().value;
                currentNodeChildStart = currentNodeChild.getStart();
            } while (replaceLength > 0 && currentNodeChildStart >= replacePos && currentNodeChildStart < replacePos + replaceLength);
            handleNode(currentNodeChild, newNodeChild);
        }
        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
exports.replaceStraight = replaceStraight;



},{"./../errors":137,"./getInsertErrorMessageText":156}],171:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors = require("./../errors");
const utils_1 = require("./../utils");
const getInsertErrorMessageText_1 = require("./getInsertErrorMessageText");
const areNodesEqual_1 = require("./areNodesEqual");
/**
 * Replaces with tree that creates a syntax list.
 */
function replaceTreeCreatingSyntaxList(opts) {
    const { parent, replacementSourceFile } = opts;
    replaceTree({
        parent,
        childCount: 1,
        replacementSourceFile,
        isFirstChild: (currentNode, newNode) => newNode.getKind() === ts.SyntaxKind.SyntaxList && currentNode.getKind() !== ts.SyntaxKind.SyntaxList
    });
}
exports.replaceTreeCreatingSyntaxList = replaceTreeCreatingSyntaxList;
/**
 * Replaces with tree based on the child index from the parent.
 */
function replaceTreeWithChildIndex(opts) {
    const { replacementSourceFile, parent, childIndex, childCount } = opts;
    const parentChildren = parent.getChildren();
    errors.throwIfOutOfRange(childIndex, [0, parentChildren.length], "opts.childIndex");
    if (childCount < 0)
        errors.throwIfOutOfRange(childIndex + childCount, [0, parentChildren.length], "opts.childCount", [-childIndex, 0]);
    let i = 0;
    const isFirstChild = () => i++ === childIndex;
    replaceTree({
        replacementSourceFile,
        parent,
        isFirstChild,
        childCount
    });
}
exports.replaceTreeWithChildIndex = replaceTreeWithChildIndex;
/**
 * Replaces the tree with a new one.
 */
function replaceTree(opts) {
    const { replacementSourceFile, parent: changingParent, isFirstChild, childCount } = opts;
    const sourceFile = changingParent.getSourceFile();
    const changingParentParent = changingParent.getParentSyntaxList() || changingParent.getParentOrThrow();
    const compilerFactory = sourceFile.global.compilerFactory;
    handleNode(sourceFile, replacementSourceFile);
    function handleNode(currentNode, newNode) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText_1.getInsertErrorMessageText("Error replacing tree!", currentNode, newNode));
        const newNodeChildren = newNode.getChildrenIterator();
        const areParentParentsEqual = areNodesEqual_1.areNodesEqual(newNode, changingParentParent);
        for (const currentNodeChild of currentNode.getChildrenIterator()) {
            const newNodeChild = newNodeChildren.next().value;
            if (areParentParentsEqual && areNodesEqual_1.areNodesEqual(newNodeChild, changingParent))
                handleChangingParent(currentNodeChild, newNodeChild);
            else
                handleNode(currentNodeChild, newNodeChild);
        }
        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
    function handleChangingParent(currentNode, newNode) {
        const currentNodeChildren = new utils_1.AdvancedIterator(currentNode.getChildrenIterator());
        const newNodeChildren = new utils_1.AdvancedIterator(newNode.getChildrenIterator());
        let count = childCount;
        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && !isFirstChild(currentNodeChildren.peek, newNodeChildren.peek))
            handleNode(currentNodeChildren.next(), newNodeChildren.next());
        // add or remove the items
        if (count > 0) {
            while (count > 0) {
                newNodeChildren.next().setSourceFile(sourceFile);
                count--;
            }
        }
        else if (count < 0) {
            while (count < 0) {
                currentNodeChildren.next().dispose();
                count++;
            }
        }
        // handle the rest
        while (!currentNodeChildren.done) {
            handleNode(currentNodeChildren.next(), newNodeChildren.next());
        }
        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have more children left over."); // todo: better error message
        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
exports.replaceTree = replaceTree;



},{"./../errors":137,"./../utils":179,"./areNodesEqual":153,"./getInsertErrorMessageText":156,"typescript":"typescript"}],172:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./textChecks/isBlankLineAtPos"));



},{"./textChecks/isBlankLineAtPos":173}],173:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isBlankLineAtPos(sourceFile, pos) {
    const fullText = sourceFile.getFullText();
    let foundBlankLine = false;
    for (let i = pos; i < fullText.length; i++) {
        const char = fullText[i];
        if (char === " " || char === "\t")
            continue;
        if (char === "\r" && fullText[i + 1] === "\n" || char === "\n") {
            if (foundBlankLine)
                return true;
            foundBlankLine = true;
            if (char === "\r")
                i++;
            continue;
        }
        return false;
    }
    return false;
}
exports.isBlankLineAtPos = isBlankLineAtPos;



},{}],174:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./textSeek/getNextNonWhitespacePos"));
__export(require("./textSeek/getPosAfterPreviousNonBlankLine"));
__export(require("./textSeek/getPosAtNextNonBlankLine"));



},{"./textSeek/getNextNonWhitespacePos":175,"./textSeek/getPosAfterPreviousNonBlankLine":176,"./textSeek/getPosAtNextNonBlankLine":177}],175:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getNextNonWhitespacePos(text, pos) {
    while (pos < text.length) {
        const char = text[pos];
        if (char === " " || char === "\t" || char === "\r" || char === "\n")
            pos++;
        else
            break;
    }
    return pos;
}
exports.getNextNonWhitespacePos = getNextNonWhitespacePos;



},{}],176:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPosAfterPreviousNonBlankLine(text, pos) {
    let newPos = pos;
    for (let i = pos - 1; i >= 0; i--) {
        if (text[i] === " " || text[i] === "\t")
            continue;
        if (text[i] === "\n") {
            newPos = i + 1;
            if (text[i - 1] === "\r")
                i--;
            continue;
        }
        return newPos;
    }
    return 0;
}
exports.getPosAfterPreviousNonBlankLine = getPosAfterPreviousNonBlankLine;



},{}],177:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPosAtNextNonBlankLine(text, pos) {
    let newPos = pos;
    for (let i = pos; i < text.length; i++) {
        if (text[i] === " " || text[i] === "\t")
            continue;
        if (text[i] === "\r" && text[i + 1] === "\n" || text[i] === "\n") {
            newPos = i + 1;
            if (text[i] === "\r") {
                i++;
                newPos++;
            }
            continue;
        }
        return newPos;
    }
    return newPos;
}
exports.getPosAtNextNonBlankLine = getPosAtNextNonBlankLine;



},{}],178:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../errors");
/**
 * Verifies to see if an index or negative index exists within a specified length.
 * @param index - Index.
 * @param length - Length index could be in.
 */
function verifyAndGetIndex(index, length) {
    const newIndex = index < 0 ? length + index : index;
    if (newIndex < 0)
        throw new errors.InvalidOperationError(`Invalid index: The max negative index is ${length * -1}, but ${index} was specified.`);
    if (index > length)
        throw new errors.InvalidOperationError(`Invalid index: The max index is ${length}, but ${index} was specified.`);
    return newIndex;
}
exports.verifyAndGetIndex = verifyAndGetIndex;



},{"./../errors":137}],179:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./utils/AdvancedIterator"));
__export(require("./utils/ArrayUtils"));
__export(require("./utils/CompilerOptionsResolver"));
__export(require("./utils/decorators"));
__export(require("./utils/EventContainer"));
__export(require("./utils/FileUtils"));
__export(require("./utils/getNamedNodeByNameOrFindFunction"));
__export(require("./utils/getSymbolByNameOrFindFunction"));
__export(require("./utils/KeyValueCache"));
__export(require("./utils/Logger"));
__export(require("./utils/using"));



},{"./utils/AdvancedIterator":180,"./utils/ArrayUtils":181,"./utils/CompilerOptionsResolver":182,"./utils/EventContainer":183,"./utils/FileUtils":184,"./utils/KeyValueCache":185,"./utils/Logger":186,"./utils/decorators":187,"./utils/getNamedNodeByNameOrFindFunction":189,"./utils/getSymbolByNameOrFindFunction":190,"./utils/using":191}],180:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./../errors");
class AdvancedIterator {
    constructor(iterator) {
        this.iterator = iterator;
        this.buffer = Array.from(Array(3)); // previous, current, next
        this.bufferIndex = 0;
        this.isDone = false;
        this.nextCount = 0;
        this.advance();
    }
    get done() {
        return this.isDone;
    }
    get current() {
        if (this.nextCount === 0)
            throw new errors.InvalidOperationError("Cannot get the current when the iterator has not been advanced.");
        return this.buffer[this.bufferIndex];
    }
    get previous() {
        if (this.nextCount <= 1)
            throw new errors.InvalidOperationError("Cannot get the previous when the iterator has not advanced enough.");
        return this.buffer[(this.bufferIndex + this.buffer.length - 1) % this.buffer.length];
    }
    get peek() {
        if (this.isDone)
            throw new errors.InvalidOperationError("Cannot peek at the end of the iterator.");
        return this.buffer[(this.bufferIndex + 1) % this.buffer.length];
    }
    next() {
        if (this.done)
            throw new errors.InvalidOperationError("Cannot get the next when at the end of the iterator.");
        const next = this.buffer[this.getNextBufferIndex()];
        this.advance();
        this.nextCount++;
        return next;
    }
    *rest() {
        while (!this.done)
            yield this.next();
    }
    advance() {
        const next = this.iterator.next();
        this.bufferIndex = this.getNextBufferIndex();
        if (next.done) {
            this.isDone = true;
            return;
        }
        this.buffer[this.getNextBufferIndex()] = next.value;
    }
    getNextBufferIndex() {
        return (this.bufferIndex + 1) % this.buffer.length;
    }
}
exports.AdvancedIterator = AdvancedIterator;



},{"./../errors":137}],181:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ArrayUtils {
    constructor() {
    }
    static *getIterator(a) {
        for (const item of a) {
            yield item;
        }
    }
    static isNullOrEmpty(a) {
        return !(a instanceof Array) || a.length === 0;
    }
    static getUniqueItems(a) {
        return a.filter((item, index) => a.indexOf(item) === index);
    }
    static removeFirst(a, item) {
        const index = a.indexOf(item);
        if (index === -1)
            return false;
        a.splice(index, 1);
        return true;
    }
}
exports.ArrayUtils = ArrayUtils;



},{}],182:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const errors_1 = require("./../errors");
const FileUtils_1 = require("./FileUtils");
/**
 * Resolves compiler options.
 */
class CompilerOptionsResolver {
    /**
     * Initializes a new instance.
     * @param fileSystem - Host for reading files.
     */
    constructor(fileSystem, options) {
        this.fileSystem = fileSystem;
        this.options = options;
    }
    /**
     * Get the compiler options.
     * @param options - The passed in compiler options or the tsconfig.json file path.
     */
    getCompilerOptions() {
        let compilerOptions;
        if (this.options.compilerOptions != null)
            compilerOptions = Object.assign({}, this.options.compilerOptions);
        else if (this.options.tsConfigFilePath != null)
            compilerOptions = this.getCompilerOptionsFromTsConfig(this.options.tsConfigFilePath);
        else
            compilerOptions = {};
        return compilerOptions;
    }
    getCompilerOptionsFromTsConfig(filePath) {
        const absoluteFilePath = FileUtils_1.FileUtils.getAbsoluteOrRelativePathFromPath(filePath, FileUtils_1.FileUtils.getCurrentDirectory());
        this.verifyFileExists(absoluteFilePath);
        const text = this.fileSystem.readFile(absoluteFilePath);
        const result = ts.parseConfigFileTextToJson(absoluteFilePath, text, true);
        if (result.error != null)
            throw new Error(result.error.messageText.toString());
        const settings = ts.convertCompilerOptionsFromJson(result.config.compilerOptions, FileUtils_1.FileUtils.getDirName(filePath));
        if (!settings.options)
            throw new Error(this.getErrorMessage(settings.errors));
        return settings.options;
    }
    getErrorMessage(errors) {
        let message = "";
        errors.forEach(err => message += `${err.messageText}\n`);
        return message;
    }
    verifyFileExists(filePath) {
        // unfortunately the ts compiler doesn't do things asynchronously so for now we won't either
        if (!this.fileSystem.fileExists(filePath))
            throw new errors_1.FileNotFoundError(filePath);
    }
}
exports.CompilerOptionsResolver = CompilerOptionsResolver;



},{"./../errors":137,"./FileUtils":184,"typescript":"typescript"}],183:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Event container for event subscriptions.
 */
class EventContainer {
    constructor() {
        this.subscriptions = [];
    }
    /**
     * Subscribe to an event being fired.
     * @param subscription - Subscription.
     */
    subscribe(subscription) {
        const index = this.getIndex(subscription);
        if (index === -1)
            this.subscriptions.push(subscription);
    }
    /**
     * Unsubscribe to an event being fired.
     * @param subscription - Subscription.
     */
    unsubscribe(subscription) {
        const index = this.getIndex(subscription);
        if (index >= 0)
            this.subscriptions.splice(index, 1);
    }
    /**
     * Fire an event.
     */
    fire(arg) {
        for (const subscription of this.subscriptions)
            subscription(arg);
    }
    getIndex(subscription) {
        return this.subscriptions.indexOf(subscription);
    }
}
exports.EventContainer = EventContainer;



},{}],184:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class FileUtils {
    constructor() {
    }
    /**
     * Gets the current directory.
     */
    static getCurrentDirectory() {
        return this.getStandardizedAbsolutePath(path.resolve());
    }
    /**
     * Joins the paths.
     * @param paths - Paths to join.
     */
    static pathJoin(...paths) {
        return path.join(...paths);
    }
    /**
     * Gets the standardized absolute path.
     * @param fileOrDirPath - Path to standardize.
     */
    static getStandardizedAbsolutePath(fileOrDirPath) {
        return this.standardizeSlashes(path.normalize(path.resolve(fileOrDirPath)));
    }
    /**
     * Gets the directory name.
     * @param fileOrDirPath - Path to get the directory name from.
     */
    static getDirName(fileOrDirPath) {
        return path.dirname(fileOrDirPath);
    }
    /**
     * Gets the absolute path when absolute, otherwise gets the relative path from the base dir.
     * @param filePath - File path.
     * @param baseDir - Base dir to use when file path is relative.
     */
    static getAbsoluteOrRelativePathFromPath(filePath, baseDir) {
        if (path.isAbsolute(filePath))
            return FileUtils.getStandardizedAbsolutePath(filePath);
        return FileUtils.getStandardizedAbsolutePath(path.join(baseDir, filePath));
    }
    static standardizeSlashes(fileName) {
        return fileName.replace(/\\/g, "/");
    }
    static filePathMatches(fileName, searchString) {
        const splitBySlash = (p) => this.standardizeSlashes(p || "").replace(/^\//, "").split("/");
        const fileNameItems = splitBySlash(fileName);
        const searchItems = splitBySlash(searchString);
        if (searchItems.length > fileNameItems.length)
            return false;
        for (let i = 0; i < searchItems.length; i++) {
            if (searchItems[searchItems.length - i - 1] !== fileNameItems[fileNameItems.length - i - 1])
                return false;
        }
        return searchItems.length > 0;
    }
}
exports.FileUtils = FileUtils;



},{"path":20}],185:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KeyValueCache {
    constructor() {
        this.cacheItems = new Map();
    }
    getEntries() {
        return this.cacheItems.entries();
    }
    getOrCreate(key, createFunc) {
        let item = this.get(key);
        if (item == null) {
            item = createFunc();
            this.set(key, item);
        }
        return item;
    }
    get(key) {
        return this.cacheItems.get(key) || undefined;
    }
    set(key, value) {
        this.cacheItems.set(key, value);
    }
    replaceKey(key, newKey) {
        if (!this.cacheItems.has(key))
            throw new Error("Key not found.");
        const value = this.cacheItems.get(key);
        this.cacheItems.delete(key);
        this.cacheItems.set(newKey, value);
    }
    removeByKey(key) {
        this.cacheItems.delete(key);
    }
}
exports.KeyValueCache = KeyValueCache;



},{}],186:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    static setEnabled(enabled) {
        this.enabled = enabled;
    }
    static log(text) {
        if (this.enabled)
            console.log(text);
    }
    static warn(text) {
        if (this.enabled)
            console.warn(text);
    }
}
Logger.enabled = false;
exports.Logger = Logger;



},{}],187:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) /* istanbul ignore else */ if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./decorators/Memoize"));



},{"./decorators/Memoize":188}],188:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Memoize(target, propertyName, descriptor) {
    if (descriptor.value != null)
        descriptor.value = getNewFunction(descriptor.value);
    else if (descriptor.get != null)
        descriptor.get = getNewFunction(descriptor.get);
    else
        throw new Error("Only put a Memoize decorator on a method or get accessor.");
}
exports.Memoize = Memoize;
let counter = 0;
function getNewFunction(originalFunction) {
    const identifier = ++counter;
    function decorator() {
        const propName = `__memoized_value_${identifier}`;
        let returnedValue;
        if (arguments.length > 0)
            throw new Error("Should not use memoize with a function that requires arguments.");
        if (this.hasOwnProperty(propName))
            returnedValue = this[propName];
        else {
            returnedValue = originalFunction.apply(this, arguments);
            Object.defineProperty(this, propName, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: returnedValue
            });
        }
        return returnedValue;
    }
    return decorator;
}



},{}],189:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getNamedNodeByNameOrFindFunction(items, nameOrFindFunc) {
    let findFunc;
    if (typeof nameOrFindFunc === "string")
        findFunc = dec => dec.getName() === nameOrFindFunc;
    else
        findFunc = nameOrFindFunc;
    return items.find(findFunc);
}
exports.getNamedNodeByNameOrFindFunction = getNamedNodeByNameOrFindFunction;



},{}],190:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// todo: merge with getNamedNodeByNameOrFindFunction
function getSymbolByNameOrFindFunction(items, nameOrFindFunc) {
    let findFunc;
    if (typeof nameOrFindFunc === "string")
        findFunc = dec => dec.getName() === nameOrFindFunc;
    else
        findFunc = nameOrFindFunc;
    return items.find(findFunc);
}
exports.getSymbolByNameOrFindFunction = getSymbolByNameOrFindFunction;



},{}],191:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function using(resource, func) {
    try {
        func(resource);
    }
    finally {
        resource.dispose();
    }
}
exports.using = using;



},{}],192:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"dup":16}],193:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],194:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":193,"_process":25,"inherits":192}],195:[function(require,module,exports){
// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}

},{}]},{},[29,151])(151)
});