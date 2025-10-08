import React, { useRef, useEffect, useState} from 'react';

// PIXI.js setup
import 'pixi.js/unsafe-eval';
import { Application, extend } from '@pixi/react';
import { Container, Graphics, Sprite, Text } from 'pixi.js';

// Local components and hooks
import '../../modules/firebase'; // Initialize Firebase
import { VisualizerContainer } from '../VisualizerContainer';
import { useUserID, useRemoteUsers, useLocationUpdater, useContainerSize } from './hooks';
import { useResize, useMarketplaceLocation } from './hooks';
import {
    CONTAINER_STYLES,
    BACKGROUND_STYLES,
    RESIZE_HANDLE_STYLES,
    DEFAULT_SIZE
} from './constants';

import ChatComponent from './ChatComponent';
// Extend PIXI components for use with @pixi/react
extend({
    Container,
    Graphics,
    Sprite,
    Text
});



/**
 * Main Inject component that renders the marketplace visualizer
 * as a draggable, resizable overlay on Amazon pages
 */
const Inject = () => {
    // Refs for DOM elements and PIXI app
    const divRef = useRef(null);
    const containerRef = useRef(null);
    const appRef = useRef(null);

    // Custom hooks for data and behavior
    const location = useMarketplaceLocation();
    const userID = useUserID();
    const remoteUsersData = useRemoteUsers();
    const containerSize = useContainerSize(divRef);
    const { size, startResizing } = useResize(containerRef, appRef, DEFAULT_SIZE);

    // Button state
    const [showChat, setShowChat] = useState(false);

    // Update user location in Firestore when it changes
    useLocationUpdater(userID, location);

    // Debug logging for remote users data
    useEffect(() => {
        console.log('Remote Users Data updated:', remoteUsersData);
    }, [remoteUsersData]);


    // Chat toggle handler
    const handleChatToggle = () => {
        setShowChat(!showChat);
    };

    
    // Container content based on what's active
    const renderContent = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                <div style={{ ...BACKGROUND_STYLES, flex: 1 }} ref={divRef}>
                    <Application
                        autoStart
                        sharedTicker
                        backgroundAlpha={0}
                        resizeTo={divRef}
                        ref={appRef}
                    >
                        <VisualizerContainer
                            containerRef={divRef}
                            remoteUsersData={remoteUsersData}
                            userID={userID}
                            size={containerSize}
                        />
                    </Application>
                </div>
                {showChat && (
                    <div style={{ 
                        width: '300px', 
                        height: '100%',
                        borderLeft: '1px solid #ddd',
                        backgroundColor: '#ffffff'
                    }}>
                        <ChatComponent />
                    </div>
                )}
            </div>
        );
    };

    
    return (
        <div
            style={{
                ...CONTAINER_STYLES,
                width: size.width + 'px',
                height: size.height + 'px',
            }}
            ref={containerRef}
        >
            <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '5px',
                    backgroundColor: '#f0f0f0',
                    borderBottom: '1px solid #ddd'
                }}>
                    <button onClick={handleChatToggle}>
                        {showChat ? 'Hide Chat' : 'Show Chat'}
                    </button>
            </div>
                {/* Render either the PIXI visualizer or the chat component */}
                {renderContent()}
            {/* Resize Handle */}
            <div
                onMouseDown={startResizing}
                style={RESIZE_HANDLE_STYLES}
                title="Drag to resize"
            />
        </div>
    );
};

export default Inject;
