import Visualizer from "../Visualizer";

export const noDomain = "Uncategorized";
export default class DomainMetaManager {
    constructor() {
        this.domainPatternMatch = Visualizer.config.domainMatch || /GV\((.*?)\s*,\s*(.*?)\)/;
        this.multiMatch = new RegExp(this.domainPatternMatch.source, this.domainPatternMatch.flags + "g");
    }

    parse_field_metadata(field, parentName, parentDomain) {
        let domainInfo = {
            default: "cmt",
            cmt: noDomain
        }
        this._override(domainInfo, parentDomain)
            ._override(domainInfo, this._parse_domain_info_from_description(field.description))
            ._override(domainInfo, Visualizer.config?.get_current_schema()?.get_domain_mapping(parentName + "." + field.name));
        return domainInfo;
    }

    parse_node_metadata(nodeObj, defaultDomainInfo) {
        // Get the default domain info
        let domainInfo = {
            default: "cmt",
            cmt: noDomain
        }
        if (defaultDomainInfo) {
            domainInfo.default = defaultDomainInfo.default;
            domainInfo.cmt = defaultDomainInfo.cmt;
        }
        this._override(domainInfo, this._parse_domain_info_from_description(nodeObj.description))
        this._override(domainInfo, Visualizer.config.get_current_schema().get_domain_mapping(nodeObj.name));
        return domainInfo;
    }

    parse_node_metadata2(nodeObj, test) {
        if (test) {
            console.log(test)
        }
        // Get the default domain info
        let domainInfo = {
            default: "cmt",
            cmt: noDomain
        }
        this._override(domainInfo, this._parse_domain_info_from_description(nodeObj.description))
        this._override(domainInfo, Visualizer.config.get_current_schema().get_domain_mapping(nodeObj.name));
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