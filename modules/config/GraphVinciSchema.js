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
