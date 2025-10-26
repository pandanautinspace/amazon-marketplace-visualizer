import React, { useEffect, useState, useRef } from 'react';
import { UserAvatar, CurrentUserAvatar } from '../UserAvatar';
import { CategoryBox } from '../CategoryBox';
import { getCurrentCategory, getUrlFromLocation } from '../../modules/breadcrumbs';
import { DragAndDropProvider } from '../DragAndDrop/DnDContext';
import { useApplication, extend, useTick } from '@pixi/react';
import { chromeSpriteSheetLocs as sprite } from '../../modules/spritesheet_locs';
import { Texture, Assets, TilingSprite, Rectangle, Container } from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';
import { EMOJI_MESSAGES } from '../ChatComponent/index.jsx';

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
    size,
    usersByCategory,
    userLastMessageTime = {},
    userLastMessageEmoji = {}
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
        <pixiContainer scale={0.125} zIndex={-50} eventMode='none'>
            <pixiCompositeTilemap ref={tilemapRef} />
        </pixiContainer>
        {Object.entries(remoteUsersData).map(([id, data], index) => {
            if (id === userID) return null;
            const category = getCurrentCategory(data.location);
            if (category) return null; // Skip users in departments

            // Group users by pageType for clustering
            const pageType = data.location?.pageType || 'other';
            const usersInWorld = Object.entries(remoteUsersData).filter(([uid, udata]) => {
                if (uid === userID) return false;
                const cat = getCurrentCategory(udata.location);
                return !cat; // Only users in world view
            });

            // Find all users with the same pageType
            const samePageTypeUsers = usersInWorld.filter(([uid, udata]) =>
                (udata.location?.pageType || 'other') === pageType
            );

            // Find this user's index within their pageType cluster
            const clusterIndex = samePageTypeUsers.findIndex(([uid]) => uid === id);

            // Calculate cluster position - pageTypes are assigned to positions in a grid
            const pageTypes = ['product', 'search', 'browse', 'storefront', 'amazon-store', 'other'];
            const pageTypeIndex = pageTypes.indexOf(pageType);
            const basePos = positionFromIndex(pageTypeIndex);

            // Offset within cluster (spiral pattern around base position)
            // Increase spacing to avoid overlap - avatars are ~16px diameter at 0.25 scale
            const angle = (clusterIndex * 1.5) % (Math.PI * 2); // Wider angle distribution
            const radius = clusterIndex > 0 ? 12 + Math.floor(clusterIndex / 3) * 12 : 0; // Start at 12px, increase by 12px per ring of 3
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            const { x: baseX, y: baseY } = basePos;

            // Create a location key to help track location changes
            const locationKey = `${pageType}-${clusterIndex}`;

            return (
                <pixiContainer key={id} scale={0.5}>
                    <UserAvatar
                        userID={id}
                        x={baseX + size.width + offsetX}
                        y={baseY + size.height + offsetY}
                        hoverText={data.location}
                        locationKey={locationKey}
                        lastMessageTime={userLastMessageTime[id]}
                        lastMessageEmoji={userLastMessageEmoji[id]}
                    />
                </pixiContainer>
            );
        })}
        {categories.map((cat, index) => {
            const { x, y } = positionFromIndex(index);
            const userCount = usersByCategory[cat.categoryName]?.length || 0;
            return (
                <CategoryBox
                    key={cat.categoryName}
                    x={(x + size.width / 2)}
                    y={(y + size.height / 2)}
                    url={cat.url ?? `https://www.amazon.fr/b?node=${cat.nodeId}`}
                    categoryName={cat.categoryName}
                    tilemap={tilemap}
                    userCount={userCount}
                />
            )
        })}
    </>)
}

const DepartmentVisualizer = ({
    departmentUsersData,
    userID,
    setViewWorld,
    size,
    userLastMessageTime = {},
    userLastMessageEmoji = {}
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
                // Group users by pageType
                const pageType = user.location?.pageType || 'other';

                // Find all users with the same pageType in this department
                const samePageTypeUsers = departmentUsersData.filter(u =>
                    (u.location?.pageType || 'other') === pageType
                );

                // Find this user's index within their pageType cluster
                const clusterIndex = samePageTypeUsers.findIndex(u => u.id === user.id);

                // Calculate cluster base position - pageTypes are assigned to grid positions
                const pageTypes = ['product', 'search', 'browse', 'storefront', 'amazon-store', 'other'];
                const pageTypeIndex = pageTypes.indexOf(pageType);

                // Base position for this pageType cluster (grid layout)
                // Increase spacing between clusters
                const clusterX = (pageTypeIndex % 3 - 1) * 4; // -4, 0, or 4 (increased from 3)
                const clusterY = (Math.floor(pageTypeIndex / 3) - 1) * 4; // -4 or 0 (increased from 3)

                // Offset within cluster (spiral pattern)
                // Increase spacing between users - avatars are ~16px at 0.25 scale = 64px in world coords
                const angle = (clusterIndex * 1.2) % (Math.PI * 2); // Wider angle distribution
                const radius = clusterIndex > 0 ? 1 + Math.floor(clusterIndex / 3) * 1 : 0; // Start at 1 unit, increase by 1 per ring of 3
                const offsetX = Math.cos(angle) * radius;
                const offsetY = Math.sin(angle) * radius;

                let x = size.width + (clusterX + offsetX) * 32;
                let y = size.height + (clusterY + offsetY) * 32;

                // Create a location key to help track location changes
                const locationKey = `${pageType}-${clusterIndex}`;

                return (
                    <pixiContainer key={user.id} scale={0.5}>
                        <UserAvatar
                            x={x}
                            y={y}
                            hoverText={user.location}
                            userID={user.id}
                            locationKey={locationKey}
                            lastMessageTime={userLastMessageTime[user.id]}
                            lastMessageEmoji={userLastMessageEmoji[user.id]}
                        />
                    </pixiContainer>
                )
            })}
        </>
    )
}

const MapNavigator = ({ size, setMapOffset, setMapScale }) => {
    const lightBrown = 0xD2B48C; // Light brown/tan color
    const darkBrown = 0x5C4033;  // Dark brown color

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
                        g.moveTo(0, 0).lineTo(20, -10).lineTo(20, 10).closePath().fill(lightBrown).stroke({ width: 2, color: darkBrown });
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
                        g.moveTo(0, 0).lineTo(-20, -10).lineTo(-20, 10).closePath().fill(lightBrown).stroke({ width: 2, color: darkBrown });
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
                        g.moveTo(0, 0).lineTo(-10, 20).lineTo(10, 20).closePath().fill(lightBrown).stroke({ width: 2, color: darkBrown });
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
                        g.moveTo(0, 0).lineTo(-10, -20).lineTo(10, -20).closePath().fill(lightBrown).stroke({ width: 2, color: darkBrown });
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
                        g.circle(0, 0, 12).stroke({ width: 2, color: darkBrown }).fill(lightBrown);
                        g.moveTo(-6, 0).lineTo(6, 0).stroke({ width: 2, color: darkBrown });
                        g.moveTo(0, -6).lineTo(0, 6).stroke({ width: 2, color: darkBrown });
                    }}
                    onPointerTap={() => setMapScale(prev => Math.min(prev * 1.25, 3))}
                />
                <pixiGraphics
                    x={size.width - 30}
                    y={60}
                    cursor='pointer'
                    eventMode='static'
                    draw={g => {
                        g.clear();
                        // Zoom out: circle with minus
                        g.circle(0, 0, 12).stroke({ width: 2, color: darkBrown }).fill(lightBrown);
                        g.moveTo(-6, 0).lineTo(6, 0).stroke({ width: 2, color: darkBrown });
                    }}
                    onPointerTap={() => setMapScale(prev => Math.max(prev * 0.8, 0.5))}
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
    canvasRef,
    remoteUsersData,
    userID,
    categories,
    size,
    mapScale,
    setMapScale,  // We receive this prop from Inject
    messagesArray = []
}) => {
    // Get current user data
    const currentUser = userID ? remoteUsersData[userID] : null;
    const currentCategory = currentUser ? getCurrentCategory(currentUser.location) : null;
    const [viewWorld, setViewWorld] = useState(currentCategory === null);
    const [categoryState, setCategoryState] = useState(currentCategory);

    // Calculate last message time for each user
    const userLastMessageTime = React.useMemo(() => {
        const messageTimeMap = {};
        messagesArray.forEach(message => {
            if (message.userId && message.timestamp) {
                const messageTime = message.timestamp.toMillis
                    ? message.timestamp.toMillis()
                    : Date.now();
                if (!messageTimeMap[message.userId] || messageTime > messageTimeMap[message.userId]) {
                    messageTimeMap[message.userId] = messageTime;
                }
            }
        });
        return messageTimeMap;
    }, [messagesArray]);

    // Calculate last message emoji for each user
    const userLastMessageEmoji = React.useMemo(() => {
        const messageEmojiMap = {};
        const messageTimes = {};
        messagesArray.forEach(message => {
            if (message.userId && message.timestamp && message.type === 'emoji') {
                const messageTime = message.timestamp.toMillis
                    ? message.timestamp.toMillis()
                    : Date.now();
                if (!messageTimes[message.userId] || messageTime > messageTimes[message.userId]) {
                    messageTimes[message.userId] = messageTime;
                    // Find emoji from EMOJI_MESSAGES based on message text
                    const emojiData = EMOJI_MESSAGES.find(em => em.message === message.message);
                    messageEmojiMap[message.userId] = emojiData?.emoji || null;
                }
            }
        });
        return messageEmojiMap;
    }, [messagesArray]);

    // Calculate initial offset to center the currentUserAvatar (which is at size.width/2, size.height/2 in world coords)
    // Screen center should show world point (size.width/2, size.height/2)
    // Formula: offset = screenPoint - worldPoint * scale
    const initialOffset = {
        x: size.width / 2 - (size.width / 2) * mapScale,
        y: size.height / 2 - (size.height / 2) * mapScale
    };

    const [mapOffset, setMapOffset] = useState(initialOffset);
    // const [mapScale, setMapScale] = useState(2);
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [lastPointerPosition, setLastPointerPosition] = useState(null);
    const [pointerTarget, setPointerTarget] = useState(null);
    const worldContainerRef = useRef(null);
    const contentRef = useRef(null);
    const prevMapScaleRef = useRef(mapScale);

    // Adjust offset when scale changes to zoom from center
    useEffect(() => {
        const prevScale = prevMapScaleRef.current;
        if (prevScale !== mapScale) {
            // The center of the screen in screen coordinates
            const centerX = size.width / 2;
            const centerY = size.height / 2;

            // Calculate what world point is currently at the center
            // worldPoint = (screenPoint - offset) / scale
            const worldCenterX = (centerX - mapOffset.x) / prevScale;
            const worldCenterY = (centerY - mapOffset.y) / prevScale;

            // Calculate new offset to keep the same world point at the center
            // screenPoint = worldPoint * scale + offset
            // offset = screenPoint - worldPoint * scale
            setMapOffset({
                x: centerX - worldCenterX * mapScale,
                y: centerY - worldCenterY * mapScale
            });

            prevMapScaleRef.current = mapScale;
        }
    }, [mapScale, size.width, size.height]);

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
            setMapScale(prev => Math.min(Math.max(prev * scale, 0.5), 3));
            setLastPointerPosition({ distance: newDistance });
        }
    };

    // Handle wheel zoom
    const handleWheel = (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setMapScale(prev => Math.min(Math.max(prev * zoomFactor, 0.5), 3));
    };

    useEffect(() => {
        const element = canvasRef?.current;
        if (!element) return;

        element.addEventListener('wheel', handleWheel, { passive: false });
        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchmove', handleTouchMove);

        return () => {
            element.removeEventListener('wheel', handleWheel);
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
        };
    }, [canvasRef, mapScale]);

    // Separate effect for window pointer events (needed for drag to work even when cursor leaves canvas)
    useEffect(() => {
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointerleave', handlePointerUp);

        return () => {
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointerleave', handlePointerUp);
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
                tileScale={{ x: 0.25 * mapScale, y: 0.25 * mapScale }}
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
                    {!viewWorld && categoryState && (
                        <DepartmentVisualizer
                            departmentUsersData={usersByCategory[categoryState]}
                            userID={userID}
                            setViewWorld={setViewWorld}
                            size={size}
                            userLastMessageTime={userLastMessageTime}
                            userLastMessageEmoji={userLastMessageEmoji}
                        />
                    )}

                    {currentUser && (
                        <pixiContainer scale={0.5}>
                            <CurrentUserAvatar
                                key="self"
                                x={size.width}
                                y={size.height}
                                hoverText={currentUser.location}
                                userID={userID}
                                lastMessageTime={userLastMessageTime[userID]}
                                lastMessageEmoji={userLastMessageEmoji[userID]}
                            />
                        </pixiContainer>
                    )}

                    {viewWorld && (
                        <WorldVisualizer
                            remoteUsersData={remoteUsersData}
                            userID={userID}
                            categories={allCategories}
                            size={size}
                            usersByCategory={usersByCategory}
                            userLastMessageTime={userLastMessageTime}
                            userLastMessageEmoji={userLastMessageEmoji}
                        />
                    )}
                </pixiContainer>
            </pixiContainer>

            {/* UI Layer - not affected by map scale/offset */}
            <pixiContainer zIndex={1000}>
                {categoryState && usersByCategory[categoryState] && (
                    <pixiText
                        text={`Users in ${categoryState}: ${usersByCategory[categoryState].length + 1}`}
                        x={10}
                        y={20}
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            fill: 0xD2B48C,  // Light brown
                            stroke: 0x5C4033, // Dark brown outline
                            strokeThickness: 1,
                        }}
                    />
                )}

                {!viewWorld && categoryState && (
                    <pixiText
                        text="View World"
                        x={size.width / 2}
                        y={size.height - 50}
                        style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: 0xD2B48C,  // Light brown
                            stroke: 0x5C4033, // Dark brown outline
                            strokeThickness: 1,
                        }}
                        anchor={0.5}
                        interactive={true}
                        cursor='pointer'
                        eventMode='static'
                        onPointerTap={() => setViewWorld(true)}
                    />
                )}

                {viewWorld && categoryState && (
                    <pixiText
                        text="Return to Department"
                        x={size.width / 2}
                        y={size.height - 50}
                        style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: 0xD2B48C,  // Light brown
                            stroke: 0x5C4033, // Dark brown outline
                            strokeThickness: 1,
                        }}
                        anchor={0.5}
                        interactive={true}
                        cursor='pointer'
                        eventMode='static'
                        onPointerTap={() => setViewWorld(false)}
                    />
                )}
            </pixiContainer>
        </DragAndDropProvider>
    );
};