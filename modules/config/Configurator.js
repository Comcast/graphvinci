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

import GraphVinciSchema from "./GraphVinciSchema";
import SchemaAuthorization, {NOAUTH} from "./SchemaAuthorization";
import GlobalViz from "../GlobalViz";

const SCHEMAS = "Schemas.v3";
const AUTHORIZATIONS = "Authorizations.v3";
const CURRENT_SCHEMA = "CurrentSchema.v3";


export default class Configurator {

    constructor(samples) {
        this.samples = samples;
        this._get_local_data();
        this.cacheTTL = 3600;
        this.noauth = new SchemaAuthorization({name: "None", type: NOAUTH} )
    }

    get schemaReady() {
        return !!(this.get_current_schema() && this.get_current_schema().sdl);
    }

    _get_local_data() {
        // Get the schemas from local storage, or use the samples if nothing has been set up...
        let schemas = localStorage.getItem(SCHEMAS);
        let schemaObjects;
        this.initState = false;
        if (schemas) {
            schemaObjects = JSON.parse(schemas);
        }
        else {
            schemaObjects = this.samples || {};
            this.initState = true;
        }
        schemaObjects = (schemas) ? JSON.parse(schemas) : this.samples;
        this.schemas = {};
        for (let schemaName in schemaObjects) {
            this.schemas[schemaName] = new GraphVinciSchema(schemaObjects[schemaName]);
        }

        // Get the default, check that it exists, and then just pick whatever is first if not
        let currentSchema = localStorage.getItem(CURRENT_SCHEMA);
        this.currentSchema = currentSchema;
        this.get_current_schema(); // Resolves any missing/null issues

        // Get the authorizations from local storage
        let authorizations = localStorage.getItem(AUTHORIZATIONS);
        let authObjects = (authorizations) ? JSON.parse(authorizations) : {};
        this.authorizations = {};
        for (let authName in authObjects) {
            this.authorizations[authName] = new SchemaAuthorization(authObjects[authName]);
        }
        if (this.initState) this.save();
    }

    get auth_list() {
        return Object.keys(this.authorizations)
    }

    get_current_authorization() {
        if (!this.currentSchema || !( this.currentSchema in this.schemas)) {
            return this.noauth;
        }
        let currentSchema = this.get_current_schema();
        let authName = currentSchema.authName;
        if (! authName || !(authName in this.authorizations)) return this.noauth;
        return this.authorizations[authName];
    }

    get_current_schema() {
        if (!this.currentSchema || !( this.currentSchema in this.schemas)) {
            let schemaNames = Object.keys(this.schemas);
            if (schemaNames && Array.isArray(schemaNames) && schemaNames.length > 0) {
                this.currentSchema = schemaNames[0];
            }
            else {
                this.currentSchema = null;
                return null;
            }

        }
        return this.schemas[this.currentSchema];
    }

    get_fallback_auth() {
        let authNames = Object.keys(this.authorizations);
        if (authNames && Array.isArray(authNames) && authNames.length > 0) {
            return this.authorizations[authNames[0]];
        }
        return null;
    }

    set_current_schema(schemaName) {
        if (schemaName in this.schemas) {
            this.currentSchema = schemaName;
            this.save();
            let schema = this.get_current_schema();
            if (schema.sdl) {
                GlobalViz.vis?.apply_current_schema();
            }
            else {
                GlobalViz.vis?.horizontalMenu.build();
            }
        }

    }

    add_new_blank_schema(name) {
        let schema_name = this._generate_schema_name(name);
        this.schemas[schema_name] = new GraphVinciSchema({name: schema_name});
        this.save();
        return this.schemas[schema_name];
    }

    _generate_schema_name(name) {
        let counter = 1;
        name = (name) ? name : "Schema_";
        while (name + counter in this.schemas) {
            counter++;
        }
        return name + counter;
    }

    save() {
        localStorage.setItem(SCHEMAS, JSON.stringify(this.schemas));
        localStorage.setItem(AUTHORIZATIONS, JSON.stringify(this.authorizations));
        localStorage.setItem(CURRENT_SCHEMA, this.currentSchema);
    }

    delete_schema(schema) {
        if (schema.name in this.schemas) {
            delete this.schemas[schema.name];
            this.save();
        }
    }

    clone_schema(schema) {
        let cloned = new GraphVinciSchema(schema);
        cloned.name = this._generate_schema_name(schema.name + "_clone");
        this.schemas[cloned.name] = cloned;
        this.save();
        return cloned;
    }

    clone_auth(auth) {
        let cloned = new SchemaAuthorization(auth);
        cloned.name = this._generate_auth_name(auth.name + "_clone");
        this.authorizations[cloned.name] = cloned;
        this.save();
        return cloned;
    }

    save_schema(current, oldName) {
        if (oldName && oldName in this.schemas) delete this.schemas[oldName];
        this.schemas[current.name] = current;
        this.set_current_schema(current.name);
        //if (this.currentSchema !== current.name) this.set_current_schema(current.name);
        this.save();
    }

    add_new_blank_auth(name) {
        let auth_name = this._generate_auth_name(name);
        this.authorizations[auth_name] = new SchemaAuthorization({name: auth_name});
        this.save();
        return this.authorizations[auth_name];
    }

    _generate_auth_name(name) {
        let counter = 1;
        name = (name) ? name : "Auth_";
        while (name + counter in this.authorizations) {
            counter++;
        }
        return name + counter;
    }

    delete_auth(auth) {
        if (auth.name in this.authorizations) {
            delete this.authorizations[auth.name];
            for (let schemaName in this.schemas) {
                let schema = this.schemas[schemaName];
                if (schema.authName && schema.authName === auth.name) {
                    schema.authName = 'None';
                }
            }
            this.save();
        }
    }

    save_auth(current, oldName) {
        if (oldName && oldName in this.authorizations) delete this.authorizations[oldName];
        this.authorizations[current.name] = current;
        if (current.name !== oldName) {
            for (let schemaName in this.schemas) {
                let schema = this.schemas[schemaName];
                if (schema.authName && schema.authName === oldName) {
                    schema.authName = current.name;
                }
            }
        }
        this.save();
    }

    get_auth(authName) {
        if (authName in this.authorizations) {
            return this.authorizations[authName];
        }
        return null;
    }

    is_search_possible() {
        return !!(this.get_current_schema() && this.get_current_schema().url);
    }
}

