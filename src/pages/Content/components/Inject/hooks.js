import { useState, useEffect } from 'react';
import {
    addDoc,
    doc,
    setDoc,
    collection,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
} from 'firebase/firestore';

import { db } from '../../modules/firebase';
import { getMarketplaceLocationData } from '../../modules/breadcrumbs';

/**
 * Hook to manage user ID from Chrome storage
 */
export const useUserID = () => {
    const [userID, setUserID] = useState(null);

    useEffect(() => {
        chrome.storage.local.get('userID').then((result) => {
            if (result.userID) {
                setUserID(result.userID);
            }
        });
    }, []);

    return userID;
};

/////////////////////////////////////////
/**
 * Hook to manage messages in Firestore. fetching, sending updating
 */
export const useMessages = () => {
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Subscribe to messages collection
    useEffect(() => {
        setLoading(true);

        // Create a query sorted by timestamp
        const messagesQuery = query(
            collection(db, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(
            messagesQuery,
            (snapshot) => {
                const messagesData = {};
                snapshot.forEach((docSnap) => {
                    messagesData[docSnap.id] = docSnap.data();
                });
                setMessages(messagesData);
                setLoading(false);
            },
            (error) => {
                console.error('Error listening to messages collection:', error);
                setError(error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Function to send a new message
    const sendMessage = async (
        userId,
        messageContent,
        messageType = 'text',
        category = null
    ) => {
        try {
            const messageData = {
                userId,
                message: messageContent,
                type: messageType,
                timestamp: serverTimestamp(),
            };

            // Add category if provided (for proximity mode)
            if (category) {
                messageData.category = category;
            }

            const docRef = await addDoc(
                collection(db, 'messages'),
                messageData
            );
            return docRef.id;
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error);
            throw error;
        }
    };

    // // Function to update an existing message
    // const updateMessage = async (messageId, updates) => {
    //     try {
    //         const messageRef = doc(db, 'messages', messageId);
    //         await updateDoc(messageRef, updates);
    //     } catch (error) {
    //         console.error('Error updating message:', error);
    //         setError(error);
    //         throw error;
    //     }
    // };

    // Get messages as an array sorted by timestamp
    const getMessagesArray = () => {
        return Object.entries(messages)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => {
                // Handle cases where timestamp might be null/undefined
                const timeA = a.timestamp?.toMillis
                    ? a.timestamp.toMillis()
                    : 0;
                const timeB = b.timestamp?.toMillis
                    ? b.timestamp.toMillis()
                    : 0;
                return timeA - timeB;
            });
    };

    return {
        messages,
        messagesArray: getMessagesArray(),
        loading,
        error,
        sendMessage,
        // updateMessage
    };
};
////////////////////////////////////////////////////////

/**
 * Hook to subscribe to all messages in Firestore
 */
export const useRemoteUsers = () => {
    const [remoteUsersData, setRemoteUsersData] = useState({});

    useEffect(() => {
        const usersCollection = collection(db, 'users');

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
                console.error('Error listening to users collection:', error);
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

        const userRef = doc(db, 'users', userID);
        setDoc(userRef, { location }, { merge: false })
            .then(() => {
                console.log('Location updated for:', userID);
            })
            .catch((error) => {
                console.error('Error writing document: ', error);
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
                height: element.clientHeight,
            });
            console.log('Container size updated:', {
                width: element.clientWidth,
                height: element.clientHeight,
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
export const useResize = (
    containerRef,
    appRef,
    initialSize = { width: 300, height: 300 }
) => {
    const [size, setSize] = useState(initialSize);

    const startResizing = (e) => {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth =
            containerRef.current?.offsetWidth || initialSize.width;
        const startHeight =
            containerRef.current?.offsetHeight || initialSize.height;

        const handleMouseMove = (e) => {
            const newWidth = startWidth - (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);

            const updatedSize = {
                width: Math.max(400, newWidth), // Minimum width of 400px
                height: Math.max(400, newHeight), // Minimum height of 400px
            };

            setSize(updatedSize);

            // Trigger PIXI resize if app ref is available
            if (appRef.current?.getApplication) {
                appRef.current.getApplication().queueResize();
            }
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return { size, startResizing, setSize };
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
            const currentLocation = getMarketplaceLocationData(
                document,
                window
            );

            if (JSON.stringify(currentLocation) !== JSON.stringify(location)) {
                console.log('Marketplace location changed:', currentLocation);
                setLocation(currentLocation);
            }
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, [location]);

    return location;
};
