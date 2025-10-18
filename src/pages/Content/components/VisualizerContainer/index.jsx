import React, { useEffect, useState } from 'react';
import { UserAvatar, CurrentUserAvatar } from '../UserAvatar';
import { CategoryBox } from '../CategoryBox';
import { getCurrentCategory } from '../../modules/breadcrumbs';
import { DragAndDropProvider } from '../DragAndDrop/DnDContext';

const WorldVisualizer = ({
    remoteUsersData,
    userID,
    categories,
    size
}) => {
    return (<>
        {Object.entries(remoteUsersData).map(([id, data]) => {
            if (id === userID) return null;
            return (
                <UserAvatar
                    key={id}
                    userID={id}
                    x={Math.random() * size.width}
                    y={Math.random() * size.height}
                    hoverText={data.location}
                />
            );
        })}
        {categories.map((cat) => (
            <CategoryBox
                key={cat.categoryName}
                x={size.width - (25 + (categories.indexOf(cat) * 65))}
                y={size.height - 25}
                url={`https://www.amazon.fr/b?node=${cat.nodeId}`}
                categoryName={cat.categoryName}
            />
        ))}
    </>)
}

const DepartmentVisualizer = ({
    departmentUsersData,
    userID,
    setViewWorld,
    size
}) => {
    return (
        <>
            {departmentUsersData?.map((user, index) => (
                <UserAvatar
                    key={user.id}
                    x={50 + (index * 50)}
                    y={30}
                    hoverText={user.location}
                    userID={user.id}
                />
            ))}
            <pixiText
                text="View World"
                x={size.width / 2}
                y={size.height - 50}
                style={{
                    fontSize: 12,
                }}
                anchor={0.5}
                interactive={true}
                cursor='pointer'
                eventMode='static'
                onPointerTap={() => setViewWorld(true)}
            />
        </>
    )
}
/**
 * Component that renders the PIXI visualization with user sprites
 */
export const VisualizerContainer = ({
    containerRef,
    remoteUsersData,
    userID,
    categories,
    size
}) => {
    // Get current user data
    const currentUser = userID ? remoteUsersData[userID] : null;
    const currentCategory = currentUser ? getCurrentCategory(currentUser.location) : null;
    const [viewWorld, setViewWorld] = useState(currentCategory === null);
    const [categoryState, setCategoryState] = useState(currentCategory);

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

    useEffect(() => {
        if (categoryState === null) {
            setViewWorld(true);
        } else {
            setViewWorld(false);
        }
    }, [categoryState]);

    useEffect(() => {
        if (currentCategory === categoryState) return;
        setCategoryState(currentCategory);
    }, [currentCategory]);

    return (
        <DragAndDropProvider>
            <pixiContainer>
                {categoryState && usersByCategory[categoryState] && (
                    <pixiContainer y={20}>
                        <pixiText
                            text={`Users in ${categoryState}: ${usersByCategory[categoryState].length + 1}`}
                            x={10}
                            y={0}
                            style={{
                                fontSize: 14,
                                fill: 0x000000,
                            }}
                        />
                    </pixiContainer>
                )}

                {!viewWorld && categoryState && (
                    <DepartmentVisualizer
                        departmentUsersData={usersByCategory[categoryState]}
                        userID={userID}
                        setViewWorld={setViewWorld}
                        size={size}
                    />
                )}

                {currentUser && (
                    <CurrentUserAvatar
                        key="self"
                        x={size.width / 2}
                        y={size.height / 2}
                        hoverText={currentUser.location}
                        userID={userID}
                    />
                )}

                {viewWorld && (
                    <WorldVisualizer
                        remoteUsersData={remoteUsersData}
                        userID={userID}
                        categories={categories}
                        size={size}
                    />
                )}
            </pixiContainer>
        </DragAndDropProvider>
    );
};