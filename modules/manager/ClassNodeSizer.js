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

import GlobalViz from "../GlobalViz";

const MINHEIGHT = 5;
const MINNAMEWIDTH = 10;
const MINDEFWIDTH = 30;
const BUFFERWIDTH = 30;
const MARGINX = 20;
const MARGINY = 6;

export default class ClassNodeSizer {

    constructor(fieldArray) {
        this.rows = 0;
        this.sized = false;
        this.height =  MINHEIGHT;
        this.nameWidth = MINNAMEWIDTH;
        this.definitionWidth = MINDEFWIDTH;
        this.buffer = BUFFERWIDTH;
        this.marginX = MARGINX;
        this.marginY = MARGINY;
        this.nameOffset = new Map();
        this.fieldArray = fieldArray;
    }

    _get_sizing() {
        this.sized = true;
        this.hasInput = false;
        for (let field of this.fieldArray) {
            this.rows++;
            let nameDetail = GlobalViz.vis?.d3text_sizer.get_sizing(field.name);
            let definitionDetail = GlobalViz.vis?.d3text_sizer.get_sizing(field.definition);
            this.height = nameDetail.height > this.height ? nameDetail.height : this.height;
            this.height = definitionDetail.height > this.height ? definitionDetail.height : this.height;
            if (field.has_input) {
                this.hasInput = true;
                this.nameOffset.set(field.name, nameDetail.width);
            }
            this.nameWidth = nameDetail.width > this.nameWidth ? nameDetail.width : this.nameWidth;
            this.definitionWidth = definitionDetail.width > this.definitionWidth ? definitionDetail.width : this.definitionWidth;
            // Get the sizing for the X button
            let closeDetail = GlobalViz.vis?.d3text_sizer.get_sizing("x");
            this.xHeight = closeDetail.height + this.marginY;
            this.xWidth = closeDetail.width + (this.marginY * 2);
        }
    }

    get closerXPosition() {
        if (! this.sized) this._get_sizing();
        return this.rowWidth - this.xWidth;
    }

    inputX(fieldName) {
        if (! this.sized) this._get_sizing();
        return this.nameOffset.get(fieldName) + (this.marginX / 2);
    }

    get inputY() {
        if (! this.sized) this._get_sizing();
        return this.marginY / 2
    }

    get inputWidth() {
        if (! this.sized) this._get_sizing();
        return (this.hasInput) ? (this.rowHeight - this.marginY) : 0;
    }

    get rowWidth() {
        if (! this.sized) this._get_sizing();
        return this.nameWidth + this.inputWidth + this.buffer + this.definitionWidth + this.marginX;
    }

    get rowHeight() {
        if (! this.sized) this._get_sizing();
        return this.height + this.marginY;
    }

    get twixText() {
        if (! this.sized) this._get_sizing();
        return this.marginX + this.nameWidth;
    }

    get leftTextAnchorX() {
        if (! this.sized) this._get_sizing();
        return (this.marginX / 2);
    }

    get centerTextAnchorX() {
        if (! this.sized) this._get_sizing();
        return (this.rowWidth / 2);
    }

    get rightTextAnchorX() {
        if (! this.sized) this._get_sizing();
        return this.rowWidth - (this.marginX / 2);
    }

    get rowMidPoint() {
        if (! this.sized) this._get_sizing();
        return this.rowHeight / 2;
    }

    get tableHeight() {
        if (! this.sized) this._get_sizing();
        return this.rowHeight * this.rows;
    }

    get fullWidth() {
        if (! this.sized) this._get_sizing();
        return this.rowWidth;
    }

    get fullHeight() {
        if (! this.sized) this._get_sizing();
        return this.height + this.marginY;
    }

    get totalHeight() {
        if (! this.sized) this._get_sizing();
        return this.fullHeight * this.rows;
    }

    get targetPoints() {
        if (! this.sized) this._get_sizing();
        let northX = this.rowWidth / 2;
        let northY = 0 - (this.marginX / 2);
        let southX = this.rowWidth / 2;
        let southY = this.tableHeight + (this.marginX / 2);
        let westX = 0 - (this.marginX / 2);
        let westY = this.tableHeight / 2;
        let eastX = this.rowWidth + (this.marginX / 2);
        let eastY = this.tableHeight / 2;
        return [
            { x: northX, y: northY},
            { x: southX, y: southY},
            { x: westX, y: westY},
            { x: eastX, y: eastY}
        ];
    }

    get radius() {
        if (! this.sized) this._get_sizing();
        return this.totalHeight > this.fullWidth ? this.totalHeight / 1.8 : this.fullWidth / 1.8;
    }

}
