/*
 *   Copyright (c) 2023 JRichardsz
 *   All rights reserved.

 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

require('../common/LoggerHelper.js');

function JavascriptHelper() {

  this.executeSingleFunction = async (alias, functionString, variables) => {

    if (typeof alias === "undefined" || alias === "") {
      throw new Error("alias is required");
    }

    if (typeof functionString === "undefined" || functionString === "") {
      throw new Error("function content is required");
    }

    console.debug("code")
    console.debug(functionString);
    console.debug("variables")
    console.debug(variables)

    //create an array of variable names and at the end, the script
    //https://stackoverflow.com/a/4183662/3957754
    // var keys = Object.keys(variables);
    var keys = ["params"];
    //add the script
    keys.push(functionString);
    var jsFunction = Function.apply(null, keys);
    return await jsFunction(variables);

  }

}

module.exports = JavascriptHelper;
