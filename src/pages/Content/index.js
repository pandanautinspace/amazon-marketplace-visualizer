import { printLine } from './modules/print';
import injectComponent from './modules/injector';

// console.log('Must reload extension for modifications to take effect.');

printLine('Amazon Market Visualizer is running...');
printLine('Current URL: ' + window.location.href);
printLine('Current Hostname: ' + window.location.hostname);

injectComponent(document);
