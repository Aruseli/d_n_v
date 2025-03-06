'use client';

import React from 'react';
import Link from 'next/link';

export default function ExamplesPage() {
  const examples = [
    {
      title: '3D Graph Network',
      description:
        'Визуализация графа с 3D-эффектом, где ноды появляются постепенно от одной начальной точки.',
      path: '/examples/graph-network',
    },
    // Здесь можно добавить другие примеры
  ];

  return (
    <div className='min-h-screen p-8 bg-gray-50 dark:bg-gray-900'>
      <h1 className='text-3xl font-bold mb-8'>Примеры компонентов</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {examples.map((example, index) => (
          <Link
            href={example.path}
            key={index}
            className='block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow'
          >
            <h2 className='text-xl font-semibold mb-2'>{example.title}</h2>
            <p className='text-gray-600 dark:text-gray-300'>{example.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
