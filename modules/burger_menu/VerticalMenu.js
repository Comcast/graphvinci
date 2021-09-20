import * as d3 from "d3";

export const DURATION = 300;
export const DEFAULTHEIGHT = 30;
export const DEFAULTWIDTH = 222;
export const MENURIGHT = 60;
export const BORDER = 2;
export const BASECOLOR = "#b3b3b3";
export const CONTRASTCOLOR = "#6e6e6e";

export default class VerticalMenu {

    set_open_to(openTo, forceDelete) {
        if (forceDelete || openTo) this.openTo = openTo; // This will retain the previous selection
        this.data.set_open_to(openTo);
    }

    get_open_to() {
        return this.openTo;
    }

    render({masterDiv, refresh}) {
        this.masterDiv = (! masterDiv) ? this.masterDiv : masterDiv;
        this.actualWidth = this.masterDiv.style('width').slice(0, -2)
        this.masterDiv.selectAll('.vertmenucontainer').remove();
        this.parentDiv = this.masterDiv
            .append('g')
            .attr('class', 'vertmenucontainer')
        // Get the base menu data
        this._get_menu_data(refresh);
        this.svg = this.parentDiv.append('svg')
            .attr('height', "100%")
            .attr('width', "100%");

        this.update_state();
    }

    update_state() {
        // Get the visible tiles, setting the y offset
        let self = this;
        let visible = this._get_visible_items();
        let yOffset = 0;
        for (let tile of visible) {
            tile.currentPosition = tile.yOffset;
            tile.yOffset = yOffset;
            yOffset += tile.height;
        }
        // Enter and exit, based upon the ID
        let stack = this.svg.selectAll('.menuEntry')
            .data(visible, d => d.id);

        let newTiles = stack.enter()
                .append('g')
                .attr('class', d => "menuEntry")
                .attr("transform", d => {
                    let offset = (d.parent.currentPosition) ? d.parent.currentPosition : 0;
                    return "translate(0," + offset + ")"
                })
                .style('opacity', 0)
        this._add_shared_state(newTiles);
        newTiles.filter(d => typeof(d.buildFunction) === 'function')
            .each(function(d) { d.buildFunction(d3.select(this)); })

        // Add a filter for tiles with an initial offset, then move directly there, then remove the initial offset



        // Move tiles to their correct y offset, and animate rotation
        this._update_states();
        // Perform any additional animation, if function is registered

        // Take care of the removal of anything that needs removing
        stack.exit()
            .transition()
            .attr("transform", d => {
                let offset = (d.parent.currentPosition) ? d.parent.currentPosition : 0;
                return "translate(0," + offset + ")"
            })
            .style('opacity',0)
            .duration(DURATION)
            .remove();

        // Set the parent container's height appropriately
        this.parentDiv
            .style('height', yOffset + "px")
    }

    _add_shared_state(selection) {
        selection.append('rect')
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('fill', BASECOLOR);

        selection.append('rect')
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('opacity', d => d.depth * 0.3)
            .attr('fill', "white");

        let lbSize = 10;
        let lbMargin = lbSize / 2;
        let expanders = selection
            .filter(d => d.has_children && !d.is_stack_pruned)
            .append('g')
            .attr('class', "mousepointer expander")
            .attr("transform", d => {
                d.expX = lbMargin;
                d.expY = ~~((d.height / 2) - lbMargin);
                return "translate(" + d.expX + "," + d.expY + ")";
            });

        expanders.append('rect')
            .attr('width', lbSize * 3)
            .attr('height', lbSize * 3)
            .attr('x', - lbSize)
            .attr('y', - lbSize)
            .attr('opacity', 0)
            .attr('fill', "white");

        expanders.append('path')
            .attr('d', "M 0,0 L " + lbSize + "," + lbMargin + " L 0," + lbSize)
            .attr('stroke', CONTRASTCOLOR)
            .attr('stroke-width', 4)
            .attr('fill', "none");

        expanders.on("click", d => {

            let current = d.expanded;
            if (current) {
                this.set_open_to(null)
                d.parent.expand()
                d.contract();
            }
            else {
                this.set_open_to(d)
            }
            this.update_state();
        })
    }

    _update_states() {
        let tiles = this.svg.selectAll('.menuEntry');
        tiles.transition()
            .attr("transform", d => "translate(0," + d.yOffset + ")")
            .style('opacity', 1)
            .duration(DURATION);

        tiles.selectAll('.expander')
            .transition()
            .attr("transform", d => {
                let angle = (d.expanded) ? 90 : 0;
                let xOffset = (d.expanded) ? d.expX * 3 : d.expX;
                return "translate(" + xOffset + "," + d.expY + ")" + "rotate(" + angle + ")";
            })
            .duration(DURATION);

        tiles.filter(d => typeof(d.stateFunction) === 'function')
            .each(function(d) { d.stateFunction(d3.select(this)); })
    }

    _get_visible_items() {
        let visible = [];
        for (let tile of this.data.children) {
            this._get_child_tiles(visible, tile)
        }
        return visible;
    }

    _get_child_tiles(visible, tile) {
        if (tile.is_stack_pruned) {
            return;
        }
        visible.push(tile);
        if (tile.has_children && tile.expanded) {
            for (let child of tile.children) {
                this._get_child_tiles(visible, child)
            }
        }
    }
}
