import * as d3 from "d3";
import Graph from "./graph/Graph.js";
import HorizontalMenu from "./menu/HorizontalMenu.js";
import DomainState from "./config/DomainState.js";
import Schema from "./schema/Schema.js";
import ProxyManager from "./requests/ProxyManager";
import ConciergePush from "./concierge/ConciergePush";
import D3Utils from "./utils/D3Utils";
import Concierge from "./concierge/Concierge";
import DomainMetaManager from "./config/DomainMetaManager";
import D3TextSizer from "./utils/D3TextSizer";
import InputDisplay from "./input/InputDisplay";
import './styles/app.css';
import SchemaConfigManager from "./config/SchemaConfigManager";

export const states = {
    Schema: 0,
    Editor: 1,
    Setup: 2
};

class Visualizer {

    initialize(configurator) {
        this.config = configurator;
        this.state = states.Schema;
        this._build_components()
        return this;
    }

    _build_components() {
        this.controller = new AbortController();
        this.concierge_push = new ConciergePush();
        this.proxy_manager = new ProxyManager();
        this.d3utils = new D3Utils();
        this.concierge = new Concierge();
        this.domain_meta_manager = new DomainMetaManager();
        this.d3text_sizer = new D3TextSizer();
        this.graph = new Graph();
        this.input_display = new InputDisplay();
        this.config_manager = new SchemaConfigManager(this.config)
    }

    build() {
        let self = this;
        this._build_permanent();
        if (this.config.schemaReady && ! this.config.initState) {
            this.horizontalMenu.build();
            self.apply_current_schema();
        }
        else {
            this.set_state(states.Setup);
            this._build();
            this.config.initState = false;
        }
    }

    apply_current_schema() {
        delete this.schemaError;
        try {
            let schema = this.config.get_current_schema().introspection;
            if (schema.errors) {
                delete this.schema;
                throw new Error(schema.errors[0].message)
            }
            this.currentData = schema;
            this.schema = new Schema(schema);
            // I'm separating them since I dont want the internal domain states etc to cross the
            // boundary between modes, and also because I may well want to build them differently
            this.domainState = new DomainState(this.schema);
            //this.state = states.Schema;
            this._build();
        }catch (e) {
            this.schemaError = "SDL syntax error: " + e;
            this._build();
        }
    }

    reset_viz() {
        this.domainState = new DomainState(this.schema);
        this._build();
    }

    set_domain_expansion(domain, state) {
        d3.selectAll('.nodeEntry')
            .filter(d => d.domain === domain)
            .each(d => {
                d.nvm.open = state;
                d.nvm.build();
            });
        this.graph.kick();
    }

    _build_permanent() {
        this.appDiv = d3.select("#appdiv");
        this.mainContainer = this.appDiv
            .append('div')
            .attr('class', "actioncentral");

        this.hmContainer = this.mainContainer
            .append('div')
            .attr('class', "horizontalmenu");

        this.modeContainer = this.mainContainer
            .append('div')
            .attr('class', "modecontainer");
        this.horizontalMenu = new HorizontalMenu(this.hmContainer);
        this.horizontalMenu.build();

        window.addEventListener('resize', this._resize);
    }

    _build() {
        // Run a complete clear
        this.modeContainer.selectAll("*").remove();

        switch (this.state) {
            case states.Schema:
                this._build_schema();
                break;
            case states.Setup:
                this._build_setup();
                break;
        }

    }

    _build_no_schema(message) {
        if (this.schemaError) {
            message = this.schemaError;
        }
        this.modeContainer
            .append('div')
            .attr('class', "schemapending")
            .html(message)
    }

    _build_setup() {
        this.horizontalMenu.build();
        this.config_manager.render({container: this.modeContainer});
    }

    _build_schema() {
        if (!this.schema) {
            this._build_no_schema();
            return;
        }
        // Create the main page partitions within the modeContainer div
        this._build_schema_containers();

        this.graph.build(this.graphContainer, this.currentData);
        this.graph.run_viz(this.currentData);
    }

    _resize() {
        switch (this.state) {
            case states.Schema:
                this.graph.apply_current_size();
                break;
            case states.Editor:
            case states.Setup:
                console.log("Resize on " + this.state)
        }

    }

    set_state(state) {
        if (!this.config.schemaReady) {
            this.state = states.Setup;
            return;
        }
        if (this.state === state) {
            return;
        }
        this.state = state;
        this._build();
    }

    _build_schema_containers() {
        this.graphContainer = this.modeContainer
            .append('div')
            .attr('class', "graphcontainer");
    }
}

export default new Visualizer();
