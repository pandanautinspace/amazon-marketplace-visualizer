import React, { useEffect, useState, useRef } from 'react';
import { UserAvatar, CurrentUserAvatar } from '../UserAvatar';
import { CategoryBox } from '../CategoryBox';
import { getCurrentCategory, getUrlFromLocation } from '../../modules/breadcrumbs';
import { DragAndDropProvider } from '../DragAndDrop/DnDContext';
import { useApplication, extend, useTick } from '@pixi/react';
import { chromeSpriteSheetLocs as sprite } from '../../modules/spritesheet_locs';
import { Texture, Assets, TilingSprite, Rectangle, Container } from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';

extend({ TilingSprite, CompositeTilemap });

const positionFromIndex = (index) => {
    const leftMult = index % 2 === 0 ? -1 : 1;
    const topMult = index % 4 < 2 ? -1 : 1;
    const xInt = (Math.floor(index / 4) + 1) * leftMult;

    const x = (xInt * 48) - 24;
    const y = -topMult * 48 - 24;
    return { x, y };
}

// Create a background layer that will handle all dragging
const BackgroundLayer = ({ size, mapOffset, isDragging, onDrag }) => {
    return (
        <pixiGraphics
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            zIndex={-150}
            cursor={isDragging ? 'grabbing' : 'grab'}
            eventMode='static'
            interactive={true}
            draw={g => {
                g.clear();
                g.rect(0, 0, size.width, size.height).fill(0xFFFFFF, 0.01); // Almost transparent fill
            }}
            onPointerDown={onDrag}
        />
    );
}

const WorldVisualizer = ({
    remoteUsersData,
    userID,
    categories,
    size
}) => {
    const tilemapRef = React.useRef(null);
    const [tilemap, setTilemap] = useState(null);

    if (tilemap) {
        tilemap.clear();
        for (let i = 0; i <= 5; i++) {
            for (let j = 0; j <= 20; j++) {
                let x = size.width * 4 + (i - 3) * 64;
                let y = size.height * 4 + (j - 4) * 64 - 24;
                let tile_name = 'road-12';
                if (!((j > 0 && j < 4) || (j > 12 && j < 16))) {
                    if (i === 0) {
                        tile_name = 'road-11';
                        if (j === 0) {
                            tile_name = 'road-0';
                        } else if (j === 20) {
                            tile_name = 'road-14';
                        }
                    } else if (i === 5) {
                        tile_name = 'road-13';
                        if (j === 0) {
                            tile_name = 'road-10';
                        } else if (j === 20) {
                            tile_name = 'road-16';
                        }
                    } else if (j === 0) {
                        tile_name = 'road-9';
                    } else if (j === 20) {
                        tile_name = 'road-15';
                    }
                }
                tilemap.tile(tile_name, x, y);
            }
        }
        const numBuildings = Math.min(categories.length);
        for (let i = 0; i < 4; i++) {
            let capIndex = numBuildings + i;
            let { x, y } = positionFromIndex(capIndex);
            if (x < 0) {
                for (let k = 0; k <= 3; k++) {
                    tilemap.tile('road-11', size.width * 4 + (x + 40) * 8, size.height * 4 + y * 8 + k * 64 + 512 - 64 * 3);
                }
            } else {
                for (let k = 0; k <= 3; k++) {
                    tilemap.tile('road-13', size.width * 4 + x * 8, size.height * 4 + y * 8 + k * 64 + 512 - 64 * 3);
                }
            }
        }
    }
    useTick(() => {
        if (tilemapRef.current && !tilemap) {
            setTilemap(tilemapRef.current);
        }
    });

    return (<>
        <pixiContainer scale={0.125} zIndex={-50}>
            <pixiCompositeTilemap ref={tilemapRef} />
        </pixiContainer>
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
                        y={y + size.height * 2}
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
                    x={(x + size.width / 2)}
                    y={(y + size.height / 2)}
                    url={cat.url ?? `https://www.amazon.fr/b?node=${cat.nodeId}`}
                    categoryName={cat.categoryName}
                    tilemap={tilemap}
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

    const tilemapRef = React.useRef(null);
    const [tilemap, setTilemap] = useState(null);
    useTick(() => {
        if (tilemapRef.current && !tilemap) {
            setTilemap(tilemapRef.current);
        }
    });

    if (tilemap) {
        tilemap.clear();
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                tilemap.tile('road-8', size.width * 2 - 32 + i * 64, size.height * 2 - 32 + j * 64, { tileWidth: 64, tileHeight: 64 });
            }
        }
    }

    return (
        <>
            <pixiContainer scale={0.25} zIndex={-60} eventMode='none'>
                <pixiCompositeTilemap ref={tilemapRef} />
            </pixiContainer>
            {departmentUsersData?.map((user, index) => {
                let i = index % 11 - 5;
                let j = Math.floor(index / 11) - 5;
                let x = size.width * 2 + i * 64;
                let y = size.height * 2 + j * 64;

                return (
                    <pixiContainer key={user.id} scale={0.25}>
                        <UserAvatar
                            x={x}
                            y={y}
                            hoverText={user.location}
                            userID={user.id}
                        />
                    </pixiContainer>
                )
            })}
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
                        g.circle(0, 0, 12).stroke({ width: 2, color: 0x000000 }).fill({ r: 255, g: 255, b: 255, a: 0.7 });
                        g.moveTo(-6, 0).lineTo(6, 0).stroke({ width: 2, color: 0x000000 });
                        g.moveTo(0, -6).lineTo(0, 6).stroke({ width: 2, color: 0x000000 });
                    }}
                    onPointerTap={() => {
                        setMapScale(prev => Math.min(prev * 1.25, 2));
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
                        g.circle(0, 0, 12).stroke({ width: 2, color: 0x000000 }).fill({ r: 255, g: 255, b: 255, a: 0.7 });
                        g.moveTo(-6, 0).lineTo(6, 0).stroke({ width: 2, color: 0x000000 });
                    }}
                    onPointerTap={() => {
                        setMapScale(prev => Math.max(prev * 0.8, 0.5));
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
    size,
    mapScale,
    setMapScale  // We receive this prop from Inject
}) => {
    // Get current user data
    const currentUser = userID ? remoteUsersData[userID] : null;
    const currentCategory = currentUser ? getCurrentCategory(currentUser.location) : null;
    const [viewWorld, setViewWorld] = useState(currentCategory === null);
    const [categoryState, setCategoryState] = useState(currentCategory);
    const [mapOffset, setMapOffset] = useState({ x: -size.width / 2, y: -size.height / 2 });
    // const [mapScale, setMapScale] = useState(2);
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [lastPointerPosition, setLastPointerPosition] = useState(null);
    const [pointerTarget, setPointerTarget] = useState(null);
    const worldContainerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!assetsLoaded) {
            const spritesToLoad = [];
            Object.values(sprite.buildings).forEach((buildingArray, buildingIdx) => {
                buildingArray.forEach((buildingSrc, imgIdx) => {
                    spritesToLoad.push({
                        src: buildingSrc,
                        parser: 'loadTextures',
                        alias: `building-${buildingIdx}-${imgIdx}`
                    });
                });
            });
            Object.values(sprite.decor).forEach((decorSrc, imgIdx) => {
                spritesToLoad.push({
                    src: decorSrc,
                    parser: 'loadTextures',
                    alias: `decor-${imgIdx}`
                });
            });
            Object.values(sprite.land).forEach((landSrc, imgIdx) => {
                spritesToLoad.push({
                    src: landSrc,
                    parser: 'loadTextures',
                    alias: `land-${imgIdx}`
                });
            });
            Object.values(sprite.road).forEach((roadSrc, imgIdx) => {
                spritesToLoad.push({
                    src: roadSrc,
                    parser: 'loadTextures',
                    alias: `road-${imgIdx}`
                });
            });
            // Load all sprites
            Assets.load(spritesToLoad).then(() => {
                setAssetsLoaded(true);
            });
        }
    }, [assetsLoaded]);

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

    // Improved drag handling
    const handleBackgroundDrag = (e) => {
        setIsDragging(true);
        setLastPointerPosition({ x: e.clientX, y: e.clientY });
        setPointerTarget('background');
    };

    // Handle pointer events on the main container
    const handlePointerDown = (e) => {
        // Store the original target to distinguish between background drag and interaction with elements
        if (e.target.eventMode === 'static' && e.target.cursor === 'grab') {
            setIsDragging(true);
            setLastPointerPosition({ x: e.clientX, y: e.clientY });
            setPointerTarget('background');
            e.stopPropagation();
        }
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        
        // Only process drag movement if we're dragging the background
        if (pointerTarget === 'background') {
            const dx = e.clientX - lastPointerPosition.x;
            const dy = e.clientY - lastPointerPosition.y;

            setMapOffset(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));

            setLastPointerPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        setLastPointerPosition(null);
        setPointerTarget(null);
    };

    // Handle pinch zoom
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            setLastPointerPosition({ distance });
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && lastPointerPosition?.distance) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const newDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch2.clientY
            );

            const scale = newDistance / lastPointerPosition.distance;
            setMapScale(prev => Math.min(Math.max(prev * scale, 0.5), 2));
            setLastPointerPosition({ distance: newDistance });
        }
    };

    // Handle wheel zoom
    const handleWheel = (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setMapScale(prev => Math.min(Math.max(prev * zoomFactor, 0.5), 2));
    };

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        element.addEventListener('wheel', handleWheel);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointerleave', handlePointerUp);
        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchmove', handleTouchMove);

        return () => {
            element.removeEventListener('wheel', handleWheel);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointerleave', handlePointerUp);
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
        };
    }, [isDragging, lastPointerPosition]);

    if (!assetsLoaded) {
        return (
            <pixiText
                text="Loading assets..."
                x={size.width / 2}
                y={size.height / 2}
                style={{
                    fontSize: 24,
                    fill: 0x000000,
                }}
                anchor={0.5}
            />
        );
    }

    return (
        <DragAndDropProvider>
            {/* This background layer always captures drag events */}
            <BackgroundLayer 
                size={size} 
                mapOffset={mapOffset} 
                isDragging={isDragging}
                onDrag={handleBackgroundDrag}
            />

            <pixiTilingSprite
                texture={Assets.get('land-0')}
                width={size.width}
                height={size.height}
                anchor={0}
                tileScale={{ x: 0.25 * mapScale, y: 0.25 * mapScale }}  // Apply scale here
                tilePosition={{ x: size.width * 0.5 + mapOffset.x, y: size.height * 0.5 + mapOffset.y }}
                zIndex={-100}
                eventMode='static'
                cursor={isDragging ? 'grabbing' : 'grab'}
                interactive={true}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
            />

            {/* Re-enable zoom buttons */}
            <MapNavigator 
                size={size} 
                setMapOffset={setMapOffset}
                setMapScale={setMapScale}  // Add this back
            />

            <pixiContainer 
                ref={worldContainerRef}
                scale={mapScale}  // Apply scale here
                x={mapOffset.x} 
                y={mapOffset.y}
            >
                <pixiContainer ref={contentRef}>
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
            </pixiContainer>
        </DragAndDropProvider>
    );
};