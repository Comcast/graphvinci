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

import QueryMenu from "../menu/QueryMenu";


export default class FlippableWindow {
    constructor(views) {
        this.viewMap = new Map();
        for (let view of views) {
            if (! this.currentView) {
                this.currentView = view.instance;
                this.currentState = view.type;
            }
            let name = view.name;
            this.viewMap.set(name, view);
        }
        this.views = views;

    }

    flip_to(state, revert_millis) {
        let self = this;
        let previous_state = this.currentState;
        this.state = state;
        for (let view of this.views) {
            if (view.type === state) {
                this.currentView = view.instance;
                this.currentView.build(this.inner);
                this.currentState = view.type;
                this.menu.switch_mode(state);
                this.update();
                if (revert_millis) {
                    setTimeout(() => {
                        self.flip_to(previous_state);
                    }, revert_millis)
                }
                return;
            }
        }

    }

    build(container) {
        let self = this;
        this.container = container;
        this.container.selectAll('*').remove();
        this.inner = this.container.append('div').attr('class', 'flippableinner');
        this.menu = new QueryMenu(this.container.append('div').attr('class', 'flippablemenu').style('z-index', 2))
        for (let view of this.views) {
            this.menu.add_button(view.type, view.image, view.description, () => {
                self.currentState = view.type;
                self.currentView = view.instance;
                self.currentView.build(self.inner)
                self.update();
            })
        }
        this.currentView.build(this.inner)
        this.menu.build();
        this.menu.switch_mode(this.currentState);
    }

    update(data) {
        this.data = (data) ? data : this.data;
        if (this.data) {
            this.currentView.update(this.data)
        }
    }

    refresh() {
        this.currentView.refresh()
    }
}
