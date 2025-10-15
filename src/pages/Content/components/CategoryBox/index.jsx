import React from 'react';
export function CategoryBox({ x, y, url, categoryName }) {
    return (
        <pixiContainer
            onClick={() => {
                window.location = url;
            }}
            cursor='pointer'
            eventMode='static'
        >
            <pixiGraphics
                draw={(g) => {
                    g.clear();
                    g.rect(x - 25, y - 25, 50, 50).fill(0xFF0000);
                }}
                eventMode='static'
            />
            <pixiText
                text={categoryName}
                x={x - 20}
                y={y - 6}
                zIndex={100}
                style={{
                    fontSize: 12,
                    fill: 0xFFFFFF,
                }}
            />
        </pixiContainer>
    );
}
