import {getIntrospectionQuery} from "graphql";
import Visualizer from "../Visualizer";

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
            ...Visualizer.config.get_current_schema().additional_headers()
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
        return Visualizer.config.get_current_authorization()
            .fetch_auth_headers()
            .then(headers => {
                let bodyData = JSON.stringify({
                    query: query,
                    variables: variables,
                    operationName: null
                })
                let initData = this._get_init_data(headers, bodyData);
                return fetch(Visualizer.config.get_current_schema().url, initData)
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
