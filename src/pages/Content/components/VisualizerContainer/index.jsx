import React from 'react';
import { UserAvatar } from '../UserAvatar';
import { Rectangle } from 'pixi.js';
import FloatingNotification from './FloatingNotification';


import { Application, extend } from '@pixi/react';
import { Container, Graphics, Sprite, Text } from 'pixi.js';
extend({
    Container,
    Graphics,
    Sprite,
    Text  
});
/**
 * Component that renders the PIXI visualization with user sprites
 */
export const VisualizerContainer = ({
    containerRef,
    remoteUsersData,
    userID,
    size,
    category
}) => {
    // Filter out current user from remote users
    const otherUsers = Object.entries(remoteUsersData)
        .filter(([id]) => id !== userID);

    // Get current user data
    const currentUser = userID ? remoteUsersData[userID] : null;

    return (
        <pixiContainer eventMode='dynamic' hitArea={new Rectangle(0, 0, size.width, size.height)} zIndex={0} sortableChildren={true}>
            {/* Render other users in a grid layout */}
            {otherUsers.map(([id, data], index) => (
                <UserAvatar
                    key={id}
                    x={50 + (index % 5) * 50}
                    y={50 + Math.floor(index / 5) * 50}
                    hoverText={data?.location || 'Unknown location'}
                    userID={id}
                />
            ))}

            {/* Render current user's bunny in the center */}
            {currentUser && (
                <UserAvatar
                    key="self"
                    x={size.width / 2}
                    y={size.height / 2}
                    hoverText={currentUser.location || 'Current location'}
                    userID={userID}
                />
            )}
            {/* <pixiText text="Hello" x={size.width / 2} y={(size.height / 2)- 30}/> */}

        </pixiContainer>
    );
};