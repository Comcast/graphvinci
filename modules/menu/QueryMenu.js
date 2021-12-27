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

import ModeButton from "./ModeButton";

export const DEFAULTHEIGHT = 40;
export const DEFAULTWIDTH = 40;
import HMenu, {MenuData, Separator} from "./HMenu";

export const topStates = {
    Tree: 0,
    Meta: 1,
    Saved: 2
};

export const bottomStates = {
    Tree: 0,
    Json: 1
};


export default class QueryMenu extends HMenu {
    constructor(parentDiv) {
        super(parentDiv)
        this.data = new MenuData();
        this.data.add_entry(new Separator(8, DEFAULTHEIGHT, "Entity"));
        this.state = 0;
    }

    build() {
        super.build()
        this.parentDiv.style('width', this.data.width + 'px')
    }

    update_state() {
        super.update_state(this.state)
    }

    add_button(state, image, description, func) {
        let self = this;
        this.data.add_entry(new ModeButton(DEFAULTHEIGHT, DEFAULTWIDTH, state, image, description, () => {
            self.switch_mode(state)
            func()
        }));
        this.data.add_entry(new Separator(6, DEFAULTHEIGHT, "Entity"));
    }

    switch_mode(mode) {
        this.state = mode;
        this.update_state()
    }
}
