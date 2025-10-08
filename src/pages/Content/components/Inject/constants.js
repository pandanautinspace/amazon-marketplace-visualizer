/**
 * Constants for the inject component
 */

// Container styling
export const CONTAINER_STYLES = {
    padding: '10px',
    position: 'fixed',
    top: '10px',
    right: '10px',
    overflow: 'hidden',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 10000,
};

// Background pattern styling
export const BACKGROUND_STYLES = {
    background: 'radial-gradient(circle at center, #f8f8f8 0%, #eaeaea 100%)',
    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 2px, transparent 30%), radial-gradient(circle, rgba(0,0,0,0.08) 2px, transparent 30%)',
    backgroundSize: '24px 14px',
    backgroundPosition: '0 0, 12px 7px',
    width: '100%',
    height: '100%',
    borderRadius: '5px',
    boxSizing: 'border-box',
};

// Resize handle styling
export const RESIZE_HANDLE_STYLES = {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "16px",
    height: "16px",
    background: "#888",
    cursor: "nesw-resize",
    borderRadius: "4px",
};

// Default size
export const DEFAULT_SIZE = { width: 300, height: 300 };