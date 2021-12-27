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

import CodeMirror from 'codemirror';
import GlobalViz from "../GlobalViz";
import 'codemirror/theme/idea.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/keymap/sublime';
import "codemirror/lib/codemirror.css";
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/info';
import 'codemirror-graphql/jump';
import 'codemirror-graphql/mode';
import prettier from "prettier";
import parserGraphql from "prettier/esm/parser-graphql.mjs";

import MD from 'markdown-it';
import { parse } from 'graphql';
import {buildClientSchema} from 'graphql';
import QueryVarsWindow from "./QueryVarsWindow";

export default class QueryWindow {

    constructor() {
        this.class = "querywindow";
        this.storageKey = "Graphvinci.codemirror";
        this.varswindow = new QueryVarsWindow();
    }

    get contents() {
        let res = {
            query: this.editor.getValue()
        };
        let vars = this.varswindow.contents;
        if (vars) {
            res.variables = JSON.stringify(vars);
        }
        let validQuery = null;
        try {
            validQuery = parse(res.query)
        }
        catch(err) {
            res.error = err;
        }
        res.ast = validQuery;
        return res;
    }


    build(container, varsContainer) {
        this.visible = true;
        let self = this;
        let storedContents = localStorage.getItem(this.storageKey);
        let previousQuery = null;
        let previousVars = null;
        try {
            if (storedContents) {
                let localContents = JSON.parse(storedContents);
                previousQuery = localContents.query;
                previousVars = localContents.vars;
            }
        }
        catch(err) {
            // Common in transition of local storage data type
        }

        // I don't like timeouts in general, but this is the easiest way to make sure the tree view is updated
        // upon reload
        setTimeout(function(){
            self.push_change();
        }, 500)
        container.append('textarea')
            .attr('class', "mirrorarea")
            .attr('id', "codewindow")
            .property('value', previousQuery)


        if (! GlobalViz.vis?.schema) return;

        let myGraphQLSchema = buildClientSchema(Visualizer.schema.schemaJson.data);
        let myContainer = document.getElementById("codecontainer");
        let myTextArea = document.getElementById("codewindow");
        // Pretty sure that info isnt being fired at all, but I will leave it in for now
        let md = new MD();


        this.editor = CodeMirror.fromTextArea(myTextArea, {
            mode: 'graphql',
            tabSize: 2,
            keyMap: 'sublime',
            lint: {
                schema: myGraphQLSchema,
            },
            hintOptions: {
                schema: myGraphQLSchema,
                closeOnUnfocus: false,
                completeSingle: false,
                container: myContainer
            },
            info: {
                schema: myGraphQLSchema,
                renderDescription: text => md.render(text)
            },
            jump: {
                schema: myGraphQLSchema
            },
            theme: "idea",
            lineNumbers: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
                'Ctrl-Space': () =>
                    this.editor.showHint({completeSingle: true, container: myContainer}),
                'Ctrl-Enter': () => {

                    GlobalViz.vis?.query_bottom_window.play();
                }

            },
            autoCloseBrackets: true,
            matchBrackets: true
        });

        this.editor.setSize("100%", "100%");

        this.editor.on("change", () => {
            this.push_change();
        });

        this.varswindow.build(varsContainer, previousVars);
    }

    prettify() {
        let contents = this.editor.getValue();
        let prettified = prettier.format(contents, {
            parser: "graphql",
            plugins: [parserGraphql],
        });
        this.editor.setValue(prettified);
    }

    push_change() {
        let contents = this.editor.getValue();
        let vars = this.varswindow.contents;
        let validQuery = null;
        try {
            validQuery = parse(contents)
        }
        catch(err) {
            // Pretty Normal during mid-states
        }
        if (validQuery !== null) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify({query: contents, vars: JSON.stringify(vars, null, 2)}));
                GlobalViz.vis?.query_top_window.update_results_from_ast(validQuery);
            }
            catch(err) {
                // Pretty Normal as the initial query is being typed
            }

        }
    }

    swap(data) {
        this.stash = {
            query: this.editor.getValue(),
            vars: this.varswindow.editor.getValue()
        }
        this.editor.setValue(data.operation);
        this.varswindow.editor.setValue(this._pretty(data.variables));
    }

    _pretty(json_string) {
        if (! json_string) return "";
        return JSON.stringify(JSON.parse(json_string), null, 2);
    }

    unswap() {
        if (! this.stash) return;
        this.editor.setValue(this.stash.query);
        this.varswindow.editor.setValue(this.stash.vars);
    }

    unstash() {
        delete this.stash;
    }
}

