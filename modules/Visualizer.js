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
import GlobalViz from "./GlobalViz";
import Graph from "./graph/Graph.js";
import HorizontalMenu from "./menu/HorizontalMenu.js";
import DomainState from "./config/DomainState.js";
import Schema from "./schema/Schema.js";
import ProxyManager from "./requests/ProxyManager";
import ConciergePush from "./concierge/ConciergePush";
import Concierge from "./concierge/Concierge";
import D3TextSizer from "./utils/D3TextSizer";
import InputDisplay from "./input/InputDisplay";
import './styles/app.css';
import './styles/queryeditor.css';
import SchemaConfigManager from "./config/SchemaConfigManager";
import { states } from "./Constants";
import Split from 'split.js'
import QueryWindow from "./query/QueryWindow";
import HistoryManager from "./history/HistoryManager";
import QueryTopWindow from "./query/QueryTopWindow";
import QueryBottomWindow from "./query/QueryBottomWindow";

class Visualizer {

    initialize(configurator) {
        this.config = configurator;
        this.state = states.Schema;
        this._cycle = false;
        this._build_components()
        GlobalViz.vis = this; // Sets a non-circular dependency globally
        return this;
    }

    _build_components() {
        this.controller = new AbortController();
        this.concierge_push = new ConciergePush();
        this.proxy_manager = new ProxyManager();
        this.concierge = new Concierge();
        this.d3text_sizer = new D3TextSizer();
        this.graph = new Graph();
        this.input_display = new InputDisplay();
        this.config_manager = new SchemaConfigManager(this.config);
        this.query_window = new QueryWindow();
        this.query_top_window = new QueryTopWindow();
        this.query_bottom_window = new QueryBottomWindow();
        this.history_manager = new HistoryManager();
    }

    start_cycle() {
        this._cycle = true;
    }

    stop_cycle() {
        // This is terribly hacky.  Im sorry.
        d3.selectAll('.cycleshader').attr('opacity', 0)
        this._cycle = false;
    }

    get cycle() {
        return this._cycle || false;
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
        this.graph.unstick();
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
        this.stop_cycle();
        this.modeContainer.selectAll("*").remove();


        switch (this.state) {
            case states.Schema:
                this._build_schema();
                break;
            case states.Setup:
                this._build_setup();
                break;
            case states.Editor:
                this._build_editor();
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

    _build_editor() {
        if (!this.schema) {
            this._build_no_schema();
            return;
        }
        this._build_query_containers();
        this.query_window.build(this.queryContainer, this.varsContainer);
        this.query_top_window.build(this.querygraph);
        this.query_bottom_window.build(this.resultsGraph);
    }

    _build_query_containers() {
        this.queryVarsContainer = this.modeContainer
            .append('div')
            .attr('class', "querywindow")
            .attr('id', "codevarscontainer");

        this.queryContainer = this.queryVarsContainer
            .append('div')
            .attr('class', "querycodewindow")
            .attr('id', "codecontainer");

        this.varsContainer = this.queryVarsContainer
            .append('div')
            .attr('class', "queryvarswindow")
            .attr('id', "varscontainer");

        this.resultsContainer = this.modeContainer
            .append('div')
            .attr('class', "resultscontainer")
            .attr('id', "resultscontainer");

        this.querygraph = this.resultsContainer
            .append('div')
            .attr('class', "querygraph")
            .attr('id', "querygraph");

        this.resultsGraph = this.resultsContainer
            .append('div')
            .attr('class', "resultsgraph")
            .attr('id', "resultsgraph");

        Split(['#codevarscontainer', '#resultscontainer'], {
            sizes: [25, 75],
            minSize: [400, 100],
            expandToMin: true,
        })

        Split(['#querygraph', '#resultsgraph'], {
            sizes: [35, 65],
            minSize: [200, 200],
            expandToMin: true,
            direction: "vertical"
        })

        this.varSplit = Split(['#codecontainer', '#varscontainer'], {
            sizes: [99, 1],
            minSize: [200, 1],
            expandToMin: true,
            direction: "vertical"
        })
    }

    toggle_vars() {
        let sizes = this.varSplit.getSizes();
        this.varSplit.setSizes((sizes[0] <=80) ? [100, 0] : [80, 20]);
    }

    _get_current_split_percent() {
        let h1 = this.queryContainer.style('height').slice(0, -2)
        let h2 = this.varsContainer.style('height').slice(0, -2)
        return Math.round((h2 / (h1 + h2) * 100))
    }

    _build_schema_containers() {
        this.graphContainer = this.modeContainer
            .append('div')
            .attr('class', "graphcontainer");
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
