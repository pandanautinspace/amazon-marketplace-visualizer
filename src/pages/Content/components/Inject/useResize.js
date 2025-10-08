import { useState } from 'react';

/**
 * Hook to handle resizing functionality for the inject component
 */
export const useResize = (containerRef, appRef, initialSize = { width: 300, height: 300 }) => {
    const [size, setSize] = useState(initialSize);

    const startResizing = (e) => {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = containerRef.current?.offsetWidth || initialSize.width;
        const startHeight = containerRef.current?.offsetHeight || initialSize.height;

        const handleMouseMove = (e) => {
            const newWidth = startWidth - (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);

            const updatedSize = {
                width: Math.max(100, newWidth),  // Minimum width of 100px
                height: Math.max(100, newHeight), // Minimum height of 100px
            };

            setSize(updatedSize);

            // Trigger PIXI resize if app ref is available
            if (appRef.current?.getApplication) {
                appRef.current.getApplication().queueResize();
            }
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    return { size, startResizing };
};