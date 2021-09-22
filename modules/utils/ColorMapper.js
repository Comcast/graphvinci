/*
 * Copyright 2018 The GraphVinci Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as d3 from "d3";

/*
The point here is to use the nicest color scheme(s) that we can, and then fall back to using
a sequential "rainbow" style scale after that.  Best I can do.
 */
export default class ColorMapper {
    constructor() {
        this.colorMap = {};
        this.colorCount = 0;
        // The first 10
        this.primaryThreshold = 10;
        this.primary = d3.scaleOrdinal(d3.schemeSet3);
        // The next 10
        this.secondaryThreshold = 19;
        // schemePastel1 schemePaired
        this.secondary = d3.scaleOrdinal(d3.schemeSet1);
        // The fallback
        //this.tertiary = d3.scaleSequential(d3.interpolateTurbo);
        this.fallBack = (str) => {
            // This looks ugly no matter what I do
            //return this.tertiary(this.custom_hash(str));
           return d3.interpolateSpectral(this.custom_hash(str));
        }
    }

    get_color(str) {
        if (! str) {
            return "#fff";
        }
        let bucket = 0;
        if (!this.colorMap[str]) {
            this.colorCount++;
            this.colorMap[str] = this.colorCount;
        }
        bucket = this.colorMap[str];
        if (bucket < this.primaryThreshold) {
            return this.primary(str);
        } else if (bucket < this.secondaryThreshold) {
            return this.secondary(str);
        } else {
            return this.fallBack(str);
        }
    }

    custom_hash(str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        let num = 4294967296 * (2097151 & h2) + (h1 >>> 0);
        return parseFloat("0." + num.toString().substring(3));
    }
}
