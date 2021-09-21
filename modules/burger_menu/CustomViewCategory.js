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

import StackableElement from "./StackableElement.js";
import {CONTRASTCOLOR} from "./VerticalMenu";

export default class CustomViewCategory extends StackableElement  {
    constructor(width, height, type, category) {
        super(width, height, type);
        this.category = category;
    }

    get id() {
        return "CustomViewCategory_" + this.category;
    }

    buildFunction(group) {
        group.append('text')
            .text(this.category)
            .attr('x', d => d.width / 2)
            .attr('y', d => d.height / 2)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('stroke', CONTRASTCOLOR)
    }

}
