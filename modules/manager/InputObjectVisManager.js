import ClassNodeSizer from './ClassNodeSizer.js';
import * as d3 from "d3";
import Visualizer from "../Visualizer";

export default class InputObjectVisManager {
    constructor(node) {
        this.node = node;
    }

    build(group) {
        this.group = group;
        this.fieldArray = this.get_array();
        this.sizing = new ClassNodeSizer(this.fieldArray);

        // Create the master container, if it doesn't already exist using a single-element array
        let master = d3.select(this.group)
            .append('g')
            .attr('class', "masterGroup")
            .attr("transform", () => {
                return "translate(-" + (this.sizing.rowWidth / 2) + ",-" + (this.sizing.tableHeight / 2) + ")";
            });

        // Append the "subdermal" color layer
        master.append('g')
            .attr('class', "subgroup")
            .append('rect')
            .attr('class', "subdermis")
            .attr('width', this.sizing.rowWidth)
            .attr('height', this.sizing.tableHeight)
            .attr('fill', Visualizer.d3utils.get_color(this.node.domain));

        // Remove and re-create the incoming attachment points
        this._append_incoming_group(master);

        this._manage_rows(master);

        // Apply the "epidermis" top layer
        master.append('g')
            .attr('class', "overlay")
            .append('rect')
            .attr('class', "epidermis")
            .attr('width', this.sizing.rowWidth)
            .attr('height', this.sizing.tableHeight)
            .attr('stroke', Visualizer.d3utils.get_node_color(this.node))
            .attr('stroke-width', 4)
            .attr('rx', 4)
            .attr('fill', "none");

    }

    _manage_rows(master) {
        let self = this;
        let rowGroup = master.selectAll('.rows')
            .data(this.fieldArray)
            .enter()
            .append('g')
            .attr('class', 'rows')
            .attr('filterName', d => d.name)
            .attr("transform", function (d, i) {
                let x = 0;
                let y = i * self.sizing.fullHeight;
                return "translate(" + x + "," + y + ")";
            });


        rowGroup.append('rect')
            .attr("width", this.sizing.rowWidth)
            .attr("height", this.sizing.rowHeight)
            .attr('fill', "white")
            .attr('rx', 3)
            .style("opacity", function(d,i) {
                switch(d.rootKind) {
                    case("Header"):
                        return 0.2;
                    case("OBJECT"):
                    case("INTERFACE"):
                    case("UNION"):
                        return (i % 2) ? 0.4 : 0.5;
                    default:
                        return (i % 2) ? 0.8 : 0.9;
                }
            });

        let header = rowGroup.filter(d => d.rootKind === 'Header');

        header.append('text')
            .text(d => d.name)
            .attr('class', "headerText")
            .attr('x', self.sizing.centerTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');

        header.selectAll('.entitySelector')
            .data([{side: "left"},{side:"right"}])
            .enter()
            .append('circle')
            .attr('class', 'entitySelector')
            .attr("r", 0)
            .attr('cx', d => {
                return (d.side === "left") ? 0 : self.sizing.rowWidth;
            })
            .attr('cy', self.sizing.rowMidPoint)
            .attr("fill", function (d) {
                return "black";
            });

        let fieldRows = rowGroup.filter(d => d.rootKind !== 'Header');

        fieldRows.append('text')
            .text(d => d.name)
            .attr('class', "leftText")
            .attr('x', self.sizing.leftTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .attr('alignment-baseline', 'middle');

        fieldRows.append('text')
            .text(d => d.definition)
            .attr('class', "rightText")
            .attr('x', self.sizing.rightTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'end');

        fieldRows.filter(d => d.rootKind === 'INPUT_OBJECT' || d.rootKind === 'ENUM')
            .selectAll('.sourceSelector')
            .data([{side: "left"},{side:"right"}])
            .enter()
            .append('circle')
            .attr('class', 'sourceSelector')
            .attr("r", 0)
            .attr('cx', d => {
                return (d.side === "left") ? 0 : self.sizing.rowWidth;
            })
            .attr('cy', self.sizing.rowMidPoint)
            .attr("fill", function (d) {
                return "black";
            });

        fieldRows.selectAll('rect')
            .filter(d => d.rootKind === 'INPUT_OBJECT')
            .attr('stroke',"#444")
            .attr('stroke-width', 3);

    }

    _append_incoming_group(master) {

        master.selectAll('.incomingSelector')
            .data(this.sizing.targetPoints)
            .enter()
            .append('circle')
            .attr('class', "incomingSelector")
            .attr("r", 0)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr("fill", function (d) {
                return "black";
            });

    }

    get_array() {
        // Create array copy
        let rowsArray = [{rootKind: "Header", name: this.node.id}];
        for (let field of this.node.fields) {
            rowsArray.push(field);
            //field.definition = field.rootName;
        }
        rowsArray.sort((a, b) => {
            if (a.rootKind === 'Header') return -1; // Always first
            if (b.rootKind === 'Header') return 1;
            /*
            if (a.rootKind !== b.rootKind) {
                if (a.rootKind === 'INPUT_OBJECT' || a.rootKind === 'ENUM') {
                    return 1;
                }
                else {
                    return -1;
                }
            }

             */
            return a.name.localeCompare(b.name);
        });

        return rowsArray;
    }

    getSourceConnectionPoint(fieldName, destination) {
        let selector = d3.select(this.group)
            .selectAll('.sourceSelector')
            .filter(function(d) {
                return d3.select(this.parentNode).attr('filterName') === fieldName;
            });
        let candidates = this.getCandidates(selector);
        return Visualizer.d3utils.get_closest_point(destination, candidates);
    }

    getIncomingConnectionPoint(source) {
        let selector = d3.select(this.group)
            .selectAll('.incomingSelector');
        let candidates = this.getCandidates(selector);
        return Visualizer.d3utils.get_closest_point(source, candidates);
    }

    getEntityConnectionPoint(source) {
        let selector = d3.select(this.group)
            .selectAll('.entitySelector');
        let candidates = this.getCandidates(selector);
        return Visualizer.d3utils.get_closest_point(source, candidates);
    }

    getCandidates(selection) {
        let candidates = [];
        selection.each(function () {
            candidates.push(Visualizer.d3utils.get_circle_XY(this));
        });
        return candidates;
    }

}