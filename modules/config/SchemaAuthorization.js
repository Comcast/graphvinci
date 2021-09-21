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

import Visualizer from "../Visualizer";

export const BEARER = "Bearer";
export const OAUTHCC = "OAuth2 Client Credentials";
export const NOAUTH = "None";
const CACHE_DEFAULT_TIMEOUT = 3600;

export default class SchemaAuthorization {
    constructor({name, type, bearer, url, client, secret, scopes, cacheTTL}) {
        this.name = name;
        this.type = type;
        this.bearer = bearer;
        this.url = url;
        this.client = client;
        this.secret = secret;
        this.scopes = scopes;
        this.cacheTTL = cacheTTL || CACHE_DEFAULT_TIMEOUT;
    }

    /*
    Creates the start of a promise chain that can subsequently include GraphQL requests.  These details are cached
    to avoid the need for repeated auth calls
     */
    fetch_auth_headers() {
        if (this.type === NOAUTH) {
            return new Promise((resolve, reject) => {
                resolve(null);
            })
        }
        if (this.type === BEARER) {
            return new Promise((resolve, reject) => {
                resolve({
                    Authorization: 'Bearer ' + this.bearer
                });
            })
        }
        if (this.type === OAUTHCC) {
            if (this._validCachedToken()) {
                return new Promise((resolve, reject) => {
                    resolve({
                        Authorization: 'Bearer ' + this.cachedToken
                    });
                })
            }
            return fetch(this.getOauthccUrl(), {
                "method": "POST"
            }).then(resp => {
                if (!resp.ok) {
                    throw Error("Error in auth helper: " + resp.statusText + " => " + resp.status);
                }
                return resp.json()
            }).then(data => {
                return {
                    Authorization: 'Bearer ' + data.access_token
                }
            })
        }
    }

    _validCachedToken() {
        return !!(this.cachedToken && (Math.floor(Date.now() / 1000) - this.cachedTokenTimestamp) < this.cacheTTL);
    }

    setToken(token) {
        this.cachedToken = token;
        this.cachedTokenTimestamp = Math.floor(Date.now() / 1000);
        // Trigger a save to local storage?
    }

    getOauthccUrl() {
        return this.url +
            '?client_id=' + this.client +
            '&client_secret=' + this.secret +
            '&scope=' + encodeURIComponent(this.scopes) +
            '&grant_type=client_credentials';
    }
}
