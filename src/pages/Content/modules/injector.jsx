import React from 'react';
import { createRoot } from 'react-dom/client';
import Inject from '../components/Inject';

const injectComponent = (document, component) => {
    const container = document.createElement('div');
    container.id = 'react-root';
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<Inject />);
}

export default injectComponent;