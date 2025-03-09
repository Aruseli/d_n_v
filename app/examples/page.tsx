'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export default function ExamplesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('Component mounted');
  }, []);

  if (!mounted) {
    console.log('Not mounted yet');
    return null;
  }

  console.log('Rendering component');

  return (
    <ErrorBoundary>
      <div className='min-h-screen p-8 bg-gray-50 dark:bg-gray-900'>
        <h1 className='text-3xl font-bold mb-8'>Примеры компонентов</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Link
            href='/examples/graph-network'
            className='block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'
          >
            <h2 className='text-xl font-semibold mb-2'>3D Graph Network</h2>
            <p className='text-gray-600 dark:text-gray-300'>
              Визуализация графа с 3D-эффектом, где ноды появляются постепенно от одной начальной
              точки.
            </p>
          </Link>
          <Link
            href='/examples/neural-path'
            className='block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'
          >
            <h2 className='text-xl font-semibold mb-2'>Neural Path</h2>
            <p className='text-gray-600 dark:text-gray-300'>
              Анимированная визуализация нейронной связи с градиентным путём и точками соединения.
            </p>
          </Link>
        </div>
      </div>
    </ErrorBoundary>
  );
}
