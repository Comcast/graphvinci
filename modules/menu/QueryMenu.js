import ModeButton from "./ModeButton";

export const DEFAULTHEIGHT = 40;
export const DEFAULTWIDTH = 40;
import HMenu, {MenuData, Separator} from "./HMenu";

export const topStates = {
    Tree: 0,
    Meta: 1,
    Saved: 2
};

export const bottomStates = {
    Tree: 0,
    Json: 1
};


export default class QueryMenu extends HMenu {
    constructor(parentDiv) {
        super(parentDiv)
        this.data = new MenuData();
        this.data.add_entry(new Separator(8, DEFAULTHEIGHT, "Entity"));
        this.state = 0;
    }

    build() {
        super.build()
        this.parentDiv.style('width', this.data.width + 'px')
    }

    update_state() {
        super.update_state(this.state)
    }

    add_button(state, image, description, func) {
        let self = this;
        this.data.add_entry(new ModeButton(DEFAULTHEIGHT, DEFAULTWIDTH, state, image, description, () => {
            self.switch_mode(state)
            func()
        }));
        this.data.add_entry(new Separator(6, DEFAULTHEIGHT, "Entity"));
    }

    switch_mode(mode) {
        this.state = mode;
        this.update_state()
    }
}
