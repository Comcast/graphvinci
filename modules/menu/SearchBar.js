import * as d3 from "d3";
import Visualizer from "../Visualizer";

export default class SearchBar {
    constructor(parentDiv) {
        this.parentDiv = parentDiv;
        this.needsClearing = false;
    }

    build() {
        /*
        Disabling search until it can be worked some more
         */
        return;
        let self = this;
        this.searchContainer = this.parentDiv.append('div')
            .attr('class', "textsearch")
            .append('input')
            .attr('class', "searchtext")
            .attr('type', "text")
            .attr('placeholder', "Search the graph")
            .on('keyup', function() {
                if (this.value.length < 2) {
                    self.clear(false);
                }
                else {
                    self.needsClearing = true;
                    self.filter(this.value);
                }
            });
    }

    filter(textString) {
        let needsKick = false;
        d3.selectAll('.nodeEntry')
            .classed('quiet', d => {
                let hasString = this._filter_node(d, textString);
                d.isTextFiltered = hasString;
                if (d.nvm.open !== !hasString) {
                    needsKick = true;
                    d.nvm.open = !hasString;
                    d.nvm.build();
                }
                return hasString;
            });
        d3.selectAll('.edgeline')
            .classed('quiet', () => {
                return true;
            });
        if (needsKick) {
            Visualizer.graph.kick();
        }
    }

    clear(clearText) {
        if (! this.needsClearing) return;
        this.needsClearing = false;
        if (clearText) {
            this.searchContainer.each(function() {
                this.value = "";
            })
        }
        let needsKick = false;
        d3.selectAll('.nodeEntry')
            .classed('quiet', d => {
                d.isTextFiltered = false;
                if (d.nvm.open !== false) {
                    needsKick = true;
                    d.nvm.open = false;
                    d.nvm.build();
                }
                return false;
            });
        d3.selectAll('.edgeline')
            .classed('quiet', () => {
                return false;
            });
        if (needsKick) {
            Visualizer.graph.kick();
        }
    }

    _filter_node(node, textString) {
        let normString = textString.toUpperCase();
        if (node.id.toUpperCase().includes(normString)) {
            return false;
        }
        if (typeof(node.fieldKeys) === 'undefined' || node.fieldKeys === null) {
            return true;
        }
        for (let field of node.fieldKeys) {
            if (field.toUpperCase().includes(normString)) {
                return false;
            }
        }
        return true;
    }

}
