import noDomain from '../config/DomainMetaManager'

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