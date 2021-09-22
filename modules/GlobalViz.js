/*
A lame and cheap circular dependency hack, until I get something better
 */
class GlobalViz {
    constructor() {
        this.vis = undefined;
    }

}

export default new GlobalViz();