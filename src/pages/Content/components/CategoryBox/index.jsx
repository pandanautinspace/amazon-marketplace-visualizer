import React from 'react';

import { useDropTarget } from '../../components/DragAndDrop/dropTarget';
import { Rectangle, Assets } from 'pixi.js';

const getColorFromCategory = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const saturation = 50; // Constant 50%
    const value = 100; // Constant 72%
    const hue = (Math.abs(hash) % 360);

    // Convert HSV to RGB
    const c = (value / 100) * (saturation / 100);
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = (value / 100) - c;

    let r, g, b;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return ((Math.round((r + m) * 255) << 16) | (Math.round((g + m) * 255) << 8) | Math.round((b + m) * 255));
};


export function CategoryBox({ x, y, url, categoryName, tilemap, userCount = 0 }) {
    const contRef = React.useRef(null);
    useDropTarget(categoryName, contRef, {
        onDrop: () => {
            window.location.href = url;
        }
    });
    const [hovered, setHovered] = React.useState(false);
    const color = getColorFromCategory(categoryName);
    const hexColor = `#${color.toString(16).padStart(6, '0')}`;
    console.log('Category color for', categoryName, 'is', color, "in hex is", hexColor);
    if (tilemap) {
        for (let i = 0; i <= 5; i++) {
            for (let j = 0; j < 2; j++) {
                tilemap.tile('road-12', x * 8 + i * 64, y * 8 + j * 64 + 512 - 128);
            }
        }
        for (let i = 0; i <= 5; i++) {
            for (let j = 0; j < 1; j++) {
                tilemap.tile('road-15', x * 8 + i * 64, y * 8 + j * 64 + 512);
            }
        }
        for (let i = 0; i <= 5; i++) {
            for (let j = 0; j < 1; j++) {
                tilemap.tile('road-9', x * 8 + i * 64, y * 8 + j * 64 + 512 - 64 * 3);
            }
        }
        tilemap.tile('building-1-0', x * 8, y * 8);
        tilemap.tile('decor-17', x * 8 + 32, y * 8 + 32);
    }
    return (
        <pixiContainer
            onClick={() => {
                window.location = url;
            }}
            cursor='pointer'
            eventMode='static'
            ref={contRef}
            hitArea={new Rectangle(x, y, 48, 48)}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <pixiContainer>
                <pixiText
                    text={hovered ? `${userCount} user${userCount !== 1 ? 's' : ''}` : categoryName}
                    x={x + 10}
                    y={y + 10}
                    anchor={0}
                    zIndex={100}
                    style={{
                        fontSize: 4,
                        fill: 0x000000,
                        fontWeight: 'bold',
                        wordWrap: true,
                        wordWrapWidth: 30,
                        align: 'center',
                    }}
                    resolution={16}
                />
            </pixiContainer>
            {hovered && (
                <pixiSprite
                    x={x}
                    y={y}
                    anchor={0}
                    texture={Assets.get('building-1-0')}
                    tint={hexColor}
                    alpha={0.4}
                    zIndex={-51}
                    width={48}
                    height={48}
                />
            )}
        </pixiContainer>
    );
}
