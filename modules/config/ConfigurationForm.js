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
import GraphVinciSchema from "./GraphVinciSchema";
import {buildClientSchema, printSchema} from "graphql";
import SchemaAuthorization, {NOAUTH, OAUTHCC, BEARER} from "./SchemaAuthorization";
const MASK = "*********";

export default class ConfigurationForm {

    render({masterDiv: container}) {
        this.container = (container) ? container : this.container;
        this.container.selectAll('*').remove();

        let current = Visualizer.config_manager.verticalMenu.get_open_to() || Visualizer.config.get_current_schema();
        if (current == null) {
            return;
        }
        if (current instanceof GraphVinciSchema) this._render_schema(this.container, current);
        else if (current instanceof SchemaAuthorization) this._render_auth(this.container, current, current.type);
        this._render_tip(this.container)
    }

    _apply_tooltip(text, isError) {
        isError = !!(isError);
        this.tooltip
            .style('visibility', 'visible')
            .classed('schema-config__tooltip-error', isError)
            .html(text)
    }

    _clear_tooltip() {
        this.tooltip
            .style('visibility', 'hidden')
            .html('')
    }

    _render_auth(container, current, type) {
        container.selectAll('*').remove();
        let authName = current.name;
        let form = container.append('form')
            .attr('class', 'schema-form')
        let header = form.append('h3')
            .attr('class', 'schema-form__header')
        header.append('span')
            .html('Authorization: ')
        let authNameField = header.append('span')
            .attr('class', 'mouseedit')
            .attr('contenteditable', true)
            .html(authName)
        form.append('div')
            .attr('class', 'schema-form__separator')
        form.append('label')
            .attr('for', 'url')
            .text('Type')
        let typeSelector = form.append('select')
            .attr('class', "schema-form__epinput schema-form__selector")
            .on("change", () => {
                this._render_auth(container, current, typeSelector.property('value'))
            });
        let types = [BEARER, OAUTHCC];
        type = (type) ? type : types[0];
        typeSelector.selectAll('option')
            .data(types)
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);
        typeSelector.property('value', type);

        if (type === 'Bearer') {
            form.append('label')
                .attr('for', 'bearer')
                .text('Bearer Token')
            let bearerInput = form.append('input')
                .attr('name', 'bearer')
                .attr('type', 'text')
                .attr('class', "schema-form__epinput")
                .attr('placeholder', '<-- Bearer Token -->')
                .property('value', current.bearer)
            form.append('input')
                .attr('type', 'button')
                .attr('class', 'schema-form__save')
                .attr('value', 'Save Changes')
                .on('click', () => {
                    let name = authNameField.html();
                    let bearer = bearerInput.property("value");
                    this._save_bearer(name, bearer, current);
                })
        }

        if (type === 'OAuth2 Client Credentials') {
            form.append('label')
                .attr('for', 'url')
                .text('Oauth URL')
            let urlInput = form.append('input')
                .attr('name', 'url')
                .attr('type', 'text')
                .attr('class', "schema-form__epinput")
                .attr('placeholder', '<-- OAuth2 Endpoint -->')
                .property('value', current.url)

            form.append('label')
                .attr('for', 'client')
                .text('Oauth Client ID')
            let clientInput = form.append('input')
                .attr('name', 'client')
                .attr('type', 'text')
                .attr('class', "schema-form__epinput")
                .attr('placeholder', '<-- OAuth2 Client ID -->')
                .property('value', current.client)

            form.append('label')
                .attr('for', 'secret')
                .text('Oauth Client Secret')
            let secretInput = form.append('input')
                .attr('name', 'secret')
                .attr('type', 'text')
                .attr('class', "schema-form__epinput")
                .attr('placeholder', '<-- OAuth2 Client Secret -->')
                .property('value', (current.secret) ? MASK : null)

            form.append('label')
                .attr('for', 'client')
                .text('Oauth Request Scopes')
            let scopesInput = form.append('input')
                .attr('name', 'scopes')
                .attr('type', 'text')
                .attr('class', "schema-form__epinput")
                .attr('placeholder', 'scope1 scope2')
                .property('value', current.scopes)

            form.append('input')
                .attr('type', 'button')
                .attr('class', 'schema-form__save')
                .attr('value', 'Save Changes')
                .on('click', () => {
                    let name = authNameField.html();
                    let url = urlInput.property("value");
                    let client = clientInput.property("value");
                    let secret = secretInput.property("value");
                    if (secret === MASK) secret = current.secret;
                    let scopes = scopesInput.property("value");
                    this._save_oauth2_client_credentials(name, url, client, secret, scopes, current);
                })
        }

    }

    _render_schema(container, current) {
        let schemaName = current.name;
        /*
        Using a contentEditable field and regular javascript is as/more difficult than using d3 selectors, and in case
        you havent figured it out yet, I like d3.  This may look messy, but trust me, once you understand it you will
        see that it is in fact really messy
         */

        let form = container.append('form')
            .attr('class', 'schema-form')
        form.append('img')
            .attr('class', 'schema-form__helpimg')
            .attr('src', 'images/buttons/schema.png')
            .on('mouseenter', () => {
                this._apply_tooltip("The current working schema")
            })
            .on('mouseleave', () => {
                this._clear_tooltip()
            })
        let header = form.append('h3')
            .attr('class', 'schema-form__header')
        header.append('span')
            .html('Schema: ')
        let schemaNameField = header.append('span')
            .attr('class', 'mouseedit')
            .attr('contenteditable', true)
            .html(schemaName)
        form.append('div')
            .attr('class', 'schema-form__separator')
        form.append('img')
            .attr('class', 'schema-form__helpimg')
            .attr('src', 'images/buttons/link.png')
            .on('mouseenter', () => {
                this._apply_tooltip("Your GraphQL endpoint, if you want to pull the schema directly")
            })
            .on('mouseleave', () => {
                this._clear_tooltip()
            })
        form.append('label')
            .attr('for', 'url')
            .text('GraphQL Introspection URI')


        let urlInput = form.append('input')
            .attr('name', 'url')
            .attr('type', 'text')
            .attr('class', "schema-form__epinput")
            .attr('placeholder', 'https://your-server/graphql')
            .property('value', current.url)

        form.append('img')
            .attr('class', 'schema-form__helpimg')
            .attr('src', 'images/buttons/auth.png')
            .on('mouseenter', () => {
                this._apply_tooltip("An authorization helper, to assist in token retrieval")
            })
            .on('mouseleave', () => {
                this._clear_tooltip()
            })
        form.append('label')
            .attr('for', 'auth')
            .text('Authorization Helper')
        let authInput = form.append('select')
            .attr('class', "schema-form__epinput schema-form__epinput--narrow")

        authInput.selectAll('option')
            .data(Visualizer.config.auth_list.concat(NOAUTH))
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);

        authInput.property('value', current.authName || NOAUTH);

        form.append('img')
            .attr('class', 'schema-form__buttonimg')
            .attr('src', 'images/buttons/edit.png')
            .on('click', () => {
                let authName = authInput.property("value");
                if (authName && authName !== NOAUTH) {
                    Visualizer.config_manager.verticalMenu.set_open_to(Visualizer.config.get_auth(authName));
                    Visualizer.config_manager.render({})
                }
            })
            .on('mouseenter', () => {
                this._apply_tooltip("Edit the authorization helper")
            })
            .on('mouseleave', () => {
                this._clear_tooltip()
            })


        form.append('img')
            .attr('class', 'schema-form__buttonimg')
            .attr('src', 'images/buttons/create.png')
            .on('click', () => {
                let auth = Visualizer.config.add_new_blank_auth();
                current.authName = auth.name;
                Visualizer.config.save_schema(current)
                Visualizer.config_manager.verticalMenu.set_open_to(auth)
                Visualizer.config_manager.render({})
            })
            .on('mouseenter', () => {
                this._apply_tooltip("Create a new authorization helper")
            })
            .on('mouseleave', () => {
                this._clear_tooltip()
            })

        form.append('img')
            .attr('class', 'schema-form__helpimg')
            .attr('src', 'images/buttons/mapping.png')
            .on('mouseenter', () => {
                this._apply_tooltip("Insert visualizer mappings directly, rather than inserting them into schema")
            })
            .on('mouseleave', () => {
                this._clear_tooltip()
            })
        form.append('label')
            .attr('for', 'domainMappings')
            .text('Domain Mappings')
        let domainMappingsInput = form.append('textarea')
            .attr('name', 'domainMappings')
            .attr('class', "schema-form__epinput schema-form__epinput--textarea")
            .attr('placeholder', `Type: Domain`)
            .property('value', current.mappings)
        form.append('img')
            .attr('class', 'schema-form__helpimg')
            .attr('src', 'images/buttons/headers.png')
            .on('mouseenter', () => {
                this._apply_tooltip("Insert custom headers into your requests")
            })
            .on('mouseleave', () => {
                this._clear_tooltip()
            })
        form.append('label')
            .attr('for', 'headers')
            .text('Optional Headers')
        let headersInput = form.append('textarea')
            .attr('name', 'headers')
            .attr('class', "schema-form__epinput schema-form__epinput--textarea")
            .attr('placeholder', "cache-control: max-age=30")
            .property('value', current.headers)

        let buttons = [
            {
                name: "Save",
                img: "images/buttons/save_ring.png",
                helpText: "Save the current schema configuration and SDL",
                clickFunction: (d) => {
                    let name = schemaNameField.html();
                    let url = urlInput.property("value");
                    let domainMappings = domainMappingsInput.property("value");
                    let headers = headersInput.property("value");
                    let authName = authInput.property("value");
                    this._save_schema(name, url, authName, domainMappings, headers, current);

                }
            },
            {
                name: "Reset",
                img: "images/buttons/reset_ring.png",
                helpText: "Reset unsaved changes to the configuration/SDL",
                clickFunction: (d) => {
                    Visualizer.config_manager.render({});
                }
            },
            {
                name: "Fetch",
                inactive: (current.url) ? false : true,
                img: "images/buttons/fetch.png",
                helpText: "Fetch the current schema with an introspection query",
                clickFunction: (d) => {
                    this._lock_buttons();
                    this._apply_tooltip("Introspection request is pending...")
                    Visualizer.proxy_manager.pull_schema()
                        .then(result => {
                            let graphqlSchemaObj = buildClientSchema(result.data);
                            Visualizer.config_manager.schemaSdl.apply(printSchema(graphqlSchemaObj))
                            d.errored = false;
                            this._apply_tooltip("Introspection request complete")
                            setTimeout(() => {
                                this._unlock_buttons()
                            }, 2000)
                        })
                        .catch(error => {
                            d.errored = true;
                            this._apply_tooltip("Introspection request failed...<br>" + error, true)
                            setTimeout(() => {
                                this._unlock_buttons()
                            }, 2000)
                        });
                }
            },
            {
                name: "Clone",
                img: "images/buttons/copy_ring.png",
                helpText: "Clone the current schema configuration and SDL",
                clickFunction: (d) => {
                    let cloned = Visualizer.config.clone_schema(current);
                    Visualizer.config.set_current_schema(cloned.name)
                    Visualizer.config_manager.verticalMenu.set_open_to(cloned)
                    Visualizer.config_manager.render({})
                }
            },
            {
                name: "Delete",
                img: "images/buttons/delete_ring.png",
                helpText: "Delete the current schema",
                clickFunction: (d) => {
                    confirm("Delete the current schema?")
                    Visualizer.config.delete_schema(current)
                    let newCurrent = Visualizer.config.get_current_schema()
                    Visualizer.config_manager.verticalMenu.set_open_to(newCurrent, true)
                    Visualizer.config_manager.render({})
                }
            }
        ]

        form.append('div')
            .attr('class', 'schema-form__separator')

        this.buttons = form.selectAll('.schema-form__buttonimg--large')
            .data(buttons)
            .enter()
            .append('img')
            .attr('class', 'schema-form__buttonimg schema-form__buttonimg--large')
            .attr('src', (d) => d.img)
            .style('opacity', (d) => (d.inactive) ? 0.3 : 1)
            .on('mouseenter', (d) => {
                if (d.locked) return;
                d.errored = false;
                this._apply_tooltip(d.helpText)
            })
            .on('mouseleave', (d) => {
                if (d.locked || d.errored) return;
                this._clear_tooltip()
            })
            .on('click', (d) => {
                if (d.locked || d.inactive) return;
                d.clickFunction(d)
            })
        


    }

    _lock_buttons() {
        this.buttons
            .style('opacity', (d) => {
                d.locked = true;
                return 0.5;
            })
    }

    _unlock_buttons() {
        this.buttons
            .style('opacity', (d) => {
                d.locked = false;
                return 1;
            })
    }

    _render_tip(container) {
        this.tooltip = container.append('div')
            .attr('class', 'schema-config__tooltip')
    }
    _save_schema(name, url, authName, domainMappings, headers, current) {
        // Rules
        if (! name) {
            alert("Your schema requires a name")
            return;
        }
        // Get the sdl from the SDL editor
        let sdl = Visualizer.config_manager.schemaSdl.get_sdl();
        let oldName = current.name;
        current.name = name;
        current.url = url;
        current.add_mappings(domainMappings)
        current.headers = headers;
        current.authName = authName;
        current.sdl = sdl;
        Visualizer.config_manager.verticalMenu.set_open_to(current)
        Visualizer.config_manager.update()
        Visualizer.config.save_schema(current, oldName)

    }

    _save_bearer(name, bearer, current) {
        // Rules
        if (! name) {
            alert("Your auth requires a name")
            return;
        }
        if (! bearer) {
            alert("Your bearer auth requires a token")
            return;
        }
        let oldName = current.name;
        current.name = name;
        current.type = BEARER;
        current.bearer = bearer;
        Visualizer.config.save_auth(current, oldName)
        Visualizer.config_manager.verticalMenu.set_open_to(current)
        Visualizer.config_manager.render({});
    }

    _save_oauth2_client_credentials(name, url, client, secret, scopes, current) {
        if (! name) {
            alert("Your auth requires a name")
            return;
        }
        if (! (url && client && secret && scopes)) {
            alert("Your oauth needs url, client, secret and scopes information")
            return;
        }
        let oldName = current.name;
        current.name = name;
        current.type = OAUTHCC;
        current.url = url;
        current.client = client;
        current.secret = secret;
        current.scopes = scopes;
        Visualizer.config.save_auth(current, oldName)
        Visualizer.config_manager.verticalMenu.set_open_to(current)
        Visualizer.config_manager.render({});
    }
}
