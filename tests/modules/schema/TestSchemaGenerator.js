import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import {buildSchema, getIntrospectionQuery, graphqlSync} from "graphql";

export default class TestSchemaGenerator {

    constructor(sdlString) {
        this.schema = buildSchema(sdlString);
    }
    introspectionResult() {
        return graphqlSync(this.schema, getIntrospectionQuery());
    }
}