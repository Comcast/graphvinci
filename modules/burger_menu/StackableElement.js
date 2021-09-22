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

export default class StackableElement {
    constructor(width, height, type, noprune) {
        this._expanded = false;
        this.width = width;
        this.height = height;
        this.type = type;
        this.children = [];
        this.pruned = false;
        this.noprune = noprune;
    }

    set expanded(expanded) {
        this._expanded = expanded;
    }

    get expanded() {
        if (this._expanded) return this._expanded;
        if (this.has_children) {
            for (let child of this.children) {
                if (child.expanded) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    get is_stack_pruned() {
        if (this.noprune) {
            return false;
        }
        if (this.pruned) {
            return true;
        }
        if (this.has_children) {
            for (let child of this.children) {
                if (! child.is_stack_pruned) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }

    get has_children() {
        return this.children.length !== 0;
    }

    get has_parent() {
        return (typeof(this.parent) !== 'undefined')
    }

    get depth() {
        return this.parent.depth + 1;
    }

    get is_visible() {
        if (this.has_parent) {
            return this.parent.is_visible && this.parent.expanded;
        }
        else {
            return true;
        }
    }

    contract() {
        this.expanded = false;
    }

    expand() {
        for (let child of this.parent.children) {
            child.contract();
        }
        this.expanded = true;
        if (this.parent.expand) {
            this.parent.expand();
        }
    }

    set_parent(element) {
        this.parent = element;
    }

    add_child(element) {
        this.children.push(element);
        element.set_parent(this);
    }

}
