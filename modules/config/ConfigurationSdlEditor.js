import * as monaco from 'monaco-editor';
import Visualizer from "../Visualizer";

export default class ConfigurationSdlEditor {
    render({masterDiv: container}) {
        let current = Visualizer.config.get_current_schema();
        if (current == null) {
            return;
        }
        this.container = (container) ? container : this.container;
        this.container.selectAll('*').remove();
        this.container.append('div')
            .attr('id', 'graphvinci__sdl')
            .attr('class', 'schema-config__sdl--inner')

        this.editor = monaco.editor.create(document.getElementById("graphvinci__sdl"), {
            value: current.sdl,
            language: "graphql",
            scrollBeyondLastLine: false
        });

        window.onresize = () => {
            this.editor.layout();
        }

    }

    get_sdl() {
        return this.editor.getValue();
    }

    apply(sdl) {
        this.editor.setValue(sdl);
    }

}
