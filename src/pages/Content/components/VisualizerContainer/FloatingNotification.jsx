import React from 'react';
import { extend } from '@pixi/react';

  import { Container, Graphics, Sprite, Text } from 'pixi.js';
  extend({
      Container,
      Graphics,
      Sprite,
      Text
  });
const FloatingNotification = ({ x, y, message, zIndex }) => {
  const style = {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 'white',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 3,
    dropShadow: true,
    dropShadowColor: '#000000',}

  return (
    <pixiSprite
      text={message}
      x={x}
      y={y - 30}
      style={style}
      zIndex={zIndex}
    />
  );
};

export default FloatingNotification;