import React, { useState } from 'react';

import { ParticleNetwork } from '../ParticlesNetwork';

export const ParticleNetworkExample: React.FC = () => {
  const [options, setOptions] = useState({
    velocity: 1,
    density: 15000,
    netLineDistance: 200,
    netLineColor: '#929292',
    particleColors: ['#6D4E5C', '#aaa', '#FFC458'],
  });

  const updateVelocity = (value: number) => {
    setOptions(prev => ({ ...prev, velocity: value }));
  };

  const updateDensity = (value: number) => {
    setOptions(prev => ({ ...prev, density: value }));
  };

  const updateLineDistance = (value: number) => {
    setOptions(prev => ({ ...prev, netLineDistance: value }));
  };

  const updateLineColor = (color: string) => {
    setOptions(prev => ({ ...prev, netLineColor: color }));
  };

  return (
    <div className='particle-example'>
      <div className='particle-controls'>
        <div className='control-group'>
          <label>Скорость:</label>
          <input
            type='range'
            min='0'
            max='2'
            step='0.1'
            value={options.velocity}
            onChange={e => updateVelocity(parseFloat(e.target.value))}
          />
          <span>{options.velocity}</span>
        </div>

        <div className='control-group'>
          <label>Плотность:</label>
          <input
            type='range'
            min='5000'
            max='30000'
            step='1000'
            value={options.density}
            onChange={e => updateDensity(parseFloat(e.target.value))}
          />
          <span>{options.density}</span>
        </div>

        <div className='control-group'>
          <label>Расстояние соединения:</label>
          <input
            type='range'
            min='50'
            max='300'
            step='10'
            value={options.netLineDistance}
            onChange={e => updateLineDistance(parseFloat(e.target.value))}
          />
          <span>{options.netLineDistance}px</span>
        </div>

        <div className='control-group'>
          <label>Цвет линий:</label>
          <input
            type='color'
            value={options.netLineColor}
            onChange={e => updateLineColor(e.target.value)}
          />
        </div>
      </div>

      <div className='particle-container'>
        <ParticleNetwork options={options} />
      </div>

      <style jsx>{`
        .particle-example {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .particle-controls {
          padding: 15px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          z-index: 10;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .control-group label {
          min-width: 120px;
        }

        .particle-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          min-height: 500px;
          background: #000;
        }
      `}</style>
    </div>
  );
};

export default ParticleNetworkExample;
