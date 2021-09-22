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

import * as monaco from 'monaco-editor';
import GlobalViz from "../GlobalViz";

export default class ConfigurationSdlEditor {
    render({masterDiv: container}) {
        let current = GlobalViz.vis?.config.get_current_schema();
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
