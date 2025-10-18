import React from 'react';

import { useDropTarget } from '../../components/DragAndDrop/dropTarget';

export function CategoryBox({ x, y, url, categoryName }) {
    const contRef = React.useRef(null);
    useDropTarget(categoryName, contRef, {
        onDrop: () => {
            window.location.href = url;
        }
    });

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
