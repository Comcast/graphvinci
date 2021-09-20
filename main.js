import Configurator from './modules/config/Configurator.js';
import Visualizer from "./modules/Visualizer.js";
import samples from './sample-schemas.json';

let config = new Configurator(samples);
config.domainMatch = /Graphvinci\((.*?)\s*,\s*(.*?)\)/;
Visualizer.initialize(config).build();

window.Visualizer = Visualizer;
