import React, { useRef, useEffect, useState } from 'react';

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
import VerticalSlider from '../../components/VerticalSlider/index.jsx';
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
    const { size, startResizing, setSize } = useResize(containerRef, appRef, DEFAULT_SIZE);

    // Button state
    const [showChat, setShowChat] = useState(false);
    const [mapScale, setMapScale] = useState(2);

    // Update user location in Firestore when it changes
    useLocationUpdater(userID, location);

    // Debug logging for remote users data
    useEffect(() => {
        console.log('Remote Users Data updated:', remoteUsersData);
    }, [remoteUsersData]);


    // Add a ref to track first render
    const isFirstRender = useRef(true);

    // Modified effect to skip first render
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (showChat) {
            setSize(prevSize => ({
                width: prevSize.width + 300,
                height: prevSize.height
            }));
        } else {
            setSize(prevSize => ({
                width: prevSize.width - 300,
                height: prevSize.height
            }));
        }
    }, [showChat, setSize]);

    // Chat toggle handler
    const handleChatToggle = () => {
        setShowChat(!showChat);
    };

    const categories = [
        { categoryName: "Fashion", nodeId: "11961521031" },
        { categoryName: "Electronics", nodeId: "13921051" },
        { categoryName: "Home", nodeId: "57004031" },
        { categoryName: "Beauty", nodeId: "197858031" }
    ];


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
                    <div>{location.displayData.title}</div>
                    <button onClick={handleChatToggle} style={{display: 'flex',justifyContent: 'flex-end', backgroundColor: 'lightblue'}} >
                        {showChat ? 'Hide Chat' : 'Show Chat'}
                    </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100% - 37px)' }}>
                {/* Slider Panel */}
                <div style={{
                    width: '50px',
                    borderRight: '1px solid #ddd',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <VerticalSlider 
                        value={mapScale}
                        onChange={setMapScale}
                        min={0.5}
                        max={2}
                    />
                </div>

                {/* Main Canvas */}
                <div style={{ ...BACKGROUND_STYLES, flex: 1 }} ref={divRef}>
                    <Application
                        autoStart
                        sharedTicker
                        backgroundAlpha={0}
                        resizeTo={divRef}
                        ref={appRef}
                    >
                        <VisualizerContainer
                            containerRef={containerRef}
                            remoteUsersData={remoteUsersData}
                            userID={userID}
                            size={containerSize}
                            categories={categories}
                            mapScale={mapScale}
                            setMapScale={setMapScale}
                        />
                    </Application>
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div style={{
                        width: '300px',
                        borderLeft: '1px solid #ddd',
                        backgroundColor: '#ffffff'
                    }}>
                        <ChatComponent />
                    </div>
                )}
            </div>
            <div
                onMouseDown={startResizing}
                style={RESIZE_HANDLE_STYLES}
                title="Drag to resize"
            />
        </div>
    );
};

export default Inject;
