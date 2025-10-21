import { printLine } from './modules/print';
import injectComponent from './modules/injector';
import { startNPCUpdates } from './modules/firebase';
import '../../styles/tailwind.css';


// console.log('Must reload extension for modifications to take effect.');

printLine('Amazon Market Visualizer is running...');
printLine('Current URL: ' + window.location.href);
printLine('Current Hostname: ' + window.location.hostname);

// Firebase configuration

// Start NPC updates when the content script loads
startNPCUpdates();

injectComponent(document);
