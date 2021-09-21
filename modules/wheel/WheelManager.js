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

import * as d3 from "d3";
import Visualizer from "../Visualizer";
import SchemaDomain from "../schema/SchemaDomain";
import {states} from "../config/DomainState";
import {BORDER} from "../burger_menu/VerticalMenu";

export default class WheelManager {
    constructor() {
        this.segmentsPerWheel = 14;
        this.innerRadius = 50;
        this.semiArc = d3.arc();
        this.pie = d3.pie()
            .value(function (d) {
                return d.value;
            })

    }

    build(container) {
        this.initialized = true;
        this.parentDiv = container;
        let parentHeight = this.parentDiv.style('height').slice(0, -2);
        this.height = this.width = Math.max(200, parentHeight / 4);

        this.container = this.parentDiv.append('div')
            .attr('class', 'wheelcontainer')
            .on('mouseleave', (d) => {
                this.svg.selectAll('.wheelgroup')
                    .remove();
                d3.selectAll('.nodeEntry')
                    .classed('quiet', false);
                d3.selectAll('.edgeline')
                    .classed('quiet', false);
            })
        this.container.style('height', this.height + 'px')
        this.container.style('width', this.width + 'px')

        this.outerRadius = this.height / 2;
        this.innerRadius = this.outerRadius / 2;
        this.innerNodeX = this.innerRadius - (this.innerRadius / 5)
        this.innerNodeY = this.innerRadius * 0.3;
        this.arc = d3.arc()
            .innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius)
            .cornerRadius(20)

        this.svg = this.container.append("svg")
            .attr("width", '100%')
            .attr("height", '100%');

        this.domains = []
        for (let domain of Visualizer.domainState.domain_list.sort()) {
            this.domains.push(new WheelElement(domain))
        }
        this.draw(0)
    }

    get_slice(sliceNumber) {
        if (sliceNumber === 0 && this.domains.length <= this.segmentsPerWheel) {
            return this.domains;
        }
        let start = sliceNumber * this.segmentsPerWheel;
        let end = start + this.segmentsPerWheel;
        let elements = [];
        if (end < (this.domains.length - 1)) {
            elements.push(new NavigatorElement(sliceNumber + 1, this.get_domains_for_slice(sliceNumber + 1), "\u25B6"))
        }
        else {
            let blank = new SpacerElement();
            blank.color = "#ddd"
            elements.push(blank);
        }
        let domainElements = this.domains.slice(start, end);
        elements.push.apply(elements, domainElements)
        let elementCount = elements.length;
        while (elementCount < this.segmentsPerWheel) {
            elements.push(new SpacerElement())
            elementCount++;
        }
        if (sliceNumber > 0) {
            elements.push(new NavigatorElement(sliceNumber - 1, this.get_domains_for_slice(sliceNumber - 1), "\u25C0"))
        }
        else {
            let blank = new SpacerElement();
            blank.color = "#ddd"
            elements.push(blank);
        }
        return elements;
    }

    get_domains_for_slice(sliceNumber) {
        let start = sliceNumber * this.segmentsPerWheel;
        let end = start + this.segmentsPerWheel - 1;
        let domains = new Set();
        for (let dom of this.domains.slice(start, end)) {
            domains.add(dom.name);
        }
        return domains;
    }

    draw(sliceCount) {
        let elements = this.get_slice(sliceCount);
        let self = this;
        let data = this.pie(elements)
        // Cleanup
        this.svg.selectAll('g').remove();
        this.img = this.svg
            .append('g')
            .attr("transform", "translate(0,0)")
            .append("svg:image")
            .attr("xlink:href", "images/vitruvian.png")
            .attr('class', "mousepointer")
            .attr("x", BORDER / 2)
            .attr("y", BORDER / 2)
            .attr("height", this.height)
            .attr("width", this.height)
            .attr("opacity", 0.5)
        this.pieGroup = this.svg
            .append('g')
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")")

        this.allPies = this.pieGroup.selectAll('.chonk')
            .data(data)
            .enter()
            .append('g')
            .attr('class', (d) => (d.data instanceof SpacerElement) ? 'chonk' : 'chonk mousepointer')

        this.allPies.filter((d) => d.data instanceof SpacerElement)
            .on('mouseover', function (d) {
                self.svg.selectAll('.wheelgroup').remove();
                d3.selectAll('.nodeEntry')
                    .classed('quiet', false);
                d3.selectAll('.edgeline')
                    .classed('quiet', false);
            })

        this.navigator = this.allPies.filter((d) => d.data instanceof NavigatorElement)
            .on('mouseover', function (d) {
                self.svg.selectAll('.wheelgroup').remove();
                self._quiet_list(d.data.domains)
            })
            .on('mouseleave', function (d) {
                d3.selectAll('.nodeEntry')
                    .classed('quiet', false);
                d3.selectAll('.edgeline')
                    .classed('quiet', false);
            })
            .on('click', (d) => {
                self.draw(d.data.slice)
            })

        this.pies = this.allPies.filter((d) => d.data instanceof WheelElement)
            .on('mouseover', function (d) {
                self._add_domain_node(d.data.name)
                self._quiet(d.data.name)
            })
            .style('opacity', (d) => {
                let state = Visualizer.domainState.get_domain_state(d.data.name);
                return (state === states.REMOVED) ? 0.2 : 1;
            })
            .on('click', (d) => {
                let state = Visualizer.domainState.get_domain_state(d.data.name);
                if (state === states.REMOVED) {
                    Visualizer.domainState.set_domain_state(d.data.name, states.MINIMIZED);
                } else {
                    Visualizer.domainState.set_domain_state(d.data.name, states.REMOVED);
                }
                this._quiet(d.data.name)
            })

        this.allPies.append('path')
            .attr('d', this.arc)
            .style('stroke', 'white')
            .style('stroke-width', '2px')
            .style('opacity', 0.7)
            .attr('fill', d => (d.data.color) ? d.data.color : Visualizer.d3utils.get_color(d.data.name))

        this.allPies.append('text')
            .each(function (d) {
                let centroid = self.arc.centroid(d);
                d3.select(this)
                    .attr('x', centroid[0])
                    .attr('y', centroid[1])
                    .attr('dy', '0.33em')
                    .text(d.data.tag)
                    .attr('alignment-baseline', 'middle')
                    .attr('text-anchor', 'middle')
                    .style("font-size", (d) => (d.data instanceof NavigatorElement) ? "16px" : "12px")
                    .style("font-weight", "bolder")
            });

    }

    _quiet_list(domainSet) {
        d3.selectAll('.nodeEntry')
            .classed('quiet', d => {
                return (! domainSet.has(d.domain))
            });
        d3.selectAll('.edgeline')
            .classed('quiet', (d) => {
                return ((! domainSet.has(d.nodeFrom.domain)) || (! domainSet.has(d.nodeTo.domain)))
            });
    }


    _quiet(domainName) {
        d3.selectAll('.nodeEntry')
            .classed('quiet', d => {
                return (d.domain !== domainName)
            });
        d3.selectAll('.edgeline')
            .classed('quiet', (d) => {
                return ((d.nodeFrom.domain !== domainName) || (d.nodeTo.domain !== domainName))
            });
    }

    update() {
        if (!this.initialized) return;
        this.pies
            .style('opacity', (d) => {
                let state = Visualizer.domainState.get_domain_state(d.data.name);
                return (state === states.REMOVED) ? 0.2 : 0.8;
            })
    }

    _add_domain_node(domain) {
        let self = this;
        this.svg.selectAll('.wheelgroup')
            .remove();

        let domainGroup = this.svg
            .append('g')
            .attr('class', 'wheelgroup')
            .attr("transform", (d) => {
                return "translate(" + this.width / 2 + " " + this.height / 2 + ")";
            })

        let upper = domainGroup
            .append('g')
            .attr('class', 'mousepointer')
            .on('click', () => {
                let state = Visualizer.domainState.get_domain_state(domain);
                if (state !== states.EXPANDED) {
                    Visualizer.domainState.set_domain_state(domain, states.EXPANDED);
                }
            })

        upper.append('path')
            .attr('d', this.semiArc({
                innerRadius: 1,
                outerRadius: this.innerNodeX,
                startAngle: -Math.PI * 0.5,
                endAngle: Math.PI * 0.5
            }))
            .style('fill', "#f8f8f8")
            .style('opacity', 0.5)

        let upArrow = upper.append('text')
            .text("\u2195")
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .style('font-weight', "bolder")

        let lower = domainGroup
            .append('g')
            .attr('class', 'mousepointer')
            .on('click', () => {
                let state = Visualizer.domainState.get_domain_state(domain);
                if (state !== states.NODES) {
                    Visualizer.domainState.set_domain_state(domain, states.NODES);
                    this._quiet(domain)
                }
            })


        lower.append('path')
            .attr('d', this.semiArc({
                innerRadius: 1,
                outerRadius: this.innerNodeX,
                startAngle: Math.PI * 0.5,
                endAngle: Math.PI * 1.5
            }))
            .style('fill', "#f8f8f8")
            .style('opacity', 0.5)

        let downArrow = lower.append('text')
            .text("\u21A5")
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')

        let tabOffset = 0;
        let tab = domainGroup
            .selectAll(".wheelDomain")
            .data([new SchemaDomain(domain)], d => d.id)
            .enter()
            .append("g")
            .attr('class', "wheelDomain mousepointer")
            .on('click', () => {
                let state = Visualizer.domainState.get_domain_state(domain);
                if (state === states.REMOVED) {
                    Visualizer.domainState.set_domain_state(domain, states.MINIMIZED);
                } else {
                    Visualizer.domainState.set_domain_state(domain, states.REMOVED);
                }
                this._quiet(domain)
            })

            tab.each(function (d) {
                d.nvm.build(this);
            })
            .attr("transform", function (d) {
                let {width, height} = d3.select(this).node().getBoundingClientRect();
                let scale = Math.min((self.innerNodeX * 2) / width, (self.innerNodeY * 2) / height)
                let tx = (width * scale) / 2;
                let ty = (height * scale) / 2;
                tabOffset = ty + 10;
                d.width = width;
                d.height = height;
                return `translate(-${tx},-${ty}) scale(${scale})`;
            })

        upArrow
            .attr('y', "-" + tabOffset)
        downArrow
            .attr('y', tabOffset)
    }
}

class WheelElement {
    constructor(name) {
        this.value = 1;
        this.name = name;
        this.tag = this.name.replace(/[a-z]/g, '').slice(0, 2)
        if (!this.tag || this.tag.length < 2) {
            this.tag = this.name.slice(0, 2)
        }
        if (this.tag.length > 2) {
            this.tag = this.tag.slice(0, 2)
        }
    }

}

class NavigatorElement {
    constructor(slice, domains, tag) {
        this.value = 1;
        this.slice = slice;
        this.color = "#555";
        this.tag = tag;
        this.domains = domains;
    }
}

class SpacerElement {
    constructor() {
        this.value = 1;
        this.color = "#fff";
    }
}
