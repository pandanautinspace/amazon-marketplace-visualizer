import React, { useCallback, useEffect, useState, useRef } from 'react';

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

const VisualizerContainer = ({ containerRef }) => {
    const mkt = getMarketplaceLocationData(document, window);

    const [remoteUsersData, setRemoteUsersData] = React.useState({});
    const [userID, setUserID] = useState(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const lastUpdateRef = useRef(0);

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

    useEffect(() => {
        if (containerRef.current) {
            const element = containerRef.current;
            const handleResize = () => {
                setSize({
                    width: element.clientWidth,
                    height: element.clientHeight
                });
            };

            handleResize(); // Call it initially
            const resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(element);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, [containerRef]);

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
    ); //Stop using tick callback for now

    useEffect(() => {
        if (!userID) return;

        const userRef = doc(db, "users", userID);
        setDoc(userRef, { location: mkt }, { merge: false })
            .then(() => {
                console.log("Location updated for:", userID);
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }, [mkt, userID]);

    // useTick(tickCallback);

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
                    x={size.width / 2}
                    y={size.height / 2}
                    hoverText={remoteUsersData[userID].location}
                    userID={userID}
                />
            )}
        </pixiContainer>
    );
};



const Inject = () => {
    const mkt = getMarketplaceLocationData(document, window);
    const divRef = useRef(null);
    const containerRef = useRef(null);
    const appRef = useRef(null);
    const [size, setSize] = useState({ width: 300, height: 300 });

    const startResizing = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = containerRef.current.offsetWidth;
        const startHeight = containerRef.current.offsetHeight;

        const doDrag = (e) => {
            const newWidth = startWidth - (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            setSize({
                width: Math.max(100, newWidth),  // min width
                height: Math.max(100, newHeight),
            });
            appRef.current.getApplication().queueResize();
        };

        const stopDrag = () => {
            window.removeEventListener("mousemove", doDrag);
            window.removeEventListener("mouseup", stopDrag);
        };

        window.addEventListener("mousemove", doDrag);
        window.addEventListener("mouseup", stopDrag);
    };

    const [remoteUsersData, setRemoteUsersData] = useState({});
    useEffect(() => {

    }, []);

    useEffect(() => {
        console.log('Remote Users Data updated:', remoteUsersData);
    }, [remoteUsersData]);

    return (
        <div style={{
            padding: '10px',
            fontFamily: 'Arial, sans-serif',
            position: 'fixed',
            top: '10px',
            right: '10px',
            overflow: 'hidden',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10000,
            width: size.width + 'px',
            height: size.height + 'px',
        }}
            ref={containerRef}
        >
            <div style={{
                background: 'radial-gradient(circle at center, #f8f8f8 0%, #eaeaea 100%)',
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 2px, transparent 30%), radial-gradient(circle, rgba(0,0,0,0.08) 2px, transparent 30%)',
                backgroundSize: '24px 14px',
                backgroundPosition: '0 0, 12px 7px',
                width: '100%',
                height: '100%',
                borderRadius: '5px',
                boxSizing: 'border-box',
            }}
                ref={divRef}
            >
                <Application autoStart sharedTicker backgroundAlpha={0} resizeTo={divRef} ref={appRef}>
                    <VisualizerContainer containerRef={divRef} />
                </Application>
            </div>
            <div
                onMouseDown={startResizing}
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "16px",
                    height: "16px",
                    background: "#888",
                    cursor: "nesw-resize",
                    borderRadius: "4px",
                }}
            />
        </div>
    );
};

export default Inject;
