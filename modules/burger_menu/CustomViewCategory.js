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