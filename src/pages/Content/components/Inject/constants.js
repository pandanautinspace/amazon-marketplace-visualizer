/**
 * Constants for the inject component
 */

// Color palette
export const COLORS = {
    darkBrown: '#5C4033',
    lightBrown: '#D2B48C',
    green: '#6B8E23',
    lightGreen: '#9ACD32',
    white: '#FFFFFF',
    offWhite: '#F5F5DC', // Beige
};

// Container styling
export const CONTAINER_STYLES = {
    padding: '10px',
    position: 'fixed',
    top: '10px',
    right: '10px',
    overflow: 'hidden',
    backgroundColor: COLORS.offWhite,
    border: `2px solid ${COLORS.darkBrown}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(92, 64, 51, 0.3)',
    zIndex: 10000,
};

// Background pattern styling
export const BACKGROUND_STYLES = {
    background: `linear-gradient(135deg, ${COLORS.offWhite} 0%, ${COLORS.lightBrown} 100%)`,
    backgroundImage: `radial-gradient(circle, rgba(92, 64, 51, 0.05) 2px, transparent 30%), radial-gradient(circle, rgba(92, 64, 51, 0.05) 2px, transparent 30%)`,
    backgroundSize: '24px 14px',
    backgroundPosition: '0 0, 12px 7px',
    borderRadius: '5px',
    boxSizing: 'border-box',
};

// Resize handle styling
export const RESIZE_HANDLE_STYLES = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '20px',
    height: '20px',
    background: `linear-gradient(135deg, ${COLORS.darkBrown} 0%, ${COLORS.lightBrown} 100%)`,
    cursor: 'nesw-resize',
    borderRadius: '0 4px 0 0',
    border: `1px solid ${COLORS.darkBrown}`,
    borderLeft: 'none',
    borderBottom: 'none',
    boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)',
    // Add grip lines going from bottom-left to top-right
    backgroundImage: `
        linear-gradient(45deg, transparent 40%, ${COLORS.white} 40%, ${COLORS.white} 45%, transparent 45%),
        linear-gradient(45deg, transparent 55%, ${COLORS.white} 55%, ${COLORS.white} 60%, transparent 60%),
        linear-gradient(45deg, transparent 70%, ${COLORS.white} 70%, ${COLORS.white} 75%, transparent 75%)
    `,
};

// Default size
export const DEFAULT_SIZE = { width: 500, height: 500 };

// Minimum size
export const MIN_SIZE = { width: 400, height: 400 };
