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

import {getIntrospectionQuery} from "graphql";
import GlobalViz from "../GlobalViz";

export default class ProxyManager {

    _get_init_data(authHeaders, bodyData) {
        let headers = {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            ...authHeaders,
            ...GlobalViz.vis?.config.get_current_schema().additional_headers()
        }
        return {
            headers,
            "referrer": window.location.href,
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": bodyData,
            "method": "POST",
            "mode": "cors"
        };
    }

    send_query(query, variables) {
        return GlobalViz.vis?.config.get_current_authorization()
            .fetch_auth_headers()
            .then(headers => {
                let bodyData = JSON.stringify({
                    query: query,
                    variables: variables,
                    operationName: null
                })
                let initData = this._get_init_data(headers, bodyData);
                return fetch(GlobalViz.vis?.config.get_current_schema().url, initData)
                    .then(resp => {
                        if (!resp.ok) {
                            throw Error("Error sending request: " + resp.statusText + " => " + resp.status);
                        }
                        return resp.json()
                    })
            })

    }

    pull_schema() {
        return this.send_query(getIntrospectionQuery(), {});
    }

}
