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

export default class MenuData {
    constructor() {
        this.children = [];
        this.depth = 0;
    }

    set_open_to(openTo) {
        /*
        This closes everything except the first entity that id-matches.  Any object can be passed in, as long as it
        has an id function
         */
        let openId = null;
        if (openTo) openId = openTo.id || openTo.name;
        for (let child of this.children) {
            this._open_by_id(child, openId);
        }
    }

    _open_by_id(tile, openId) {
        //if (tile.id === openId) tile.expand();
        tile.expanded = tile.id === openId ? true : false;
        for (let child of tile.children) {
            this._open_by_id(child, openId);
        }

    }

    get_tiles() {
        let list = [];
        for (let child of this.children) {
            this._get_tiles(child, list);
        }
        return list;
    }

    _get_tiles(entry, list) {
        if (entry) list.push(entry);
        if (entry.has_children) {
            for (let child of entry.children) {
                this._get_tiles(child, list);
            }
        }
    }

    get max_depth() {
        this._max_depth = 0;
        for (let tile of this.children) {
            this._get_depth(tile);
        }
        return this._max_depth;
    }

    _get_depth(tile) {
        this._max_depth = (this._max_depth < tile.depth) ? this._max_depth : tile.depth;
        if (tile.has_children) {
            for (let child of tile.children) {
                this._get_depth(child);
            }
        }
    }

    add_child(element) {
        this.children.push(element);
        element.set_parent(this);
    }

}
