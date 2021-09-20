import StackableElement from "./StackableElement.js";
import {CONTRASTCOLOR} from "./VerticalMenu.js";
import Visualizer from "../Visualizer";

export default class ExpandableStack extends StackableElement  {
    constructor(width, height, type, text, menu_update_func) {
        super(width, height, type, true);
        this.menu_update_func = menu_update_func;
        this.text = text;
    }

    get id() {
        return this.type;
    }

    buildFunction(group) {
        group.append('text')
            .text(this.text)
            .attr('x', d => d.width / 2)
            .attr('y', d => d.height / 2)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('stroke', CONTRASTCOLOR)

        group.append('rect')
            .attr('width', d => this.width)
            .attr('height', d => this.height)
            .attr('opacity', 0)
            .attr('fill', "#fff")
            .classed('mousepointer', true)
            .on('click', d => {
                let current = d.expanded;
                Visualizer.graph.verticalMenu.set_open_to(null);
                if (current) {
                    d.contract();
                }
                else {
                    d.expand();
                }
                this.menu_update_func();
            })
    }

}