import Visualizer from "../Visualizer";

export default class VisManager {
    constructor(node) {
        this.node = node;
    }

    build(group) {
        throw new TypeError(this.methodCarp("build"));
    }

    getCandidates(selection) {
        let candidates = [];
        selection.each(function () {
            candidates.push(Visualizer.d3utils.get_circle_XY(this));
        });
        return candidates;
    }

    getSourceConnectionPoint() {
        throw new TypeError(this.methodCarp("getSourceConnectionPoint"));
    }

    getIncomingConnectionPoint() {
        throw new TypeError(this.methodCarp("getIncomingConnectionPoint"));
    }

    getEntityConnectionPoint() {
        throw new TypeError(this.methodCarp("getEntityConnectionPoint"));
    }

    methodCarp(method) {
        return 'Classes extending the VisManager abstract class must have a ' + method + ' method';
    }

    get_chunker(edgeLength, rx) {
        let start = "M" + edgeLength + " " + edgeLength + " ";
        let s1 = "L" + rx + " " + edgeLength + " Q0 " + edgeLength + " 0 " + (edgeLength - rx) + " ";
        let s2 = "L0 " + rx + " Q0 0 " + rx + " 0 ";
        let s3 = "L" + (edgeLength - rx) + " 0 Q" + edgeLength + " 0 " + edgeLength + " " + rx + " ";
        let s4 = "L" + edgeLength + " " + edgeLength;
        return start + s1 + s2 + s3 + s4;
    }

    add_input_decoration(rowGroup) {
        let sizer = this.sizing.inputWidth;
        let hs = sizer / 2;
        let clazz = "dectypesmall";
        let inputRows = rowGroup.filter(d => d.has_input)
            .append('g')
            .attr('class', "mousepointer")
            .attr('transform', d => {
                return "translate(" + (this.sizing.inputX(d.name) + 5) + "," + this.sizing.inputY + ")";
            })
            .on('click', d => Visualizer.input_display.build(d));

        inputRows.append("path")
            .attr('class', "decorated")
            .attr('d', this.get_chunker(sizer, hs))
            .attr('transform', "rotate(135 " + hs + " " + hs + ")")
            .attr("stroke", "none")
            .attr("fill", "#575757");
        inputRows.append("text")
            .text("I")
            .attr('class', clazz)
            .attr('x', sizer / 2)
            .attr('y', sizer / 2 + 2)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');
    }
}