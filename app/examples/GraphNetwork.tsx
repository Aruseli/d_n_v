'use client';

import React, { useState } from 'react';

import { GraphNetwork } from '../components/GraphNetwork';

export function GraphNetworkExample() {
  const [options, setOptions] = useState({
    maxNodes: 50,
    nodeGrowthRate: 1,
    // nodeColors: ['#6D4E5C', '#aaa', '#FFC458', '#43AD28', '#3B82F6'],
    // edgeWidthRange: [0.5, 2],
    nodeMovementSpeed: 0.5,
    repulsionForce: 0.7,
    repulsionRadius: 200,
    attractionForce: 0.05,
    optimalDistance: 100,
    centeringForce: 0.01,
    collisionDamping: 0.7,
    collisionElasticity: 1.2,
    velocityDamping: 0.98,
    randomImpulseIntensity: 0.3,
    randomImpulseProbability: 0.05,
    boundaryRepulsionForce: 0.8,
    minDistanceBetweenNodes: 30,
    wanderingFactor: 0.2,
  });

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setOptions(prev => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    } else {
      setOptions(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='p-4 bg-gray-100 dark:bg-gray-800'>
        <h1 className='text-2xl font-bold mb-4'>3D Graph Network</h1>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium'>
              Максимальное количество нод
              <input
                type='number'
                name='maxNodes'
                value={options.maxNodes}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='10'
                max='200'
              />
            </label>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Скорость появления нод (в секунду)
              <input
                type='number'
                name='nodeGrowthRate'
                value={options.nodeGrowthRate}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0.1'
                max='5'
                step='0.1'
              />
            </label>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Скорость движения нод
              <input
                type='number'
                name='nodeMovementSpeed'
                value={options.nodeMovementSpeed}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0'
                max='2'
                step='0.1'
              />
            </label>
          </div>

          {/* Новые элементы управления для отталкивания и притяжения */}
          <div>
            <label className='block text-sm font-medium'>
              Сила отталкивания
              <input
                type='number'
                name='repulsionForce'
                value={options.repulsionForce}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0'
                max='2'
                step='0.1'
              />
            </label>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Радиус отталкивания
              <input
                type='number'
                name='repulsionRadius'
                value={options.repulsionRadius}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='50'
                max='500'
                step='10'
              />
            </label>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Сила притяжения
              <input
                type='number'
                name='attractionForce'
                value={options.attractionForce}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0'
                max='0.5'
                step='0.01'
              />
            </label>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Оптимальное расстояние
              <input
                type='number'
                name='optimalDistance'
                value={options.optimalDistance}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='50'
                max='300'
                step='10'
              />
            </label>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Сила центрирования
              <input
                type='number'
                name='centeringForce'
                value={options.centeringForce}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0'
                max='0.1'
                step='0.001'
              />
            </label>
          </div>

          {/* Новые элементы управления для столкновений */}
          <div>
            <label className='block text-sm font-medium'>
              Затухание при столкновении
              <input
                type='number'
                name='collisionDamping'
                value={options.collisionDamping}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0.1'
                max='1'
                step='0.05'
              />
            </label>
            <p className='text-xs text-gray-500 mt-1'>Меньше = более медленное отлетание</p>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Упругость столкновений
              <input
                type='number'
                name='collisionElasticity'
                value={options.collisionElasticity}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0.5'
                max='2'
                step='0.1'
              />
            </label>
            <p className='text-xs text-gray-500 mt-1'>Больше = более сильный отскок</p>
          </div>

          {/* Новые элементы управления для инерции и случайных импульсов */}
          <div>
            <label className='block text-sm font-medium'>
              Затухание скорости
              <input
                type='number'
                name='velocityDamping'
                value={options.velocityDamping}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0.9'
                max='0.999'
                step='0.001'
              />
            </label>
            <p className='text-xs text-gray-500 mt-1'>Ближе к 1 = дольше сохраняется движение</p>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Интенсивность случайных импульсов
              <input
                type='number'
                name='randomImpulseIntensity'
                value={options.randomImpulseIntensity}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0'
                max='1'
                step='0.05'
              />
            </label>
            <p className='text-xs text-gray-500 mt-1'>Больше = более сильные случайные движения</p>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Вероятность случайных импульсов
              <input
                type='number'
                name='randomImpulseProbability'
                value={options.randomImpulseProbability}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0'
                max='0.2'
                step='0.01'
              />
            </label>
            <p className='text-xs text-gray-500 mt-1'>Больше = чаще возникают случайные движения</p>
          </div>

          {/* Элемент управления для отталкивания от границ */}
          <div>
            <label className='block text-sm font-medium'>
              Сила отталкивания от границ
              <input
                type='number'
                name='boundaryRepulsionForce'
                value={options.boundaryRepulsionForce}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0'
                max='2'
                step='0.1'
              />
            </label>
            <p className='text-xs text-gray-500 mt-1'>Больше = сильнее отталкивание к центру</p>
          </div>

          {/* Новые элементы управления для минимального расстояния и блуждания */}
          <div>
            <label className='block text-sm font-medium'>
              Минимальное расстояние между нодами
              <input
                type='number'
                name='minDistanceBetweenNodes'
                value={options.minDistanceBetweenNodes}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='10'
                max='100'
                step='5'
              />
            </label>
            <p className='text-xs text-gray-500 mt-1'>
              Больше = ноды держатся дальше друг от друга
            </p>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              Фактор блуждания
              <input
                type='number'
                name='wanderingFactor'
                value={options.wanderingFactor}
                onChange={handleOptionChange}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                min='0'
                max='1'
                step='0.05'
              />
            </label>
            <p className='text-xs text-gray-500 mt-1'>
              Больше = ноды активнее исследуют пространство
            </p>
          </div>
        </div>
      </div>

      <div className='flex-grow bg-gray-50 dark:bg-gray-900 relative'>
        <GraphNetwork options={options} className='w-full h-full' />
      </div>
    </div>
  );
}
