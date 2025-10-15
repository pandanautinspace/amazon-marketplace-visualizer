import React from 'react';
import { UserAvatar } from '../UserAvatar';
import { CategoryBox } from '../CategoryBox';
import { getCurrentCategory } from '../../modules/breadcrumbs';

/**
 * Component that renders the PIXI visualization with user sprites
 */
export const VisualizerContainer = ({
    containerRef,
    remoteUsersData,
    userID,
    size
}) => {
    // Get current user data
    const currentUser = userID ? remoteUsersData[userID] : null;
    const currentCategory = currentUser ? getCurrentCategory(currentUser.location) : null;

    // Group users by category, excluding current user
    const usersByCategory = Object.entries(remoteUsersData).reduce((acc, [id, data]) => {
        if (id !== userID) {  // Skip current user
            const category = getCurrentCategory(data.location);
            if (category) {
                if (!acc[category]) acc[category] = [];
                acc[category].push({ id, ...data });
            }
        }
        return acc;
    }, {});

    return (
        <pixiContainer>
            {/* Current category users */}
            {currentCategory && usersByCategory[currentCategory] && (
                <pixiContainer y={20}>
                    <pixiText
                        text={`Users in ${currentCategory}: ${usersByCategory[currentCategory].length + 1}`}
                        x={10}
                        y={0}
                        style={{
                            fontSize: 14,
                            fill: 0x000000,
                        }}
                    />
                    {usersByCategory[currentCategory].map((user, index) => (
                        <UserAvatar
                            key={user.id}
                            x={50 + (index * 50)}
                            y={30}
                            hoverText={user.location}
                            userID={user.id}
                        />
                    ))}
                </pixiContainer>
            )}

            {/* Render current user's avatar in the center */}
            {currentUser && (
                <UserAvatar
                    key="self"
                    x={size.width / 2}
                    y={size.height / 2}
                    hoverText={currentUser.location}
                    userID={userID}
                />
            )}

            {/* Keep existing category boxes */}
            <CategoryBox x={size.width - 25} y={size.height - 25} url={"https://www.amazon.fr/s?i=fashion&rh=n%3A714112031&fs=true&ref=lp_714112031_sar"} categoryName={"Fashion"} />
            <CategoryBox x={size.width - 90} y={size.height - 25} url={"https://www.amazon.fr/s?i=electronics&rh=n%3A13921051&fs=true&ref=lp_13921051_sar"} categoryName={"Electronics"} />
            <CategoryBox x={size.width - 155} y={size.height - 25} url={"https://www.amazon.fr/s?i=computers&rh=n%3A565108&fs=true&ref=lp_565108_sar"} categoryName={"Computers"} />
            <CategoryBox x={size.width - 220} y={size.height - 25} url={"https://www.amazon.fr/s?i=beauty&rh=n%3A11055951&fs=true&ref=lp_11055951_sar"} categoryName={"Beauty"} />
        </pixiContainer>
    );
};