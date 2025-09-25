import {
    Assets,
    Texture,
} from 'pixi.js';
import React from 'react';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import { useTick } from '@pixi/react';

export function BunnySprite({ x, y, hoverText }) {
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
            Assets
                .load('https://pixijs.com/assets/bunny.png')
                .then((result) => {
                    setTexture(result)
                    console.log('Bunny texture loaded');
                });
        }
    }, [texture]);

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
                y={y} />
            {isHovered && hoverText && (
                <pixiContainer
                >
                    <pixiText
                        text={hoverText}
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
