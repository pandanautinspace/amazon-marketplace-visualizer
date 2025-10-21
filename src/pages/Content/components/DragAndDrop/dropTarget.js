import { useEffect } from "react";
import { useDragAndDrop } from "./DnDContext";

export const useDropTarget = (id, ref, { onDrop }) => {
    const { registerDropTarget, unregisterDropTarget } = useDragAndDrop();

    useEffect(() => {
        if (ref.current) {
            registerDropTarget(id, {
                getBounds: () => ref.current.getBounds(),
                onDrop: onDrop,
            });
            return () => {
                unregisterDropTarget(id);
            }
        }
    }, [id, ref, onDrop]);
};
