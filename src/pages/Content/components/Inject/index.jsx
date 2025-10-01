import React, { useCallback, useEffect } from 'react';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

import 'pixi.js/unsafe-eval';
import {
    Application,
    extend,
    useTick
} from '@pixi/react';
import {
    Container,
    Graphics,
    Sprite,
    Text
} from 'pixi.js';

import { BunnySprite } from './BunnySprite';
import { Rectangle } from './ProductCategories';
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

const VisualizerContainer = () => {
    const mkt = getMarketplaceLocationData(document, window);

    const [remoteUsersData, setRemoteUsersData] = React.useState({});
    const [userID, setUserID] = React.useState(null);
    const lastUpdateRef = React.useRef(0);

    useEffect(() => {
        console.log('Remote Users Data updated:', remoteUsersData);
    }, [remoteUsersData]);

    // Load our userID once
    useEffect(() => {
        chrome.storage.local.get("userID").then((result) => {
            if (result.userID) {
                setUserID(result.userID);
            }
        });
    }, []);

    // Subscribe to all remote users in real-time
    useEffect(() => {
        const usersCollection = collection(db, "users");

        const unsubscribe = onSnapshot(
            usersCollection,
            (snapshot) => {
                const usersData = {};
                snapshot.forEach((docSnap) => {
                    usersData[docSnap.id] = docSnap.data();
                });
                setRemoteUsersData(usersData);
            },
            (error) => {
                console.error("Error listening to users collection:", error);
            }
        );

        return () => unsubscribe();
    }, []);

    // Update *our own* location every 15s
    const tickCallback = useCallback(
        () => {
            const now = Date.now();
            if (now - lastUpdateRef.current < 60000) return; // throttle to 60s
            lastUpdateRef.current = now;

            if (!userID) return;

            const userRef = doc(db, "users", userID);
            setDoc(userRef, { location: mkt }, { merge: true })
                .then(() => {
                    console.log("Location updated for:", userID);
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                });
        },
        [mkt, userID]
    );

    useTick(tickCallback);
        
    return (
        <pixiContainer>
            {/* Other users in a grid */}
            {Object.entries(remoteUsersData)
                .filter(([id]) => id !== userID) // exclude self
                .map(([id, data], index) => (
                    <BunnySprite
                        key={id}
                        x={50 + (index % 5) * 50}
                        y={50 + Math.floor(index / 5) * 50}
                        hoverText={data.location}
                        userID={id}
                    />
                ))}

            {/* Our own bunny fixed in the center */}
            {userID && remoteUsersData[userID] && (
                <BunnySprite
                    key="self"
                    x={300 / 2}
                    y={500 / 2}
                    hoverText={remoteUsersData[userID].location}
                    userID={userID}
                />
            )}
            <Rectangle x={50} y={50} width={50} height={50} color={0xeeeeee} productCat={'Phones'} />
        </pixiContainer>
    );
};



const Inject = () => {
    const mkt = getMarketplaceLocationData(document, window);

    const [remoteUsersData, setRemoteUsersData] = React.useState({});
    useEffect(() => {

    }, []);

    useEffect(() => {
        console.log('Remote Users Data updated:', remoteUsersData);
    }, [remoteUsersData]);

    return (
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif', position: 'fixed', top: '10px', right: '10px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10000, maxWidth: '300px', maxHeight: '500px', overflow: 'auto' }}>
            <Application autoStart sharedTicker width={300} height={500}>
                <VisualizerContainer />

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
