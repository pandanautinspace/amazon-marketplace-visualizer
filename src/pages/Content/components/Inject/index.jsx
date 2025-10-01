import React, { useEffect } from 'react';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';

import 'pixi.js/unsafe-eval';
import {
    Application,
    extend,
} from '@pixi/react';
import {
    Container,
    Graphics,
    Sprite,
    Text
} from 'pixi.js';

import { BunnySprite } from './BunnySprite';
import { getMarketplaceLocationData } from '../../modules/breadcrumbs';



extend({
    Container,
    Graphics,
    Sprite,
    Text
});

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



const Inject = () => {
    const mkt = getMarketplaceLocationData(document, window);

    const [remoteUsersData, setRemoteUsersData] = React.useState({});
    useEffect(() => {
        console.log('Marketplace Location Data:', mkt);
        chrome.storage.local.get("userID").then((result) => {
            console.log('User ID from storage:', result.userID);
            console.log('Complete Data:', { userID: result.userID, location: mkt });
            const userRef = doc(db, "users", result.userID);
            setDoc(userRef, { location: mkt }, { merge: false }).then(() => {
                console.log('Data successfully written to Firestore!');
            }).catch((error) => {
                console.error('Error writing document: ', error);
            });
        });

        const usersCollection = collection(db, "users");
        getDocs(usersCollection).then((querySnapshot) => {
            const usersData = {};
            querySnapshot.forEach((doc) => {
                usersData[doc.id] = doc.data();
            });
            console.log('Remote Users Data:', usersData);
            setRemoteUsersData(usersData);
        }).catch((error) => {
            console.error('Error getting documents: ', error);
        });
    }, []);

    useEffect(() => {
        console.log('Remote Users Data updated:', remoteUsersData);
    }, [remoteUsersData]);

    return (
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif', position: 'fixed', top: '10px', right: '10px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10000, maxWidth: '300px', maxHeight: '500px', overflow: 'auto' }}>
            <Application autoStart sharedTicker width={300} height={500}>

                {Object.entries(remoteUsersData).map(([userID, data], index) => (
                    <BunnySprite key={userID} x={50 + (index % 5) * 50} y={50 + Math.floor(index / 5) * 50} hoverText={data.location} />
                ))}
            </Application>
            <h3>Amazon Market Visualizer</h3>
            <strong>Your Marketplace Location Data:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px' }}>
                {JSON.stringify(mkt, null, 2)}
            </pre>
            <strong>Remote Users Data:</strong>
            {remoteUsersData ? Object.entries(remoteUsersData).map(([userID, data]) => (
                <div key={userID} style={{ marginBottom: '10px' }}>
                    <em>User ID:</em> {userID}
                    <br />
                    <em>Location:</em> {JSON.stringify(data.location, null, 2)}
                </div>
            )) : <p>No remote users data available.</p>}
        </div>
    );
};

export default Inject;
