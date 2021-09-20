import MenuData from "../burger_menu/MenuData";
import VerticalMenu, {DEFAULTHEIGHT} from "../burger_menu/VerticalMenu";
import SchemaStack from "../burger_menu/SchemaStack";
import Visualizer from "../Visualizer";
import SchemaConfig from "../burger_menu/SchemaConfig";
import AuthStack from "../burger_menu/AuthStack";
import AuthConfig from "../burger_menu/AuthConfig";

export default class ConfigurationMenu extends VerticalMenu {

    _get_menu_data() {
        let self = this;
        this.data = new MenuData();
        let update_func = function() {
            self.update_state();
        }
        let schemaStack = new SchemaStack(this.actualWidth, DEFAULTHEIGHT, update_func);
        if (! this.openTo) schemaStack.expanded = true;
        this.data.add_child(schemaStack);
        let schemas = Visualizer.config.schemas;
        for (let schemaName in schemas) {
            let schema = new SchemaConfig(this.actualWidth, DEFAULTHEIGHT, schemas[schemaName])
            if (this.openTo && this.openTo.name === schemaName) {
                schemaStack.expanded = true;
                schema.expanded = true;
            }
            schemaStack.add_child(schema);
        }
        let authStack = new AuthStack(this.actualWidth, DEFAULTHEIGHT)
        this.data.add_child(authStack);
        let authorizations = Visualizer.config.authorizations;
        for (let authName in authorizations) {
            let auth = new AuthConfig(this.actualWidth, DEFAULTHEIGHT, authorizations[authName])
            if (this.openTo && this.openTo.name === authName) {
                authStack.expanded = true;
                auth.expanded = true;
            }
            authStack.add_child(auth);
        }
    }
}
