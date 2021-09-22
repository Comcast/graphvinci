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

import '../styles/schema-config.css';
import ConfigurationMenu from "./ConfigurationMenu";
import ConfigurationForm from "./ConfigurationForm";
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
