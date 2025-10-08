import React, { useRef, useEffect } from 'react';

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

    // Update user location in Firestore when it changes
    useLocationUpdater(userID, location);

    // Debug logging for remote users data
    useEffect(() => {
        console.log('Remote Users Data updated:', remoteUsersData);
    }, [remoteUsersData]);

    return (
        <div
            style={{
                ...CONTAINER_STYLES,
                width: size.width + 'px',
                height: size.height + 'px',
            }}
            ref={containerRef}
        >
            {/* PIXI.js Canvas Container */}
            <div class="h-1/2">
                <div style={BACKGROUND_STYLES} ref={divRef}>
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
            </div>

            <div class="grid grid-flow-col grid-rows-3 p-2 gap-2">
                <div class="row-span-3 bg-gray-200">
                    CHAT
                </div>
                <button class="col-span-2 bg-orange-400 p-3 rounded font-bold text-white">Good Deal</button>
                <button class="col-span-2 bg-orange-400 p-3 rounded font-bold text-white">Hello</button>
            </div>

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
