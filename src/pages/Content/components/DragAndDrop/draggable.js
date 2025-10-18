import { useState, useRef } from "react";
import { useDragAndDrop } from "./DnDContext";

export const useDraggable = (ref, initialPos = { x: 0, y: 0 }) => {
    const { handleDrop, findTarget } = useDragAndDrop();
    const [position, setPosition] = useState(initialPos);
    const [dragging, setDragging] = useState(false);
    const [dropTarget, setDropTarget] = useState(null);
    const offset = useRef({ x: 0, y: 0 });

    const onDragStart = (event) => {
        event.stopPropagation();
        const pos = event.data.getLocalPosition(ref.current.parent);
        offset.current = {
            x: pos.x - position.x,
            y: pos.y - position.y,
        };
        setDragging(true);
    };

    const onDragMove = (event) => {
        if (!dragging) return;
        const pos = event.data.getLocalPosition(ref.current.parent);
        const newPos = {
            x: pos.x - offset.current.x,
            y: pos.y - offset.current.y,
        };
        setPosition(newPos);

        if (ref.current) {
            const bounds = ref.current.getBounds();
            const targetId = findTarget(bounds);
            setDropTarget(targetId);
        }
    };

    const onDragEnd = (event) => {
        if (!dragging) return;
        setDragging(false);
        if (ref.current) {
            const bounds = ref.current.getBounds();
            const targetId = handleDrop(bounds);
            setDropTarget(targetId);
        }
    };

    return {
        position,
        dragging,
        dropTarget,
        eventHandlers: {
            pointerdown: onDragStart,
            pointermove: onDragMove,
            pointerup: onDragEnd,
            pointerupoutside: onDragEnd,
        }
    };
};
