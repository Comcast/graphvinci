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

import {buildSchema, graphqlSync, getIntrospectionQuery} from "graphql";
const INFO_REGEX = /^([^:]*):\s*([^\s]*)/;

export default class GraphVinciSchema {
    constructor({name, url, authorization, headers, mappings, authName, sdl, savedViews}) {
        this.name = name;
        this.url = url;
        this.authorization = authorization;
        this.headers = headers;
        this.authName = authName;
        this.sdl = sdl;
        this.savedViews = savedViews;
        this.add_mappings(mappings)
    }

    additional_headers() {
        let headers = {};
        if (! this.headers) return headers;
        try {
            headers = JSON.parse(this.headers)
            return headers;
        } catch (e) {
            // Headers can be an object, or attribute: value
        }
        for (let line of this.headers.split("\n")) {
            let match = line.match(INFO_REGEX);
            if (match) headers[match[1]] = match[2];
        }
        return headers;
    }

    add_mappings(mappingString) {
        this.mappings = mappingString;
        this._parse_mappings(mappingString)
    }

    _parse_mappings(mappingString) {
        this._mappings = {};
        if (! mappingString) return;
        for (let line of mappingString.split(/\n/)) {
            let match = line.match(INFO_REGEX);
            if (match) this._mappings[match[1]] = match[2];
        }
    }

    get_domain_mapping(entity) {
        let mapping = this?._mappings?.[entity];
        if (mapping) {
            return {
                cmt: mapping
            }
        }
    }

    get introspection() {
        let graphqlSchemaObj = buildSchema(this.sdl);
        return graphqlSync(graphqlSchemaObj, getIntrospectionQuery());
    }
}
