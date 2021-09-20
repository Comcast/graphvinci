import '../styles/schema-config.css';
import ConfigurationMenu from "./ConfigurationMenu";
import ConfigurationForm from "./ConfigurationForm";
import Visualizer from '../Visualizer'
import ConfigurationSdlEditor from "./ConfigurationSdlEditor";

export default class SchemaConfigManager {

    constructor(config) {
        this.config = config;
        this.verticalMenu = new ConfigurationMenu();
        this.schemaConfigForm = new ConfigurationForm();
        this.schemaSdl =  new ConfigurationSdlEditor();
    }

    render({container: container}) {
        // We can re-render re-using the original container
        this.container = (! container) ? this.container : container;
        // Create our three containers
        this.container.selectAll('*').remove();
        let menu = this.container.append('div').classed('schema-config__menu', true);
        let editor = this.container.append('div').classed('schema-config__edit', true);
        let sdl = this.container.append('div').classed('schema-config__sdl', true);
        this.verticalMenu.render({masterDiv: menu})
        this.schemaConfigForm.render({masterDiv: editor})
        this.schemaSdl.render({masterDiv: sdl})
    }

    update() {
        this.verticalMenu.update_state();
        this.schemaConfigForm.render({});
        this.schemaSdl.render({})
    }
}