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

import Schema from "../../../modules/schema/Schema";
import TestSchemaGenerator from "./TestSchemaGenerator";

test('Generate basic schema', () => {
    let sdlString = `
type Query {
    test: String
}
    `
    let schemaGenerator = new TestSchemaGenerator(sdlString)
    let schema = new Schema(schemaGenerator.introspectionResult());
    let nodes = schema.nodes;
    expect(nodes.length).toBe(2);
})

