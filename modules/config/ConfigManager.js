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

import Visualizer from "../Visualizer";
const newLine = '\n';

function getInput(name) {
    return document.querySelector(`[name=${name}]`);
}

class ConfigManager {
    _set_poll_status(state = 'pending', msg) {
        this.container.select('#schemaState')
            .attr('state', 'schema' + state)
            .text(msg);
    }

    _retrieve() {
        if (this.config.is_auth_configured()) {
            this._set_poll_status("pending", "GraphVinciSchema Request sent");
            Visualizer.proxy_manager.pull_schema((data) => {
                this._set_poll_status("ok", "GraphVinciSchema Request OK");
                Visualizer.apply_current_schema(data);
            }, (error) => {
                this._set_poll_status("failed", "GraphVinciSchema Request failed - " + error);
                Visualizer.horizontalMenu.build();
            });
        }
        else {
            this._set_poll_status("failed", "Authorization not configured");
            Visualizer.horizontalMenu.build();
        }
    }

    _endPointsToOptions(endPoints) {
        let options = '';
        for(let endpoint in endPoints) {
            let info = endPoints[endpoint];
            options += `<option value='${info.name}'>
                ${info.name} - ${info.url}
            </option>`;
        }
        return options;
    }

    render() {
        let endpointOptions = this._endPointsToOptions(this.config.data.endPoints);
        let markup = `
            <form id='graphForm' class='pushconfig'>
                <div class='push-hint-text'>
                    <h2>Pro Tip:</h2>
                    <p>
                        You can also set the endpoint and token in the url
                        with ?endpoint=url#token=abc123
                    </p>
                </div>
                <div id='schemaState'></div>
                <label for='storedEndpoints'>Use Endpoint</label>
                <select name='storedEndpoints' class='epinput epstored'>${endpointOptions}</select>
                <input id='deleteEndpoint' type='button' value='Delete' class='epsave epdelete' />
                <input id='useEndpoint' type='button' value='Use Endpoint' class='epsave' />
                <div class='epseparator'></div>
                <h2 class='epheader'>Create or Update Endpoint</h2>
                <label for='name'>Config Name (change to create new)</label>
                <input name='name' type='text' class='epinput' />
                <label for='url'>Graph Endpoint</label>
                <input name='url' type='text' class='epinput' />
                <label for='domainMappings'>Optional Domain Mappings</label>
                <textarea name='domainMappings'
                    class='epinput optionalinput'>
Type1=DomainA
Type2=DomainB
                </textarea>

                <label for='optionalHeaders'>Optional Headers</label>
                <textarea name='optionalHeaders'
                    class='epinput optionalinput'>
{\"fts_debug\": 1}
                </textarea>

                <label for='updateAll' class='inline'>Update Oauth information for all endpoints</label>
                <input name='updateAll' type='checkbox' class='epinput inline' />
                <input name='authType' type='hidden' value='Oauth' />
                <label for='authurl'>OAuth Endpoint</label>
                <input name='authurl' type='text' class='epinput requiredinput' placeholder='Oauth Endpoint'>
                <label for='clientId'>ClientId</label>
                <input name='clientId' type='text' class='epinput requiredinput' placeholder='Oauth Client ID'>
                <label for='secret'>Client Secret</label>
                <input name='secret' type='password' class='epinput requiredinput' placeholder='Oauth Client Secret'>
                <label for='scopes'>Scopes</label>
                <input name='scopes' type='text' class='epinput requiredinput' placeholder='Oauth Scopes'>

                <input type='submit' value='Save Changes' class='epsave' />
            </form>
        `;

        this.container.html(markup);

        this._changeEndpoint(this.config.endpoint.name);

        getInput('storedEndpoints').addEventListener('change', (event) => {
            this._changeEndpoint(event.target.value);
        });

        document.getElementById('graphForm').addEventListener('submit', (event) => {
            event.preventDefault();
            this._save();
        });

        document.getElementById('useEndpoint').addEventListener('click', (event) => {
            this.config.use(getInput('storedEndpoints').value);
            this._retrieve();
        });

        document.getElementById('deleteEndpoint').addEventListener('click', (event) => {
            if (window.confirm('Delete endpoint?')) {
                this.config.delete(getInput('storedEndpoints').value);
                this.render();
            }
        });
    }

    _changeEndpoint(name) {
        let endpoint = this.config.data.endPoints[name];
        let defaultAuth = this.config.data.auth;

        endpoint = {
            ...defaultAuth,
            authurl: defaultAuth.url,
            ...endpoint
        };

        Object.keys(endpoint).forEach(key => {
            if (getInput(key)) {
                getInput(key).value = endpoint[key];
            }
        })

        if (endpoint.mappings) {
            getInput('domainMappings').value = this._stringify_mappings(endpoint.mappings);
        }
        if (endpoint.headers) {
            getInput('optionalHeaders').value = JSON.stringify(endpoint.headers) || '';
        }
    }

    _save() {
        let formData = new FormData(document.getElementById('graphForm'));
        let endpoint = {};
        for(let [key, value] of formData.entries()) {
            endpoint[key] = value;
        }
        endpoint.mappings = this._parse_mappings(getInput('domainMappings').value);
        endpoint.headers = this._parse_headers(getInput('optionalHeaders').value);

        if (endpoint.updateAll) {
            this.config.updateAuth(endpoint);
        }
        this.config.save(endpoint);
    }

    _parse_headers(headerJson) {
        if (! headerJson) return "";
        try {
            return JSON.parse((headerJson))
        }
        catch(err) {
            console.log("Parsing error trying to parse JSON headers block: " + err)
        }
    }

    _parse_mappings(mappingString) {
        let mapper = {};
        for (let mapping of mappingString.split(newLine)) {
            let triple = mapping.split('=');
            // Hack for old school usage
            if (triple.length === 2) {
                let newTriple = [triple[0], "cmt", triple[1]];
                triple = newTriple;
            }
            if (triple.length !== 3) continue;
            // location can be a type, or a dot notation type.property
            let location = triple[0];
            let category = triple[1];
            let value = triple[2];
            if (! mapper[location]) {
                mapper[location] = {};
            }
            mapper[location][category] = value;
        }
        return mapper;
    }

    _stringify_mappings(mappings) {
        let mappingList = [];
        for (let location in mappings) {
            if (! mappings.hasOwnProperty(location)) {
                continue;
            }
            for (let category in mappings[location]) {
                if (! mappings[location].hasOwnProperty(category)) {
                    continue;
                }
                mappingList.push(location + "=" + category + "=" + mappings[location][category]);
            }
        }
        return mappingList.join(newLine);
    }
}

export default new ConfigManager();
