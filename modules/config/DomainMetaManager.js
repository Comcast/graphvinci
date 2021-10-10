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

import GlobalViz from '../GlobalViz';
import { noDomain } from '../Constants'

class DomainMetaManager {
    constructor() {
        this.domainPatternMatch = GlobalViz.vis?.config.domainMatch || /GV\((.*?)\s*,\s*(.*?)\)/;
        this.multiMatch = new RegExp(this.domainPatternMatch.source, this.domainPatternMatch.flags + "g");
    }

    parse_field_metadata(field, parentName, parentDomain) {
        let domainInfo = {
            default: "cmt",
            cmt: noDomain
        }
        this._override(domainInfo, parentDomain)
            ._override(domainInfo, this._parse_domain_info_from_description(field.description))
            ._override(domainInfo, GlobalViz.vis?.config?.get_current_schema()?.get_domain_mapping(parentName + "." + field.name));
        return domainInfo;
    }

    parse_node_metadata(nodeObj, defaultDomainInfo) {
        // Get the default domain info
        let domainInfo = {
            default: "cmt",
            cmt: nodeObj.name
        }
        if (defaultDomainInfo) {
            domainInfo.default = defaultDomainInfo.default;
            domainInfo.cmt = defaultDomainInfo.cmt;
        }
        this._override(domainInfo, this._parse_domain_info_from_description(nodeObj.description))
        this._override(domainInfo, GlobalViz.vis?.config.get_current_schema().get_domain_mapping(nodeObj.name));
        return domainInfo;
    }

    _override(master, source) {
        if (! source) {
            return this;
        }
        for (let prop in source) {
            if (source.hasOwnProperty(prop)) {
                master[prop] = source[prop];
            }
        }
        return this;
    }

    _parse_domain_info_from_description(description) {
        if (typeof (description) === 'string' &&
            description !== "") {
            let matched = description.match(this.multiMatch);
            if (matched !== null) {
                let domainInfo = {};
                for (let matchedElement of matched) {
                    let innerMatch = matchedElement.match(this.domainPatternMatch);
                    if (innerMatch) {
                        domainInfo[innerMatch[1]] = innerMatch[2];
                    }
                }
                return domainInfo;
            }
        }
        return null;
    }

}

export default new DomainMetaManager();