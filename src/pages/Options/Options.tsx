import React from 'react';
import './Options.css';
import 'pixi.js/unsafe-eval';
import { Application } from '@pixi/react';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  return (
    <div className="OptionsContainer">
      <Application autoStart sharedTicker />
      {title} Page
    </div>
  );
};

export default Options;
