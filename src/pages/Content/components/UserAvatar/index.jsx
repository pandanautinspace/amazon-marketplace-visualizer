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

export function UserAvatar({ x, y, hoverText, userID }) {
    // The Pixi.js `Sprite`
    const spriteRef = useRef(null)
    const app = useApplication().app;

    const [texture, setTexture] = useState(Texture.EMPTY)
    const [isHovered, setIsHover] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [storedUserID, setStoredUserID] = useState(null);

    // Load our userID once
    useEffect(() => {
        chrome.storage.local.get("userID").then((result) => {
            if (result.userID) {
                setStoredUserID(result.userID);
            }
        });
    }, []);

    useEffect(() => {
        if (userID === storedUserID) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [userID, storedUserID]);

    const clickCallBack = useCallback(() => {
        console.log("Bunny clicked:", hoverText);
        switch (hoverText.pageType) {
            case "browse":
                window.location = `https://www.amazon.fr/b?node=${hoverText.navData.node}`;
                break;
            case "product":
                window.location = `https://www.amazon.fr/dp/${hoverText.navData.productId}`;
                break;
            case "storefront":
                const storePath = hoverText.navData.storeNavPath;
                if (storePath.length == 3) {
                    window.location = `https://www.amazon.fr/${storePath[0]}/${storePath[1]}/${storePath[2]}`;
                } else if (storePath.length == 4) {
                    window.location = `https://www.amazon.fr/${storePath[0]}/${storePath[1]}/${storePath[2]}/${storePath[3]}`;
                }
                break;
            case "search":
                window.location = `https://www.amazon.fr/s?k=${hoverText.navData.k}&i=${hoverText.navData.i}`;
                break;
            case "other":
                window.location = `https://www.amazon.fr/`;
                break;
            default:
                console.log("Fail");
        }
    }, [hoverText]);

    const tickerCallback = useCallback((ticker) => {
        if (spriteRef.current) {
            spriteRef.current.rotation = Math.sin(ticker.lastTime / 200) * 0.1;
        }
    }, []);

    useTick(tickerCallback);

    // Preload the sprite if it hasn't been loaded yet

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

    useEffect(() => {
        if (app.stage) {
            if (app.stage.eventMode != 'static') {
                app.stage.eventMode = 'static';
                app.stage.hitArea = app.screen;
                console.log("Stage event mode set to static");
            }
        }
        return () => {
        };
    }, [app]);

    const onDragStart = useCallback((event) => {
        event.currentTarget.alpha = 0.5;
        event.currentTarget.cursor = 'grabbing';
        event.currentTarget.dragging = true;
        event.currentTarget.data = event.data;
        console.log("Drag start");
        console.log(app.stage);
        if (app.stage) {
            app.stage.on('pointermove', onDragMove);
            app.stage.on('pointerupoutside', onDragEnd);
            app.stage.on('pointerup', onDragEnd);
            console.log(onDragEnd);
            console.log(onDragMove);
            console.log("Stage events bound");
        }
    }, [app, spriteRef]);
    const onDragEnd = useCallback((event) => {
        spriteRef.current.alpha = 1;
        spriteRef.current.cursor = 'grab';
        spriteRef.current.dragging = false;
        spriteRef.current.data = null;
        if (app.stage) {
            app.stage.off('pointermove', onDragMove);
            app.stage.off('pointerupoutside', onDragEnd);
            app.stage.off('pointerup', onDragEnd);
        }
    }, [app, spriteRef]);
    const onDragMove = useCallback((event) => {
        console.log("Drag move");
        if (spriteRef.current.dragging) {
            const newPosition = spriteRef.current.data.getLocalPosition(spriteRef.current.parent);
            spriteRef.current.x = newPosition.x;
            spriteRef.current.y = newPosition.y;
            
        }
    }, [app, spriteRef]);

    return (
        <>
            <pixiSprite
                ref={spriteRef}
                anchor={0.5}
                eventMode={'static'}
                onClick={!isActive ? clickCallBack : undefined}
                onPointerDown={isActive ? onDragStart : undefined}
                onPointerOver={(event) => setIsHover(true)}
                onPointerOut={(event) => setIsHover(false)}
                scale={isActive ? 1.5 : 1}
                texture={texture}
                cursor={isActive ? 'grab' : 'pointer'}
                x={x}
                y={y}
                zIndex={100}
            />
        </>
    );
}
