import Visualizer from "../Visualizer";

const bigClass = "domainheader";

export default class DomainNodeSizer {

    constructor(domain) {
        this.rows = 0;
        this.height =  5;
        this.width = 10;
        this.marginX = 100;
        this.marginY = 100;
        this.spacer = 25;
        this._get_sizing(domain);
    }

    _get_sizing(domain) {
        let nameDetail = Visualizer.d3text_sizer.get_sizing(domain, bigClass);
        let paddedWidth = nameDetail.width + this.marginX;
        let paddedHeight = nameDetail.height + this.marginY;
        this.height = paddedHeight > this.height ? paddedHeight : this.height;
        this.width = paddedWidth > this.width ? paddedWidth : this.width;
    }

    get centerTextAnchorX() {
        return (this.width / 2);
    }

    get rowMidPoint() {
        return this.height / 2;
    }

    get targetPoints() {
        let northX = this.width / 2;
        let northY = 0 - this.spacer;
        let southX = this.width / 2;
        let southY = this.height + this.spacer;
        let westX = 0 - this.spacer;
        let westY = this.height / 2;
        let eastX = this.width + this.spacer;
        let eastY = this.height / 2;
        return [
            { x: northX, y: northY},
            { x: southX, y: southY},
            { x: westX, y: westY},
            { x: eastX, y: eastY}
        ];
    }

    get radius() {
        return this.height > this.width ? this.height / 1.8 : this.width / 1.8;
    }

}