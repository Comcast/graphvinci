import Visualizer from "../Visualizer.js";
import * as d3 from "d3";

export default class ConciergePush {

    constructor() {
        this.visible = false;
        this.class = "pushlayout";
    }

    flip(mode) {
        if (this.mode !== mode) {
            this.destroy();
            this.build(mode);
            return;
        }
        if (this.visible) {
            this.destroy();
        }
        else {
            this.build(mode);
        }
    }

    _build_regular() {
        let self = this;
        let container = d3.select('body')
            .append('div')
            .attr('class', this.class);

        container.append('h2').html('Save this as a custom view');

        let nameInput = container.append('input')
            .attr('type', "text")
            .attr('placeholder', "Provide a name")

        let importInput = container.append('textarea')
            .attr('placeholder', "Import a copied layout (optional)");

        container.append('h2').html('Select a layout category');

        let createInput = container.append('input')
            .attr('type', "text")
            .attr('class', 'sliminput')
            .attr('placeholder', "Create a new category");

        let addCategory = container.append('input')
            .attr('type', "button")
            .attr('value', "+")
            .on('click', () => {
                let name = createInput.property('value');

            });

        let types = Visualizer.concierge.get_current_category_list();
        let typeSelect = container.append('select')
            .attr('placeholder', 'Add your first category to proceed...')

        typeSelect.selectAll('option')
            .data(types)
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d)

        addCategory.on('click', () => {
            let category = createInput.property('value');
            if (! category) {
                return;
            }
            types.push(category);
            typeSelect.selectAll('option')
                .data(types)
                .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => d)
            typeSelect.property('value', category);
        });

        let submit = container.append('input')
            .attr('type', "submit")
            .attr('value', "Save")
            .on("click", function() {
                let encodedImport = importInput.property('value');
                let importData;
                if (encodedImport) {
                    try {
                        importData = JSON.parse(atob(encodedImport));
                    }
                    catch(err) {
                        alert('Import data format error -> ' + err)
                        return;
                    }
                }
                let posData = (importData) ? importData : Visualizer.graph.posData();
                posData.name = nameInput.property('value');
                posData.category = typeSelect.property('value');
                if (! posData.name || ! posData.category) {
                    alert('You need a name and a category to save a layout')
                    return;
                }
                Visualizer.concierge.save(posData.name, posData.category, posData);
                container.selectAll('*').remove();
                container.append('h2').html('Layout submitted');
                setTimeout(() => {
                    self.destroy();
                    Visualizer.graph.verticalMenu.set_open_to({name: posData.category})
                    Visualizer.graph.verticalMenu.render({refresh: true});
                }, 1000);
            });
    }

    build(mode) {
        this.visible = true;
        this.mode = mode;

        switch(mode) {
            case "Grenade":
                this._build_grenade();
                break;
            default:
                this._build_regular();
                break;
        }

    }


    _build_grenade() {
        let container = d3.select('body')
            .append('div')
            .attr('class', this.class);

        container.append('h2').html('Save as default exploder...');

        container.append('input')
            .attr('type', "submit")
            .attr('value', "Save")
            .on("click", function() {
                let posData = Visualizer.graph.posData();
                posData.name = "ALL";
                posData.description = "Override Grenade";
                posData.category = "DVIEW";
                Visualizer.concierge.save_default(posData, true);
                container.selectAll('*').remove();
                container.append('h2').html('Layout submitted');
                setTimeout(() => container.remove(), 1000);
            });
    }

    destroy() {
        this.visible = false;
        d3.selectAll('.' + this.class).remove();
    }

}
