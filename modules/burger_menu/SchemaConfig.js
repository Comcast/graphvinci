import {CONTRASTCOLOR} from "./VerticalMenu.js";
import StackableElementWithButtons from "./StackableElementWithButtons";
import Visualizer from "../Visualizer";
const MAX_CHARS = 13;

export default class SchemaConfig extends StackableElementWithButtons  {
    constructor(width, height, schema) {
        super(width, height, "SchemaConfig", true);
        this.schema = schema;
        this.add_button_details(
            {
                altText: "Delete " + schema.name,
                position: 1,
                img: "images/buttons/delete_red.png",
                fillColor: "#f5f5f5",
                strokeColor: "#acacac",
                clickFunction: function(d){
                    Visualizer.config.delete_schema(schema)
                    let newCurrent = Visualizer.config.get_current_schema()
                    Visualizer.config_manager.verticalMenu.set_open_to(newCurrent, true)
                    Visualizer.config_manager.render({})
                }
            }
        )
        this.add_button_details(
            {
                altText: "Clone " + schema.name,
                position: 2,
                img: "images/buttons/clone.png",
                fillColor: "#f5f5f5",
                strokeColor: "#acacac",
                clickFunction: function(d){
                    let cloned = Visualizer.config.clone_schema(schema);
                    Visualizer.config.set_current_schema(cloned.name)
                    Visualizer.config_manager.verticalMenu.set_open_to(cloned)
                    Visualizer.config_manager.render({})
                }
            }
        )

    }

    get id() {
        return this.schema.name;
    }

    buildFunction(group) {
        group.on('mouseleave', d => {
            this.reset(group)
        })
        let schema = this.schema;
        let text = group.append('text')
            .text(this.schema.name)
            .attr('x', d => d.height * 0.7 )
            .attr('y', d => d.height / 2)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'start')
            .attr('stroke', CONTRASTCOLOR)
            .attr('font-size', "0.9em")

        let rect = group.append('rect')
            .attr('width', d => this.width)
            .attr('height', d => this.height)
            .attr('opacity', 0)
            .attr('fill', "#fff")
            .classed('mousepointer', true)
            .on('click', d => {
                Visualizer.config.set_current_schema(this.schema.name);
                Visualizer.config_manager.verticalMenu.set_open_to(this.schema)
                Visualizer.config_manager.update()
            })
        if (this.schema.name.length > MAX_CHARS) {
            let abbreviated = this.schema.name.slice(0,MAX_CHARS) + "...";
            text.text(abbreviated)
            rect.append("svg:title")
                .text(this.schema.name);
        }
        this.add_buttons(group, true)
    }

}