import React, { useEffect, useState } from 'react';
import { UserAvatar, CurrentUserAvatar } from '../UserAvatar';
import { CategoryBox } from '../CategoryBox';
import { getCurrentCategory, getUrlFromLocation } from '../../modules/breadcrumbs';
import { DragAndDropProvider } from '../DragAndDrop/DnDContext';
import { useApplication } from '@pixi/react';

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
            const { x, y } = positionFromIndex(index);
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
                <pixiContainer key={user.id} scale={0.25}>
                    <UserAvatar
                        x={50 + (index * 50)}
                        y={30}
                        hoverText={user.location}
                        userID={user.id}
                    />
                </pixiContainer>
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

const MapNavigator = ({ size, setMapOffset, setMapScale }) => {
    console.log('MapNavigator size', size);
    return (
        <>
            <pixiContainer zIndex={500}>
                <pixiGraphics
                    x={0}
                    y={size.height / 2}
                    anchor={{
                        x: 0,
                        y: 0.5
                    }}
                    cursor='pointer'
                    eventMode='static'
                    draw={g => {
                        g.clear();
                        g.moveTo(0, 0).lineTo(20, -10).lineTo(20, 10).closePath().fill(0x000000);
                    }}
                    onPointerTap={() => setMapOffset(prev => ({ x: prev.x + 20, y: prev.y }))}
                />
                <pixiGraphics
                    x={size.width}
                    y={size.height / 2}
                    anchor={{
                        x: 1,
                        y: 0.5
                    }}
                    cursor='pointer'
                    eventMode='static'
                    draw={g => {
                        g.clear();
                        g.moveTo(0, 0).lineTo(-20, -10).lineTo(-20, 10).closePath().fill(0x000000);
                    }}
                    onPointerTap={() => setMapOffset(prev => ({ x: prev.x - 20, y: prev.y }))}
                />
                <pixiGraphics
                    x={size.width / 2}
                    y={0}
                    anchor={{
                        x: 0.5,
                        y: 0
                    }}
                    cursor='pointer'
                    eventMode='static'
                    draw={g => {
                        g.clear();
                        g.moveTo(0, 0).lineTo(-10, 20).lineTo(10, 20).closePath().fill(0x000000);
                    }}
                    onPointerTap={() => setMapOffset(prev => ({ x: prev.x, y: prev.y + 20 }))}
                />
                <pixiGraphics
                    x={size.width / 2}
                    y={size.height - 10}
                    anchor={{
                        x: 0.5,
                        y: 1
                    }}
                    cursor='pointer'
                    eventMode='static'
                    draw={g => {
                        g.clear();
                        g.moveTo(0, 0).lineTo(-10, -20).lineTo(10, -20).closePath().fill(0x000000);
                    }}
                    onPointerTap={() => setMapOffset(prev => ({ x: prev.x, y: prev.y - 20 }))}
                />
                <pixiGraphics
                    x={size.width - 30}
                    y={30}
                    cursor='pointer'
                    eventMode='static'
                    draw={g => {
                        g.clear();
                        // Zoom in: circle with plus
                        g.circle(0, 0, 12).stroke({ width: 2, color: 0x000000 });
                        g.moveTo(-6, 0).lineTo(6, 0).stroke({ width: 2, color: 0x000000 });
                        g.moveTo(0, -6).lineTo(0, 6).stroke({ width: 2, color: 0x000000 });
                    }}
                    onPointerTap={() => {
                        setMapScale(prev => prev * 1.25);
                    }}
                />
                <pixiGraphics
                    x={size.width - 30}
                    y={60}
                    cursor='pointer'
                    eventMode='static'
                    draw={g => {
                        g.clear();
                        // Zoom out: circle with minus
                        g.circle(0, 0, 12).stroke({ width: 2, color: 0x000000 });
                        g.moveTo(-6, 0).lineTo(6, 0).stroke({ width: 2, color: 0x000000 });
                    }}
                    onPointerTap={() => {
                        setMapScale(prev => prev * 0.8);
                    }}
                />
            </pixiContainer>
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
    const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
    const [mapScale, setMapScale] = useState(1);

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
    const allCategories = [...categories, ...usersCategories].filter((v, i, a) => a.findIndex(item => item.categoryName === v.categoryName) === i);

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
            <MapNavigator size={size} setMapOffset={setMapOffset} setMapScale={setMapScale} />
            <pixiContainer scale={mapScale} x={mapOffset.x} y={mapOffset.y}>
                {categoryState && usersByCategory[categoryState] && (
                    <pixiText
                        text={`Users in ${categoryState}: ${usersByCategory[categoryState].length + 1}`}
                        x={10}
                        y={20}
                        style={{
                            fontSize: 14,
                            fill: 0x000000,
                        }}
                    />
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