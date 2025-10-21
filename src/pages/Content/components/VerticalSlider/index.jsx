import React from 'react';

const VerticalSlider = ({ value, onChange, min = 0.5, max = 2 }) => {
  return (
    <div className="h-1/2 flex items-center mx-4">
      <div className="relative h-full flex items-center">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg">+</div>
        
        <input
          type="range"
          min={min}
          max={max}
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="rotate-270 h-1 bg-gray-300 rounded appearance-none cursor-pointer"
          style={{
            width: '200px',
            transformOrigin: 'center',
          }}
        />
        
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-lg">-</div>
      </div>
    </div>
  );
};

export default VerticalSlider;