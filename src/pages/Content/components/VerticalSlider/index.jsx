import React from 'react';

const VerticalSlider = ({ value, onChange, min = 0.5, max = 2 }) => {
  const darkBrown = '#5C4033';
  const lightBrown = '#D2B48C';
  const green = '#6B8E23';
  const white = '#FFFFFF';

  return (
      <div style={{ 
        color: darkBrown,       
        display: 'flex', 
        flexDirection: 'column',   
        alignItems: 'center',
        pointerEvents: 'auto',
        height: '250px',             
        justifyContent: 'space-between'  
      }}
      >
        <div style={{ 
        color: darkBrown, 
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '8px', 
        pointerEvents: 'none'
      }}
        >
          +
        </div>

        <input
          type="range"
          orient="vertical"
          min={min}
          max={max}
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="rotate-270 rounded appearance-none cursor-pointer"
          style={{
            width: '200px',
            height: '8px',
            transformOrigin: 'center',
            background: `linear-gradient(to right, ${lightBrown} 0%, ${green} 100%)`,
            border: `2px solid ${darkBrown}`,
            outline: 'none',
          }}
        />

        <div
          style={{ color: darkBrown,
        fontSize: '24px',
        fontWeight: 'bold',
        marginTop: '8px',         // ← Space above
        pointerEvents: 'none'}}
        >
          -
        </div>

        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${darkBrown};
            border: 3px solid ${white};
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(92, 64, 51, 0.3);
          }
          
          input[type='range']::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${darkBrown};
            border: 3px solid ${white};
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(92, 64, 51, 0.3);
          }
        `}</style>
      </div>
  );
};

export default VerticalSlider;