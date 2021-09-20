![image](https://user-images.githubusercontent.com/8096993/134034741-2f699803-ae8a-4b98-bd9b-ac972e04784e.png)

A better schema visualizer for GraphQL APIs - view your schema in a draggable, zoomable and collapsible way.  Built to introspect large interconnected schemas, to promote a better understanding of your data

View as much or as little of your schema as you need, organized however you like...
![init](https://user-images.githubusercontent.com/8096993/134035993-57aafae3-9916-4f1f-abda-1b892bb39d21.gif)

## What is GraphVinci?

Built with the aim of conquering complexity in mind, the GraphVinci visualizer aims to promote the understanding and sharing of API schema by creating an interactive and intuitive force-directed graph layout

With a background in federated GraphQL, we needed a way of sharing schema knowledge and views of many schemas between teams that could also serve as a data "roadmap" that was understandable at both a developer and an executive level

Divide your schema into logical domains, and then use these to group, view and manage a visualization

Create and save custom, shareable schema views that promote cross-developer data understanding

![demo](https://user-images.githubusercontent.com/8096993/134036095-e1bf5a1c-c638-4abc-87a2-73570d9bf2e5.gif)

## How can I run GraphVinci?

GraphVinci is built as static content with minimal dependencies and uses parcel to bundle.  To test it out, just "npm install" to add the dependencies, and "npm start" and parcel will host the visualizer locally.  The output from "npm build" can be served as static content in any manner that you choose.  Additional options (npm, docker images etc) will be created as the project matures


## FAQ

#### How do I set up my groupings?

You can either set up groupings within the setup screen for an endpoint, or you can embed them within your GraphQL schema's descriptions

#### Is it possible to have field-level group resolution?

Yes.  If a field in a type is "logically" owned by a separate group (as is the case with Federated GraphQL's type extension), then it will be displayed in the type's grouping, but when expanded it will be color-coded according to the owner

#### Is it possible to "nest" groups within groups?

Technically this *might* be possible, but the challenges in making this "work" effectively mean that this feature is unlikely to come soon

#### Is introspection the only method of importing a schema?

Currently yes, but we will be adding sdl interpretation (and direct edit) shortly

#### Any plans for a GraphQL browser with visualization options?

Yes.  We just decided to release the schema visualization to the community first

