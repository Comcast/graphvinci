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

import { noDomain } from '../Constants'

export default class DomainAwareEntity {
    constructor(domainInfo) {
        /*
        This is a temporary shim, as I work to make domain a complex data type rather than a simple string
         */
        if (! domainInfo) {
            domainInfo = noDomain;
        }
        if (typeof(domainInfo) === 'string') {
            let adjustedInfo = {
                cmt: domainInfo,
                default: "cmt"
            }
            domainInfo = adjustedInfo;
        }
        this.domainInfo = domainInfo;
        this.default = this.domainInfo.default || "cmt";
    }

    get domain() {
        return this.domainInfo[this.default];
    };

    get_domain_detail(type) {
        return this.domainInfo[type];
    }

}
