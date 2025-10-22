import {
    Assets,
    Texture,
} from 'pixi.js';
import React, { useCallback } from 'react';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import { useApplication, useTick } from '@pixi/react';
import { getUrlFromLocation } from '../../modules/breadcrumbs';
import { useDraggable } from '../../components/DragAndDrop/draggable';
import { useDropTarget } from '../../components/DragAndDrop/dropTarget';
import { spritesheetLocs } from '../../modules/spritesheet_locs';

export function UserAvatar({ x, y, hoverText, userID, locationKey, lastMessageTime, lastMessageEmoji }) {
    const avRef = useRef(null)
    const app = useApplication().app;

    const [texture, setTexture] = useState(Texture.EMPTY);
    const [isHovered, setIsHovered] = useState(false);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [storedUserID, setStoredUserID] = useState(null);
    const [showMessageIcon, setShowMessageIcon] = useState(false);

    // Animation state
    const [currentPos, setCurrentPos] = useState({ x, y });
    const [targetPos, setTargetPos] = useState({ x, y });
    const [prevLocationKey, setPrevLocationKey] = useState(locationKey);
    const animationSpeed = 0.15; // Lower = slower, smoother animation

    // Format the hover text - handle object or string
    const displayText = React.useMemo(() => {
        if (!hoverText) return 'Unknown Location';
        if (typeof hoverText === 'string') return hoverText;
        if (typeof hoverText === 'object') {
            // If it's an object, try to extract meaningful text
            return hoverText.displayData?.title || hoverText.title || JSON.stringify(hoverText);
        }
        return String(hoverText);
    }, [hoverText]);

    // Detect location changes and update target position
    useEffect(() => {
        if (locationKey !== prevLocationKey) {
            console.log(`User ${userID} location changed from ${prevLocationKey} to ${locationKey}`);
            setPrevLocationKey(locationKey);
        }
        setTargetPos({ x, y });
    }, [x, y, locationKey, prevLocationKey, userID]);

    // Show message icon for 15 seconds after a message is sent
    useEffect(() => {
        if (!lastMessageTime) {
            setShowMessageIcon(false);
            return;
        }

        const now = Date.now();
        const timeSinceMessage = now - lastMessageTime;

        if (timeSinceMessage < 15000) {
            setShowMessageIcon(true);
            const timer = setTimeout(() => {
                setShowMessageIcon(false);
            }, 15000 - timeSinceMessage);
            return () => clearTimeout(timer);
        } else {
            setShowMessageIcon(false);
        }
    }, [lastMessageTime]);

    // Animate towards target position
    useTick(() => {
        const dx = targetPos.x - currentPos.x;
        const dy = targetPos.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.5) {
            // Smooth lerp animation
            setCurrentPos({
                x: currentPos.x + dx * animationSpeed,
                y: currentPos.y + dy * animationSpeed
            });
        } else if (distance > 0) {
            // Snap to target when very close
            setCurrentPos({ x: targetPos.x, y: targetPos.y });
        }
    });

    useDropTarget(userID, avRef, {
        onDrop: () => {
            if (!hoverText) return;
            const locationUrl = getUrlFromLocation(hoverText);
            if (locationUrl) {
                window.location.href = locationUrl;
            }
        }
    });

    const clickCallBack = useCallback(() => {
        if (!hoverText) return;
        const locationUrl = getUrlFromLocation(hoverText);
        if (locationUrl) {
            window.location.href = locationUrl;
        }
    }, [hoverText]);

    useEffect(() => {
        if (texture === Texture.EMPTY) {
            const imageURL = `https://api.dicebear.com/9.x/adventurer/png?seed=${userID}&size=64`;
            Assets
                .load({
                    src: imageURL,
                    parser: 'loadTextures',
                    name: `user-avatar-${userID}`
                })
                .then((result) => {
                    setTexture(result)
                    console.log('User texture loaded');
                });
        }
    }, [texture, userID]);

    return (
        <>
            {isHovered && (
                <>
                    <pixiGraphics
                        x={currentPos.x}
                        y={currentPos.y}
                        zIndex={99}
                        draw={g => {
                            g.clear();
                            g.circle(0, 0, 8).stroke({ width: 1.5, color: 0xFFFF00 });
                        }}
                    />
                    {/* Dialog bubble background */}
                    <pixiGraphics
                        x={currentPos.x}
                        y={currentPos.y - 30}
                        zIndex={102}
                        draw={g => {
                            g.clear();
                            // Measure approximate text width (rough estimate)
                            const textWidth = Math.min(displayText?.length * 5 || 60, 120);
                            const padding = 8;
                            const bubbleWidth = textWidth + padding * 2;
                            const bubbleHeight = 20;

                            // Draw rounded rectangle background
                            g.roundRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 4)
                                .fill({ color: 0x000000, alpha: 0.8 })
                                .stroke({ width: 1.5, color: 0xFFFF00 });

                            // Draw small triangle pointer
                            g.moveTo(0, bubbleHeight / 2)
                                .lineTo(-4, bubbleHeight / 2 + 5)
                                .lineTo(4, bubbleHeight / 2 + 5)
                                .closePath()
                                .fill({ color: 0x000000, alpha: 0.8 });
                        }}
                    />
                    {/* Dialog bubble text */}
                    <pixiText
                        text={displayText}
                        x={currentPos.x}
                        y={currentPos.y - 30}
                        anchor={0.5}
                        zIndex={103}
                        style={{
                            fontSize: 8,
                            fill: 0xFFFFFF,
                            fontWeight: 'bold',
                            wordWrap: true,
                            wordWrapWidth: 120,
                            align: 'center',
                        }}
                        resolution={16}
                    />
                </>
            )}
            {/* Message icon indicator */}
            {showMessageIcon && (
                <>
                    {lastMessageEmoji ? (
                        // Show emoji if message type is emoji
                        <pixiText
                            text={lastMessageEmoji}
                            x={currentPos.x + 12}
                            y={currentPos.y - 12}
                            anchor={0.5}
                            zIndex={105}
                            style={{
                                fontSize: 16,
                            }}
                        />
                    ) : (
                        // Show default chat bubble icon
                        <>
                            {/* Icon background circle */}
                            <pixiGraphics
                                x={currentPos.x + 12}
                                y={currentPos.y - 12}
                                zIndex={104}
                                draw={g => {
                                    g.clear();
                                    g.circle(0, 0, 8)
                                        .fill({ color: 0x4CAF50, alpha: 1 })
                                        .stroke({ width: 1, color: 0xFFFFFF });
                                }}
                            />
                            {/* Message icon - simple chat bubble shape */}
                            <pixiGraphics
                                x={currentPos.x + 12}
                                y={currentPos.y - 12}
                                zIndex={105}
                                draw={g => {
                                    g.clear();
                                    // Draw rounded rectangle for chat bubble
                                    g.roundRect(-5, -4, 10, 7, 1.5)
                                        .fill({ color: 0xFFFFFF });
                                    // Draw small triangle pointer at bottom
                                    g.moveTo(-1, 3)
                                        .lineTo(0, 5)
                                        .lineTo(1, 3)
                                        .closePath()
                                        .fill({ color: 0xFFFFFF });
                                }}
                            />
                        </>
                    )}
                </>
            )}
            <pixiSprite
                ref={avRef}
                anchor={0.5}
                eventMode={'static'}
                onClick={clickCallBack}
                texture={texture}
                cursor={'pointer'}
                x={currentPos.x}
                y={currentPos.y}
                zIndex={100}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
            />
        </>
    );
}

export function CurrentUserAvatar({ x, y, hoverText, userID, lastMessageTime, lastMessageEmoji }) {
    const avRef = useRef(null)
    const app = useApplication().app;

    const [texture, setTexture] = useState(Texture.EMPTY);
    const [isHovered, setIsHovered] = useState(false);
    const [showMessageIcon, setShowMessageIcon] = useState(false);

    const { position, dragging, setPosition, eventHandlers } = useDraggable(avRef, { x, y });
    const onPointerDown = eventHandlers.pointerdown;
    const onPointerUp = eventHandlers.pointerup;
    const onPointerMove = eventHandlers.pointermove;
    const onPointerUpOutside = eventHandlers.pointerupoutside;

    useEffect(() => {
        if (position.x !== x || position.y !== y) {
            setPosition({ x, y });
        }
    }, [x, y]);

    // Show message icon for 15 seconds after a message is sent
    useEffect(() => {
        if (!lastMessageTime) {
            setShowMessageIcon(false);
            return;
        }

        const now = Date.now();
        const timeSinceMessage = now - lastMessageTime;

        if (timeSinceMessage < 15000) {
            setShowMessageIcon(true);
            const timer = setTimeout(() => {
                setShowMessageIcon(false);
            }, 15000 - timeSinceMessage);
            return () => clearTimeout(timer);
        } else {
            setShowMessageIcon(false);
        }
    }, [lastMessageTime]);

    const clickCallBack = useCallback(() => {
        if (!hoverText) return;
        const locationUrl = getUrlFromLocation(hoverText);
        if (locationUrl) {
            window.location.href = locationUrl;
        }
    }, [hoverText]);

    useEffect(() => {
        if (texture === Texture.EMPTY) {
            const imageURL = `https://api.dicebear.com/9.x/adventurer/png?seed=${userID}&size=64`;
            Assets.load({
                src: imageURL,
                parser: 'loadTextures',
                name: `user-avatar-${userID}`
            })
                .then((result) => {
                    setTexture(result)
                    console.log('User texture loaded');
                });
        }
    }, [texture]);

    return (
        <>
            {isHovered && (
                <pixiGraphics
                    x={position.x}
                    y={position.y}
                    zIndex={100}
                    draw={g => {
                        g.clear();
                        g.circle(0, 0, 10).stroke({ width: 2, color: 0xFFFFFF });
                    }}
                />
            )}
            {/* Message icon indicator */}
            {showMessageIcon && (
                <>
                    {lastMessageEmoji ? (
                        // Show emoji if message type is emoji
                        <pixiText
                            text={lastMessageEmoji}
                            x={position.x + 12}
                            y={position.y - 12}
                            anchor={0.5}
                            zIndex={105}
                            style={{
                                fontSize: 16,
                            }}
                        />
                    ) : (
                        // Show default chat bubble icon
                        <>
                            {/* Icon background circle */}
                            <pixiGraphics
                                x={position.x + 12}
                                y={position.y - 12}
                                zIndex={104}
                                draw={g => {
                                    g.clear();
                                    g.circle(0, 0, 8)
                                        .fill({ color: 0x4CAF50, alpha: 1 })
                                        .stroke({ width: 1, color: 0xFFFFFF });
                                }}
                            />
                            {/* Message icon - simple chat bubble shape */}
                            <pixiGraphics
                                x={position.x + 12}
                                y={position.y - 12}
                                zIndex={105}
                                draw={g => {
                                    g.clear();
                                    // Draw rounded rectangle for chat bubble
                                    g.roundRect(-5, -4, 10, 7, 1.5)
                                        .fill({ color: 0xFFFFFF });
                                    // Draw small triangle pointer at bottom
                                    g.moveTo(-1, 3)
                                        .lineTo(0, 5)
                                        .lineTo(1, 3)
                                        .closePath()
                                        .fill({ color: 0xFFFFFF });
                                }}
                            />
                        </>
                    )}
                </>
            )}
            <pixiSprite
                ref={avRef}
                anchor={0.5}
                eventMode={'dynamic'}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onGlobalPointerMove={onPointerMove}
                onPointerUpOutside={onPointerUpOutside}
                texture={texture}
                cursor={dragging ? 'grabbing' : 'grab'}
                x={position.x}
                y={position.y}
                zIndex={101}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
            />
        </>
    );
}
