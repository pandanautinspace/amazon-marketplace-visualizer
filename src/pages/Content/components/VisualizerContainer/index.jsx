import React, { useEffect, useState } from 'react';
import { UserAvatar, CurrentUserAvatar } from '../UserAvatar';
import { CategoryBox } from '../CategoryBox';
import { getCurrentCategory, getUrlFromLocation } from '../../modules/breadcrumbs';
import { DragAndDropProvider } from '../DragAndDrop/DnDContext';

const positionFromIndex = (index) => {
    const leftMult = index % 2 === 0 ? -1 : 1;
    const topMult = index % 4 < 2 ? -1 : 1;
    const xInt = (Math.floor(index / 4) + 1) * leftMult;

    const x = 50 + (xInt * 50);
    const y = -topMult * 50;
    return { x, y };
}

const WorldVisualizer = ({
    remoteUsersData,
    userID,
    categories,
    size
}) => {
    return (<>
        {Object.entries(remoteUsersData).map(([id, data], index) => {
            if (id === userID) return null;
            const category = getCurrentCategory(data.location);
            if (category) return null; // Skip users in departments
            const { x, y } = positionFromIndex(index);
            return (
                <pixiContainer key={id} scale={0.25}>
                    <UserAvatar
                        userID={id}
                        x={x + size.width * 2}
                        y={y + size.height * 4 - 50}
                        hoverText={data.location}
                    />
                </pixiContainer>
            );
        })}
        {categories.map((cat, index) => {
            console.log("Category Name:", cat.categoryName, "index:", index);
            const { x, y } = positionFromIndex(index);
            console.log("Position:", x, y);
            return (
                <CategoryBox
                    key={cat.categoryName}
                    x={x + size.width / 2}
                    y={y + size.height / 2}
                    url={cat.url ?? `https://www.amazon.fr/b?node=${cat.nodeId}`}
                    categoryName={cat.categoryName}
                />
            )
        })}
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

    const usersCategories = Object.keys(usersByCategory).filter((v, i, a) => a.indexOf(v) === i).map(cat => ({ categoryName: cat, url: getUrlFromLocation(usersByCategory[cat][0].location) }));
    console.log('userscategories', usersCategories);
    const allCategories = [...categories, ...usersCategories].filter((v, i, a) => a.findIndex(item => item.categoryName === v.categoryName) === i);
    console.log('allCategories', allCategories);

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

                {viewWorld && categoryState && (
                    <pixiText
                        text="Return to Department"
                        x={size.width / 2}
                        y={size.height - 50}
                        style={{
                            fontSize: 12,
                        }}
                        anchor={0.5}
                        interactive={true}
                        cursor='pointer'
                        eventMode='static'
                        onPointerTap={() => setViewWorld(false)}
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
                        categories={allCategories}
                        size={size}
                    />
                )}
            </pixiContainer>
        </DragAndDropProvider>
    );
};