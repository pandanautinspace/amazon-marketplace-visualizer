import React, { useRef, useEffect, useState } from 'react';

// PIXI.js setup
import 'pixi.js/unsafe-eval';
import { Application, extend } from '@pixi/react';
import { Container, Graphics, Sprite, Text } from 'pixi.js';

// Local components and hooks
import '../../modules/firebase'; // Initialize Firebase
import { VisualizerContainer } from '../VisualizerContainer';
import { useUserID, useRemoteUsers, useLocationUpdater, useContainerSize, useMessages } from './hooks';
import { useResize, useMarketplaceLocation } from './hooks';
import {
    CONTAINER_STYLES,
    BACKGROUND_STYLES,
    RESIZE_HANDLE_STYLES,
    DEFAULT_SIZE,
    COLORS
} from './constants';
import VerticalSlider from '../../components/VerticalSlider/index.jsx';
import ChatComponent from '../ChatComponent/index.jsx';
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
    const { messagesArray } = useMessages();
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
                width: (size.width + 50) + 'px',
                height: size.height + 'px',
            }}
            ref={containerRef}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: COLORS.lightBrown,
                borderBottom: `2px solid ${COLORS.darkBrown}`,
                borderRadius: '5px 5px 0 0'
            }}>
                <div style={{
                    color: COLORS.darkBrown,
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>{location.displayData.title}</div>
                <button
                    onClick={handleChatToggle}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: COLORS.green,
                        color: COLORS.white,
                        border: `1px solid ${COLORS.darkBrown}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px'
                    }}
                >
                    {showChat ? 'Hide Chat' : 'Show Chat'}
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100% - 45px)' }}>
                {/* Slider Panel */}
                <div style={{
                    width: '50px',
                    flexShrink: 0,
                    borderRight: `2px solid ${COLORS.darkBrown}`,
                    backgroundColor: COLORS.offWhite,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <VerticalSlider
                        value={mapScale}
                        onChange={setMapScale}
                        min={0.5}
                        max={3}
                    />
                </div>

                {/* Main Canvas */}
                <div style={{ ...BACKGROUND_STYLES, flex: 1, minWidth: 0 }} ref={divRef}>
                    <Application
                        autoStart
                        sharedTicker
                        backgroundAlpha={0}
                        resizeTo={divRef}
                        ref={appRef}
                        antialias={true}
                        resolution={window.devicePixelRatio || 2}
                        autoDensity={true}
                    >
                        <VisualizerContainer
                            containerRef={containerRef}
                            canvasRef={divRef}
                            remoteUsersData={remoteUsersData}
                            userID={userID}
                            size={containerSize}
                            categories={categories}
                            mapScale={mapScale}
                            setMapScale={setMapScale}
                            messagesArray={messagesArray}
                        />
                    </Application>
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div
                        data-chat-container
                        style={{
                            width: '300px',
                            borderLeft: `2px solid ${COLORS.darkBrown}`,
                            backgroundColor: COLORS.offWhite
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
