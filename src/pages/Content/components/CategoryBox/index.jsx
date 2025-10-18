import React from 'react';

import { useDropTarget } from '../../components/DragAndDrop/dropTarget';
import { Rectangle } from 'pixi.js';

const getColorFromCategory = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const saturation = 50; // Constant 50%
    const value = 72; // Constant 72%
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


export function CategoryBox({ x, y, url, categoryName }) {
    const contRef = React.useRef(null);
    useDropTarget(categoryName, contRef, {
        onDrop: () => {
            window.location.href = url;
        }
    });
    const color = getColorFromCategory(categoryName);

    return (
        <pixiContainer
            onClick={() => {
                window.location = url;
            }}
            cursor='pointer'
            eventMode='static'
            ref={contRef}
        >
            <pixiGraphics
                draw={(g) => {
                    g.clear();
                    g.rect(x - 25, y - 25, 50, 50).fill(color);
                }}
            />
            <pixiText
                text={categoryName}
                x={x}
                y={y}
                anchor={0.5}
                zIndex={100}
                style={{
                    fontSize: 12,
                    fill: 0xFFFFFF,
                }}
            />
        </pixiContainer>
    );
}
