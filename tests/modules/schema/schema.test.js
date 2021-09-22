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
    console.log(JSON.stringify(nodes))
    expect(nodes.length).toBe(1);
})

