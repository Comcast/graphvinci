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

import Visualizer from '../Visualizer.js';
import ExpandableStack from "./ExpandableStack";
import CustomViewCategory from "./CustomViewCategory";
import CustomView from "./CustomView";
import MenuData from "./MenuData";
import VerticalMenu, {DEFAULTWIDTH, DEFAULTHEIGHT} from "../burger_menu/VerticalMenu";

export default class SavedViewsMenu extends VerticalMenu {

    _get_menu_data(refresh) {
        let self = this;
        /*
        Force a refresh if the schema has changed
         */
        let currentName = Visualizer.config.get_current_schema().name;
        if (this.lastSchema) {
            if (currentName !== this.lastSchema) refresh = true;

        }
        this.lastSchema = currentName;


        if (! refresh && this.data) return;
        this.data = new MenuData();
        let categoryMap = new Map();
        let update_func = function() {
            self.update_state();
        }
        let viewsStack = new ExpandableStack(DEFAULTWIDTH, DEFAULTHEIGHT, "Concierge", "Saved Views", update_func);
        if (this.openTo) viewsStack.expanded = true;
        this.data.add_child(viewsStack);
        let cvs = Visualizer.concierge.get_current_list();
        let first = true;
        if (this.openTo) first = false;
        for (let customView of cvs) {
            if (! categoryMap.has(customView.category)) {
                let cat = new CustomViewCategory(DEFAULTWIDTH, DEFAULTHEIGHT - 5, "CVCat", customView.category);
                categoryMap.set(customView.category, cat);
                viewsStack.add_child(cat);
                if (first || customView.category === this.openTo?.name) {
                    cat.expanded = true;
                    first = false;
                }
            }
            let category = categoryMap.get(customView.category);
            category.add_child(new CustomView(DEFAULTWIDTH, DEFAULTHEIGHT - 5, "CV", customView.category, customView.name))
        }
    }

}
