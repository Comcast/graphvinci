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

import GlobalViz from "../GlobalViz";

const bigClass = "domainheader";

export default class DomainNodeSizer {

    constructor(domain) {
        this.sized = false;
        this.rows = 0;
        this.height =  5;
        this.width = 10;
        this.marginX = 100;
        this.marginY = 100;
        this.spacer = 25;
        this.domain = domain;
        this._get_sizing();
    }

    _get_sizing() {
        this.sized = true;
        let nameDetail = GlobalViz.vis?.d3text_sizer.get_sizing(this.domain, bigClass);
        let paddedWidth = nameDetail.width + this.marginX;
        let paddedHeight = nameDetail.height + this.marginY;
        this.height = paddedHeight > this.height ? paddedHeight : this.height;
        this.width = paddedWidth > this.width ? paddedWidth : this.width;
    }

    get centerTextAnchorX() {
        if (! this.sized) this._get_sizing();
        return (this.width / 2);
    }

    get rowMidPoint() {
        if (! this.sized) this._get_sizing();
        return this.height / 2;
    }

    get targetPoints() {
        if (! this.sized) this._get_sizing();
        let northX = this.width / 2;
        let northY = 0 - this.spacer;
        let southX = this.width / 2;
        let southY = this.height + this.spacer;
        let westX = 0 - this.spacer;
        let westY = this.height / 2;
        let eastX = this.width + this.spacer;
        let eastY = this.height / 2;
        return [
            { x: northX, y: northY},
            { x: southX, y: southY},
            { x: westX, y: westY},
            { x: eastX, y: eastY}
        ];
    }

    get radius() {
        if (! this.sized) this._get_sizing();
        return this.height > this.width ? this.height / 1.8 : this.width / 1.8;
    }

}
