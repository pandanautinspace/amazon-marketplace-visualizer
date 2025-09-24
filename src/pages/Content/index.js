import { printLine } from './modules/print';
import injectComponent from './modules/injector';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

// console.log('Must reload extension for modifications to take effect.');

printLine('Amazon Market Visualizer is running...');
printLine('Current URL: ' + window.location.href);
printLine('Current Hostname: ' + window.location.hostname);

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXqzwK8ttww81D9ppYJDLdbKngEyA02AM",
    authDomain: "marketplace-backend-805fc.firebaseapp.com",
    projectId: "marketplace-backend-805fc",
    storageBucket: "marketplace-backend-805fc.firebasestorage.app",
    messagingSenderId: "976623190984",
    appId: "1:976623190984:web:aaead91b02b10d8d3ef6fd",
    measurementId: "G-XMTQFMP2ZH"
};
initializeApp(firebaseConfig);
const db = getFirestore();
console.log('Firestore initialized:', db);

injectComponent(document);
import { getMarketplaceLocationData } from './modules/breadcrumbs';

const marketplaceData = getMarketplaceLocationData(document, window);
console.log('Marketplace Location Data:', marketplaceData);
chrome.storage.local.get("userID").then((result) => {
    console.log('User ID from storage:', result.userID);
    console.log('Complete Data:', { userID: result.userID, location: marketplaceData });
    const userRef = doc(db, "users", result.userID);
    setDoc(userRef, { location: marketplaceData }, { merge: true }).then(() => {
        console.log('Data successfully written to Firestore!');
    }).catch((error) => {
        console.error('Error writing document: ', error);
    });
});

