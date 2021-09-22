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
        this.height =  MINHEIGHT;
        this.nameWidth = MINNAMEWIDTH;
        this.definitionWidth = MINDEFWIDTH;
        this.buffer = BUFFERWIDTH;
        this.marginX = MARGINX;
        this.marginY = MARGINY;
        this.nameOffset = new Map();
        this._get_sizing(fieldArray);
    }

    _get_sizing(fieldArray) {
        this.hasInput = false;
        for (let field of fieldArray) {
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
        return this.rowWidth - this.xWidth;
    }

    inputX(fieldName) {
        return this.nameOffset.get(fieldName) + (this.marginX / 2);
    }

    get inputY() {
        return this.marginY / 2
    }

    get inputWidth() {
        return (this.hasInput) ? (this.rowHeight - this.marginY) : 0;
    }

    get rowWidth() {
        return this.nameWidth + this.inputWidth + this.buffer + this.definitionWidth + this.marginX;
    }

    get rowHeight() {
        return this.height + this.marginY;
    }

    get twixText() {
        return this.marginX + this.nameWidth;
    }

    get leftTextAnchorX() {
        return (this.marginX / 2);
    }

    get centerTextAnchorX() {
        return (this.rowWidth / 2);
    }

    get rightTextAnchorX() {
        return this.rowWidth - (this.marginX / 2);
    }

    get rowMidPoint() {
        return this.rowHeight / 2;
    }

    get tableHeight() {
        return this.rowHeight * this.rows;
    }

    get fullWidth() {
        return this.rowWidth;
    }

    get fullHeight() {
        return this.height + this.marginY;
    }

    get totalHeight() {
        return this.fullHeight * this.rows;
    }

    get targetPoints() {
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
        return this.totalHeight > this.fullWidth ? this.totalHeight / 1.8 : this.fullWidth / 1.8;
    }

}
