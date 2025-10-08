import { useState, useEffect } from 'react';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';

import { db } from '../../modules/firebase';
import { getMarketplaceLocationData } from '../../modules/breadcrumbs';

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

/**
 * Hook to handle resizing functionality for the inject component
 */
export const useResize = (containerRef, appRef, initialSize = { width: 300, height: 300 }) => {
    const [size, setSize] = useState(initialSize);

    const startResizing = (e) => {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = containerRef.current?.offsetWidth || initialSize.width;
        const startHeight = containerRef.current?.offsetHeight || initialSize.height;

        const handleMouseMove = (e) => {
            const newWidth = startWidth - (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);

            const updatedSize = {
                width: Math.max(100, newWidth),  // Minimum width of 100px
                height: Math.max(100, newHeight), // Minimum height of 100px
            };

            setSize(updatedSize);

            // Trigger PIXI resize if app ref is available
            if (appRef.current?.getApplication) {
                appRef.current.getApplication().queueResize();
            }
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    return { size, startResizing };
};

/**
 * Hook to track marketplace location changes
 */
export const useMarketplaceLocation = () => {
    const [location, setLocation] = useState(() =>
        getMarketplaceLocationData(document, window)
    );

    useEffect(() => {
        // Check for location changes periodically
        const interval = setInterval(() => {
            const currentLocation = getMarketplaceLocationData(document, window);

            if (JSON.stringify(currentLocation) !== JSON.stringify(location)) {
                console.log('Marketplace location changed:', currentLocation);
                setLocation(currentLocation);
            }
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, [location]);

    return location;
};