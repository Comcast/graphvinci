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

import * as d3 from "d3";
import GlobalViz from "../GlobalViz";
import SchemaDomain from "../schema/SchemaDomain.js";
import {states} from '../config/DomainState.js';
import WheelManager from "../wheel/WheelManager";
import SavedViewsMenu from "../burger_menu/SavedViewsMenu";

const SCALE = 7;
const MINCHARGE = 10000;
const MAXCHARGE = 10000;
const CONDUR1 = 3000;
const CONDUR2 = 750;

export default class Graph {

    constructor() {
        this.wheelManager = new WheelManager();
        this.verticalMenu = new SavedViewsMenu();
    }

    build(parentDiv, schema) {
        this.parentDiv = parentDiv;
        this.parentDiv.selectAll('*').remove();
        let self = this;
        this.parentSvg = this.parentDiv.append("svg")
            .attr("width", '100%')
            .attr("height", '100%');

        this.parentSvg.attr("viewBox", [0, 0, this.current_width * SCALE, this.current_height * SCALE]);

        this.svg = this.parentSvg.append("g").attr("cursor", "grab").attr('stopHierarchy', "true");

        this.zoom = d3.zoom()
            .extent([[0, 0], [this.current_width, this.current_height]])
            .scaleExtent([0.2, 20])
            .on("zoom", zoomed)

        this.parentSvg.call(this.zoom)
            .on("dblclick.zoom", null);

        function zoomed() {
            self.currentZoom = d3.event.transform;
            self.svg.attr("transform", d3.event.transform);
        }

        this.simulation = d3.forceSimulation();
        this.run_viz(schema);
        this.wheelManager.build(parentDiv);
        this.verticalMenu.render({masterDiv: parentDiv});
    }

    kick() {
        this.simulation.alpha(0.05).restart();
        /*

        Leaving this as a reminder of how to do a delayed action on the graph

        let self = this;
        clearTimeout(this.resizeTimer);

        this.simulation.alphaTarget(0.1).restart();
        this.resizeTimer = setTimeout(function(){
            self.simulation.alphaTarget(0).restart();
        }, 250);
         */
    }

    apply_current_size() {
        let h = this.current_height;
        let w = this.current_width;
        //this.simulation.force("center", d3.forceCenter((w / 2) * SCALE, (h / 2) * SCALE))
        let fx = d3.forceX(d => {
            if (typeof (d.parent) !== 'undefined' && typeof (d.parent.x) !== 'undefined') {
                d.pullParent = true;
                return d.x;
            }
            //let q = ((w * SCALE) / 100) * 40;
            let q = 1;
            return ((w * SCALE) + q) / 2;
        }).strength(d => {
            return (d.pullParent) ? 2 : 0.1;
        });
        let fy = d3.forceY(d => {
            if (typeof (d.parent) !== 'undefined' && typeof (d.parent.y) !== 'undefined') {
                d.pullParent = true;
                return d.y;
            }
            return (h * SCALE) / 2;
        }).strength(d => {
            return (d.pullParent) ? 2 : 0.3;
        });
        this.simulation.force("x", fx);
        this.simulation.force("y", fy);
        let charge = Math.pow((100 / this.nodeCount), 2) * 1000;
        let boundedCharge = -Math.min(Math.max(charge, MINCHARGE), MAXCHARGE);

        this.simulation.force('charge', d3.forceManyBody().strength(d => {
            if (d instanceof SchemaDomain) {
                return boundedCharge * 15;
            }
            return boundedCharge; // * multiplier;
        }));

        //Its a nice idea, if you really like your visualization to shake like a neurotic chihuahua
        //this.simulation.force('collision', d3.forceCollide().radius(function(d) {
        //    return d.nvm.sizing.radius;
        //}))
        this.simulation.alpha(0.6).restart();
    }

    clear_window() {
        this.svg.selectAll("*").remove();
        let arrows = [
            {id: 'arrowhead', class: 'linkline regulararrow', reverse: false},
            {id: 'qarrowhead', class: 'linkline queryarrow', reverse: false},
            {id: 'marrowhead', class: 'linkline mutationarrow', reverse: false},
            {id: 'rarrowhead', class: 'linkline regulararrow', reverse: true}
        ];
        this.svg.selectAll('marker')
            .data(arrows)
            .enter()
            .append('marker')
            .attr('id', d => d.id)
            .attr('viewBox', '-0 -3 10 6')
            .attr('refX', d => (d.reverse) ? 0 : 10)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('class', d => d.class)
            .attr('d', d => (d.reverse) ? 'M 10,-3 L 0 ,0 L 10,3' : 'M 0,-3 L 10 ,0 L 0,3');
    }


    run_viz(schema) {
        this.schema = schema;
        this.clear_window();
        this.linkGroup = this.svg.append("g")
            .attr("class", "link");

        this.nodeGroup = this.svg.append("g")
            .attr("class", "node");

        this.update_viz();

    }

    re_parent() {
        //if (this.reParented) return;
        for (let d of GlobalViz.vis?.schema.nodes) {
            if (typeof (d.parent) !== 'undefined' &&
                typeof (d.parent.x !== 'undefined')) {
                d.x = this._randomize(d.parent.x, 200);
            }
            if (typeof (d.parent) !== 'undefined' &&
                typeof (d.parent.y !== 'undefined')) {
                d.y = this._randomize(d.parent.y, 200);
            }
        }
    }

    unstick() {
        for (let d of GlobalViz.vis?.schema.nodes) {
            d.fx = null;
            d.fy = null;
        }
        this.kick();
    }

    reset_zoom() {
        if (this.currentZoom !== d3.zoomIdentity) {
            this.parentSvg.transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .call(this.zoom.transform, d3.zoomIdentity);
            this.currentZoom = d3.zoomIdentity;
            return 1000;
        }
        else {
            return 0;
        }
    }

    stick() {
        for (let d of GlobalViz.vis?.schema.nodes) {
            d.fx = d.x;
            d.fy = d.y;
        }
        this.kick();
    }

    update_viz(conciergeState) {
        let self = this;
        this.conciergeMode = !!(conciergeState);
        let nodeEdgeData = GlobalViz.vis?.schema.nodes_and_edges(GlobalViz.vis?.domainState, conciergeState);
        let nodeData = nodeEdgeData.nodes;
        this.nodeCount = nodeData.length;
        let edgeData = nodeEdgeData.edges;
        let link = this.linkGroup
            .selectAll(".edgeline")
            .data(edgeData, d => d.id);
        link.exit().remove();

        link.enter()
            .append("path")
            .attr('class', "edgeline")
            .attr("stroke-dasharray", d => {
                switch(d.nodeFrom.superType) {
                    case "UNION":
                        if (d.fieldSource.isUnion) {
                            return "3,3"
                        }
                        else {
                            return "none"
                        }
                    case "INTERFACE":
                        if (d.fieldSource.isInterface) {
                            return "6,6"
                        }
                        else {
                            return "none"
                        }
                    default: return "none"
                }
            })
            .attr("stroke-width", d => {
                if (d.source instanceof SchemaDomain && d.target instanceof SchemaDomain) {
                    return 7;
                }
                return (d.source.type === 'Entity') ? 2 : 3;
            })
            .attr("marker-end", d => {
                switch (d.source.type) {
                    case "Query":
                        return 'url(#qarrowhead)';
                    case "Mutation":
                        return 'url(#marrowhead)';
                    default:
                        return 'url(#arrowhead)';
                }
            })
            .attr("marker-start", d => {
                return (d.biDirectional) ? 'url(#rarrowhead)' : "none";
            })
            .attr('fill', 'none')
            .on('dblclick', function(d) {
                // Quick hack for visualizations and such.  It will get re-added whenever
                // the graph is updated
                d3.select(this).remove();
            });

        let node = this.nodeGroup
            .selectAll(".nodeEntry")
            .data(nodeData, d => d.id);
        if (conciergeState) {
            node.exit().remove();
        } else {
            node.exit().transition().delay((d, i) => {
                if (d instanceof SchemaDomain) return 0;
                return Math.random() * 500;
                //return i * 100;
            }).remove();
        }


        /*
        Set undefined x and y to parent's if possible
         */
        if (!conciergeState) {
            node.each(d => {
                if (typeof (d.parent) !== 'undefined' &&
                    typeof (d.parent.x !== 'undefined')) {
                    d.x = self._randomize(d.parent.x, 200);
                }
                if (typeof (d.parent) !== 'undefined' &&
                    typeof (d.parent.y !== 'undefined')) {
                    d.y = self._randomize(d.parent.y, 200);
                }
            });
        }

        node = node.enter()
            .append("g")
            .attr('class', "nodeEntry")
            .attr("transform", function (d) {
                let x = (typeof (d.x) === 'undefined') ? -10000 : d.x;
                let y = (typeof (d.y) === 'undefined') ? -10000 : d.y;

                return "translate(" + ~~x + "," + ~~y + ")";
            })

        node.call(d3.drag()
            .on("start", d => self.dragstarted(d))
            .on("drag", d => self.dragged(d))
            .on("end", d => self.dragended(d)));

        node.each(function (d) {
            d.nvm.build(this);
        });

        node.on('dblclick', d => {

            if (d instanceof SchemaDomain) {
                //this.re_parent();
                GlobalViz.vis?.domainState.set_domain_state(d.name, states.NODES);
                //this.update_viz();
            }

            d.nvm.open = !d.nvm.open;
            d.nvm.build(undefined, undefined, function() { self.keepmoving() }, function() { self.stopmoving() });
            //self.domainState.exclude_domain(d.domain);
            //self.update_viz();
        });

        this.simulation
            .nodes(nodeData)
            .on("tick", () => self.ticked());


        this.simulation.force("link", d3.forceLink().links(edgeData).distance(d => {
            if (d.source instanceof SchemaDomain || d.target instanceof SchemaDomain) {
                return 600;
            }
            return 150;
        }).strength(d => {
            if (d.source instanceof SchemaDomain || d.target instanceof SchemaDomain) {
                return 1.1;
            }
            return 2;
        }));
        self.apply_current_size();
        if (conciergeState) {
            this.conciergeMode = true;
            this._concierge_positioning_nodes(conciergeState);
        }
        this.wheelManager.update();
    }

    _concierge_positioning_nodes(conciergeState) {
        let self = this;
        this.re_parent();
        this.ticked(); // Give the nodes a position to move from
        let zs = conciergeState.currentZoom;
        if (zs) {
            let newZoom = d3.zoomIdentity.translate(zs.x, zs.y).scale(zs.k);
            this.parentSvg.transition()
                .duration(CONDUR1 + CONDUR2)
                .ease(d3.easeLinear)
                .call(this.zoom.transform, newZoom);
        }


        this.keepmoving();

        let fadeEdges = true;
        d3.selectAll('.nodeEntry')
            .transition()
            .attr("transform", function (d) {
                d.x = d.posX;
                d.fx = d.posX;
                d.y = d.posY;
                d.fy = d.posY;
                return "translate(" + d.posX + "," + d.posY + ")";
            })
            .duration(CONDUR1)
            .on("end", () => {
                if (fadeEdges) {
                    fadeEdges = false;
                    self.conciergeMode = false;
                    self.stopmoving();
                    d3.selectAll('.nodeEntry')
                        .each(d => {
                            d.nvm.open = !!(conciergeState.nodes[d.id].open);
                            d.nvm.build();
                        });
                }
            })
    }

    ticked() {
        /*
        Do some magic to calculate the best attachment points
         */
        //console.log(this.simulation.alpha());
        if (this.simulation.alpha() > 0.5) return;
        let links = d3.selectAll(".edgeline");
        links.each(d => {
            let targetXY = {
                x: d.target.x,
                y: d.target.y
            };
            let fieldName = d.fieldSource.name;
            d.sourceCalc = d.source.nvm.getSourceConnectionPoint(fieldName, targetXY);

            if (! d.sourceCalc) {
                d.sourceCalc = {
                    x: 0,
                    y: 0
                }
                d.targetCalc = {
                    x: 0,
                    y: 0
                }
                //console.log("Here")
                return;
            }

            //d.sourceCalc = d.source.nvm.getIncomingConnectionPoint(targetXY);
            if (d.source.type === 'Entity' || d.source.type === 'Domain') {
                d.targetCalc = d.target.nvm.getIncomingConnectionPoint(d.sourceCalc);
            } else {
                d.targetCalc = d.target.nvm.getEntityConnectionPoint(d.sourceCalc);
            }
        });

        links.attr("d", d => {
            if (! d.targetCalc) {
                d.targetCalc = {
                    x: 100,
                    y: 100
                }
            }
            let dr = (d.source instanceof SchemaDomain && d.target instanceof SchemaDomain) ? 6000 : 4000000;
            return "M" +
                d.sourceCalc.x + "," +
                d.sourceCalc.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.targetCalc.x + "," +
                d.targetCalc.y;
        });

        if (this.conciergeMode) return;

        d3.selectAll('.nodeEntry')
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })

    }

    _randomize(val, spread) {
        return (Math.random() > 0.5) ? val + (Math.random() * spread) : val - (Math.random() * spread);
    }

    keepmoving() {
        this.simulation.alphaTarget(0.01).restart();
    }

    stopmoving() {
        this.simulation.alphaTarget(0);
    }

    dragstarted(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0.01).restart();
        d.fx = d.x;
        d.fy = d.y;
        this.svg.attr("cursor", "grabbing");
    }

    dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    dragended() {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0);
        }
        this.svg.attr("cursor", "grab");
    }

    get current_height() {
        return parseInt(this.parentSvg.style('height'), 10);
    }

    get current_width() {
        return parseInt(this.parentSvg.style('width'), 10);
    }

    posData() {
        let posData = {};
        posData.domainKey = GlobalViz.vis?.domainState.get_key();
        posData.currentZoom = this.currentZoom;
        posData.nodes = {};
        posData.edges = {};
        d3.selectAll('.nodeEntry').each(d => {
                    posData.nodes[d.id] = {
                        id: d.id,
                        posX: d.x,
                        posY: d.y,
                        open: d.nvm.open

                    }
                });
        d3.selectAll('.edgeline').each(d => {
                    posData.edges[d.id] = {
                        id: d.id
                    }
                });
        return posData;
    }

}
