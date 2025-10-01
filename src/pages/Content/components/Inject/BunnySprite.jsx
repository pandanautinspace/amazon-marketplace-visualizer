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
import { useTick } from '@pixi/react';

export function BunnySprite({ x, y, hoverText, userID }) {
    // The Pixi.js `Sprite`
    const spriteRef = useRef(null)

    const [texture, setTexture] = useState(Texture.EMPTY)
    const [isHovered, setIsHover] = useState(false)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        console.log("Bunny sprite hovered state:", isHovered);
    }, [isHovered]);

    // Preload the sprite if it hasn't been loaded yet

    useEffect(() => {
        if (texture === Texture.EMPTY) {
            const imageURL = `https://api.dicebear.com/9.x/adventurer/png?seed=${userID}`;
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
                ref={spriteRef}
                anchor={0.5}
                eventMode={'static'}
                onClick={(event) => setIsActive(!isActive)}
                onPointerOver={(event) => setIsHover(true)}
                onPointerOut={(event) => setIsHover(false)}
                scale={isActive ? 1 : 1.5}
                texture={texture}
                x={x}
                y={y}
                width={64}
                height={64}
            />
            {isHovered && hoverText && (
                <pixiContainer
                >
                    <pixiText
                        text={JSON.stringify(hoverText, null, 2)}
                        x={x}
                        y={y - 30}
                        style={{
                            fontSize: 12,
                            fill: '#ffffff',
                            stroke: '#000000',
                            strokeThickness: 4,
                        }} />
                </pixiContainer>
            )}
        </>
    );
}
