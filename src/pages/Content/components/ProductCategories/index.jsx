import React, { useCallback } from 'react';
import { TextStyle } from 'pixi.js';

export function Rectangle({color, x, y, width, height, productCat}) {
  const draw = useCallback(
    (g) => {
      g.clear();
      g.beginFill(color);
      g.drawRect(x, y, width, height);
      g.endFill();
      
    },
    [color, x, y, width, height, productCat],
  );

  return <>
        <pixiGraphics draw={draw} />
        <pixiText
            text={productCat || "Category"}
            x={x + width / 2}
            y={y + height / 2}
            anchor={0.5}
            style={
                new TextStyle({
                    fill: '#000000',
                    fontSize: 12,
                })
            }
        />
    </>;
}