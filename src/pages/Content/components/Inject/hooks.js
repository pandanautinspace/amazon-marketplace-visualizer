import { useState, useEffect } from 'react';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Hook to manage user ID from Chrome storage
 */
export const useUserID = () => {
    const [userID, setUserID] = useState(null);

    useEffect(() => {
        chrome.storage.local.get("userID").then((result) => {
            if (result.userID) {
                setUserID(result.userID);
            }
        });
    }, []);

    return userID;
};

/**
 * Hook to subscribe to all users in Firestore
 */
export const useRemoteUsers = () => {
    const [remoteUsersData, setRemoteUsersData] = useState({});

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

    return remoteUsersData;
};

/**
 * Hook to update user location in Firestore
 */
export const useLocationUpdater = (userID, location) => {
    useEffect(() => {
        if (!userID || !location) return;

        const userRef = doc(db, "users", userID);
        setDoc(userRef, { location }, { merge: false })
            .then(() => {
                console.log("Location updated for:", userID);
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }, [userID, location]);
};

/**
 * Hook to track container size changes
 */
export const useContainerSize = (containerRef) => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const element = containerRef.current;
        const handleResize = () => {
            setSize({
                width: element.clientWidth,
                height: element.clientHeight
            });
        };

        handleResize(); // Call initially
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [containerRef]);

    return size;
};