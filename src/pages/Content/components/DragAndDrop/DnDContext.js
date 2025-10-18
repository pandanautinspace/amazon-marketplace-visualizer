import React from 'react';
import { useApplication } from "@pixi/react";
import { createContext, useContext, useRef, useEffect } from "react";

export const DragAndDropContext = createContext(null);

export const DragAndDropProvider = ({ children }) => {
    const dropTargets = useRef(new Map());
    const app = useApplication().app;

    useEffect(() => {
        if (app.stage) {
            if (app.stage.eventMode != 'static') {
                app.stage.eventMode = 'static';
                app.stage.hitArea = app.screen;
            }
        }
    }, [app]);

    const registerDropTarget = (id, data) => {
        dropTargets.current.set(id, data);
    }

    const unregisterDropTarget = (id) => {
        dropTargets.current.delete(id);
    }

    const findTarget = (draggableBounds) => {
        for (let [id, target] of dropTargets.current) {
            const targetBounds = target.getBounds();
            if (targetBounds.rectangle.intersects(draggableBounds)) {
                return id;
            }
        }
        return null;
    }

    const handleDrop = (draggableBounds) => {
        const targetId = findTarget(draggableBounds);
        if (targetId) {
            const target = dropTargets.current.get(targetId);
            target?.onDrop();
        }
        return targetId;
    }

    return (
        <DragAndDropContext.Provider value={{ registerDropTarget, unregisterDropTarget, findTarget, handleDrop }}>
            {children}
        </DragAndDropContext.Provider>
    );
};

export const useDragAndDrop = () => {
    const context = useContext(DragAndDropContext);
    if (!context) {
        throw new Error('useDragAndDrop must be used within a DragAndDropProvider');
    }
    return context;
};