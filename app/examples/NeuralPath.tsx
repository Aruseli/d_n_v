'use client';

import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

export function NeuralPathExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    opacity: number
  ) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(128, 128, 128, ${opacity})`;
    ctx.fill();
  };

  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Initial circle
    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.5;
    drawCircle(ctx, centerX, centerY, 9, 1);

    // End point
    const endX = centerX + 200;
    const endY = centerY;

    // Draw path
    const progress = progressRef.current;
    if (progress > 0) {
      // Create gradient
      const gradient = ctx.createLinearGradient(centerX, centerY, endX, endY);
      gradient.addColorStop(0, 'rgba(128, 128, 128, 0.8)');
      gradient.addColorStop(1, 'rgba(128, 128, 128, 0.4)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;

      // Fixed control points
      const cp1x = centerX + 100;
      const cp1y = centerY - 50;
      const cp2x = centerX + 150;
      const cp2y = centerY + 50;

      // Draw the curve segment by segment
      const steps = 100;
      const currentStep = Math.floor(progress * steps);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);

      for (let i = 0; i <= currentStep; i++) {
        const t = i / steps;
        const x =
          Math.pow(1 - t, 3) * centerX +
          3 * Math.pow(1 - t, 2) * t * cp1x +
          3 * (1 - t) * Math.pow(t, 2) * cp2x +
          Math.pow(t, 3) * endX;
        const y =
          Math.pow(1 - t, 3) * centerY +
          3 * Math.pow(1 - t, 2) * t * cp1y +
          3 * (1 - t) * Math.pow(t, 2) * cp2y +
          Math.pow(t, 3) * endY;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Плавное появление конечной окружности
      if (progress >= 0.95) {
        const endCircleOpacity = ((progress - 0.95) / 0.05) * 0.7; // 0.88 - максимальная прозрачность
        drawCircle(ctx, endX, endY, 7, endCircleOpacity);
      }
    }

    // Update progress
    if (progress < 1) {
      progressRef.current += 0.003;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size without DPR scaling
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='p-4 bg-gray-100 dark:bg-gray-800'>
        <h1 className='text-2xl font-bold mb-4'>Neural Path Animation</h1>
      </div>
      <div className='flex-grow bg-gray-50 dark:bg-gray-900 relative flex items-center justify-center'>
        <canvas
          ref={canvasRef}
          className='w-full h-full absolute inset-0'
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}
