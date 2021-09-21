/*
 * Copyright 2018 The GraphVini Authors
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
Willing to concede that there may be a cleaner way of doing this, but I've yet to find it.  This singleton draws
text out in a hidden svg and then measures its bounding box to get width and height.  This information is then used
to draw what is essentially a div containing text.  You can technically do this inline each time you draw your text,
but if you have a lot of the same text, or are re-drawing frequently this saves some time
 */
export default class D3TextSizer {
    constructor() {
        this.caches = new Map();
        this.div = d3.select('body')
            .append('div')
            .attr('class', 'hiddensizing')
            .style('width', "1px")
            .style('height', "1px")
            .style('position', "absolute")
            .style('top', 0)
            .style('display','hidden');

        this.svg = this.div.append('svg')
            .attr("width", '100%')
            .attr("height", '100%');
    }
    
    get_sizing(textString, clazz) {
        /*
        Each class gets its own sizecache, to avoid naming collisionsß
         */
        clazz = (typeof(clazz) === 'undefined' || clazz === null || clazz === "") ? "default" : clazz;
        let sizeCache = this._get_cache(clazz);
        if (sizeCache.has(textString)) {
            return sizeCache.get(textString);
        }
        let box = this._get_sizing(textString, clazz);
        sizeCache.set(textString, box);
        return box;
    }

    _get_sizing(textString, clazz) {
        let sizedText = this.svg.append('text').text(textString);
        if (clazz !== 'default') {
            sizedText.classed(clazz, true);
        }
        let box = sizedText.node().getBBox();
        sizedText.remove();
        return box;
    }

    _get_cache(clazz) {
        if (! this.caches.has(clazz)) {
            this.caches.set(clazz, new Map());
        }
        return this.caches.get(clazz);
    }

    reset() {
        this.sizeCache = new Map();
    }

}
