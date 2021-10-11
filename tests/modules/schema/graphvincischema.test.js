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

import GraphVinciSchema from "../../../modules/config/GraphVinciSchema";
import {expect} from "@jest/globals";

test('Test Schema Regex', () => {
    let sdlString = `
type Query {
    test: String
}

type SuperAudit {
    test: String
}
    `
    let mappings = `
/^.*audit.*$/i: Audit
Test: NotAudit
    `
    let schemaConfig = {
        name: "Test",
        mappings: mappings,
        sdl: sdlString
    }
    let gvs = new GraphVinciSchema( schemaConfig );
    /*
    Regex Mapped
     */
    let test = gvs.get_domain_mapping("SuperAudit")
    expect(! test).toBe(false)
    expect(test).toHaveProperty("cmt")
    expect(test.cmt).toBe("Audit");

    /*
    Bypass Regex for properties
     */
    test = gvs.get_domain_mapping("Something.audit")
    expect(! test).toBe(true)

    /*
    Directly Mapped
     */
    test = gvs.get_domain_mapping("Test")
    expect(! test).toBe(false)
    expect(test).toHaveProperty("cmt")
    expect(test.cmt).toBe("NotAudit");

    /*
    UnMapped
     */
    test = gvs.get_domain_mapping("Something")
    expect(! test).toBe(true)
})

