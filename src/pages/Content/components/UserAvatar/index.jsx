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

export function UserAvatar({ x, y, hoverText, userID }) {
    const avRef = useRef(null)
    const app = useApplication().app;

    const [texture, setTexture] = useState(Texture.EMPTY);
    const [isHovered, setIsHover] = useState(false);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [storedUserID, setStoredUserID] = useState(null);

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
            <pixiSprite
                ref={avRef}
                anchor={0.5}
                eventMode={'static'}
                onClick={clickCallBack}
                texture={texture}
                cursor={'pointer'}
                x={x}
                y={y}
                zIndex={100}
            />
        </>
    );
}

export function CurrentUserAvatar({ x, y, hoverText, userID }) {
    const avRef = useRef(null)
    const app = useApplication().app;

    const [texture, setTexture] = useState(Texture.EMPTY);

    const { position, dragging, dropTarget, eventHandlers } = useDraggable(avRef, { x, y });
    const onPointerDown = eventHandlers.pointerdown;
    const onPointerUp = eventHandlers.pointerup;
    const onPointerMove = eventHandlers.pointermove;
    const onPointerUpOutside = eventHandlers.pointerupoutside;

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
            <pixiSprite
                ref={avRef}
                anchor={0.5}
                eventMode={'static'}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerMove={onPointerMove}
                onPointerUpOutside={onPointerUpOutside}
                texture={texture}
                cursor={dragging ? 'grabbing' : 'grab'}
                x={position.x}
                y={position.y}
                zIndex={101}
            />
        </>
    );
}
