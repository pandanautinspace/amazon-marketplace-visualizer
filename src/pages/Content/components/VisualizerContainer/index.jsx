import React from 'react';
import { UserAvatar } from '../UserAvatar';
import { CategoryBox } from '../CategoryBox';

/**
 * Component that renders the PIXI visualization with user sprites
 */
export const VisualizerContainer = ({
    containerRef,
    remoteUsersData,
    userID,
    size
}) => {
    // Filter out current user from remote users
    const otherUsers = Object.entries(remoteUsersData)
        .filter(([id]) => id !== userID);

    // Get current user data
    const currentUser = userID ? remoteUsersData[userID] : null;

    return (
        <pixiContainer>
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
            <CategoryBox x={size.width - 25} y={size.height - 25} url={"https://www.amazon.fr/s?i=fashion&rh=n%3A714112031&fs=true&ref=lp_714112031_sar"} categoryName={"Fashion"} />
            <CategoryBox x={size.width - 90} y={size.height - 25} url={"https://www.amazon.fr/s?i=electronics&rh=n%3A13921051&fs=true&ref=lp_13921051_sar"} categoryName={"Electronics"} />
            <CategoryBox x={size.width - 155} y={size.height - 25} url={"https://www.amazon.fr/s?i=computers&rh=n%3A565108&fs=true&ref=lp_565108_sar"} categoryName={"Computers"} />
            <CategoryBox x={size.width - 220} y={size.height - 25} url={"https://www.amazon.fr/s?i=beauty&rh=n%3A11055951&fs=true&ref=lp_11055951_sar"} categoryName={"Beauty"} />
        </pixiContainer>
    );
};