import React, { useEffect, useRef } from 'react';

interface ParticleOptions {
  particleColor?: string;
  background?: string;
  interactive?: boolean;
  speed?: 'slow' | 'medium' | 'fast' | 'none';
  density?: 'low' | 'medium' | 'high' | number;
  velocity?: number;
}

interface ParticleBackgroundProps {
  options?: ParticleOptions;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ options = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Проверяем поддержку canvas
    const canvas = document.createElement('canvas');
    if (!canvas.getContext) {
      console.error('Canvas is not supported in this browser');
      return;
    }

    const defaultOptions: ParticleOptions = {
      particleColor: '#fff',
      interactive: true,
      speed: 'slow',
      density: 'high',
      velocity: 0.2
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Преобразуем speed в velocity
    if (mergedOptions.speed === 'slow') mergedOptions.velocity = 0.5;
    if (mergedOptions.speed === 'fast') mergedOptions.velocity = 2;
    if (mergedOptions.speed === 'none') mergedOptions.velocity = 0;

    const ParticleNetwork: any = (function() {
      function Particle(this: any, parent: any) {
        this.canvas = parent.canvas;
        this.g = parent.g;
        this.particleColor = parent.options.particleColor;
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        // Уменьшаем начальную скорость частиц
        this.velocity = {
          x: (Math.random() - 0.5) * parent.options.velocity * 0.5,
          y: (Math.random() - 0.5) * parent.options.velocity * 0.5
        };
      }

      Particle.prototype.update = function() {
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        
        // Логируем скорость, если она превышает порог
        if (speed > 2) {
          console.log('High speed detected:', {
            speed,
            x: this.x,
            y: this.y,
            velocityX: this.velocity.x,
            velocityY: this.velocity.y
          });
        }

        // Ограничиваем максимальную скорость
        const maxSpeed = 2;
        if (speed > maxSpeed) {
          const scale = maxSpeed / speed;
          this.velocity.x *= scale;
          this.velocity.y *= scale;
        }

        // Обновление позиции частицы
        // Отражение от границ с потерей энергии
        const dampening = 0.95; // Коэффициент затухания
        if (this.x > this.canvas.width + 20 || this.x < -20) {
          this.velocity.x = -this.velocity.x * dampening;
        }
        if (this.y > this.canvas.height + 20 || this.y < -20) {
          this.velocity.y = -this.velocity.y * dampening;
        }
        this.x += this.velocity.x;
        this.y += this.velocity.y;
      };

      Particle.prototype.draw = function() {
        // Отрисовка частицы
        this.g.beginPath();
        this.g.fillStyle = this.particleColor;
        this.g.globalAlpha = 0.7;
        this.g.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
        this.g.fill();
      };

      return function ParticleNetwork(this: any, parent: HTMLElement, options: ParticleOptions) {
        this.canvas = document.createElement('canvas');
        this.g = this.canvas.getContext('2d');
        this.options = options;
        this.particles = [];

        // Настройка canvas
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
        
        this.canvas.style.background = '#000';
        parent.appendChild(this.canvas);

        // Создание частиц
        const particleCount = (this.canvas.width * this.canvas.height) / 10000;
        for (let i = 0; i < particleCount; i++) {
          this.particles.push(new (Particle as any)(this));
        }

        // Интерактивность
        if (options.interactive) {
          this.mouse = {
            x: 0,
            y: 0,
            down: false,
            active: false // Добавляем флаг активности мыши
          };

          this.canvas.addEventListener('mouseenter', () => {
            this.mouse.active = true;
          });

          this.canvas.addEventListener('mouseleave', () => {
            this.mouse.active = false;
            this.mouse.down = false;
          });

          this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
          });

          this.canvas.addEventListener('mousedown', () => {
            this.mouse.down = true;
          });

          this.canvas.addEventListener('mouseup', () => {
            this.mouse.down = false;
          });
        }

        // Запуск анимации
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        // Обработка resize
        const handleResize = () => {
          this.canvas.width = parent.offsetWidth;
          this.canvas.height = parent.offsetHeight;
        };
        window.addEventListener('resize', handleResize);
      };
    })();

    ParticleNetwork.prototype.animate = function() {
      // Очистка canvas
      this.g.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Отображаем отладочную информацию
      this.g.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.g.font = '12px monospace';
      
      // Считаем среднюю скорость
      let totalSpeed = 0;
      let maxSpeed = 0;
      for (let i = 0; i < this.particles.length; i++) {
        const speed = Math.sqrt(
          this.particles[i].velocity.x * this.particles[i].velocity.x +
          this.particles[i].velocity.y * this.particles[i].velocity.y
        );
        totalSpeed += speed;
        maxSpeed = Math.max(maxSpeed, speed);
      }
      const avgSpeed = totalSpeed / this.particles.length;

      // Выводим статистику
      this.g.fillText(`Avg Speed: ${avgSpeed.toFixed(3)}`, 10, 20);
      this.g.fillText(`Max Speed: ${maxSpeed.toFixed(3)}`, 10, 40);
      if (this.mouse && this.mouse.active) {
        this.g.fillText(`Mouse: ${Math.round(this.mouse.x)},${Math.round(this.mouse.y)}`, 10, 60);
      }

      // Обновление и отрисовка частиц
      // Добавляем задержку перед взаимодействием с мышью
      const now = Date.now();
      if (!this.startTime) {
        this.startTime = now;
      }
      
      if (this.options.interactive && this.mouse && this.mouse.active && now - this.startTime > 1000) {
        // Добавляем взаимодействие с мышью
        for (let i = 0; i < this.particles.length; i++) {
          const dx = this.mouse.x - this.particles[i].x;
          const dy = this.mouse.y - this.particles[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const force = (120 - distance) / 120 * 0.5;
            // Изменяем скорость вместо позиции
            const influence = force * 0.01;
            if (this.mouse.down) {
              this.particles[i].velocity.x -= dx * influence;
              this.particles[i].velocity.y -= dy * influence;
            } else {
              this.particles[i].velocity.x += dx * influence;
              this.particles[i].velocity.y += dy * influence;
            }
          }
        }
      }

      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
        this.particles[i].draw();

        // Отрисовка линий между частицами
        for (let j = this.particles.length - 1; j > i; j--) {
          const distance = Math.sqrt(
            Math.pow(this.particles[i].x - this.particles[j].x, 2) +
            Math.pow(this.particles[i].y - this.particles[j].y, 2)
          );
          if (distance > 120) continue;

          this.g.beginPath();
          this.g.strokeStyle = this.options.particleColor;
          this.g.globalAlpha = (120 - distance) / 120;
          this.g.lineWidth = 0.7;
          this.g.moveTo(this.particles[i].x, this.particles[i].y);
          this.g.lineTo(this.particles[j].x, this.particles[j].y);
          this.g.stroke();
        }
      }

      requestAnimationFrame(this.animate);
    };

    const particleCanvas = new ParticleNetwork(containerRef.current, mergedOptions);

    let animationFrameId: number;
    
    const animate = () => {
      particleCanvas.animate();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      // Останавливаем анимацию
      cancelAnimationFrame(animationFrameId);
      
      // Удаляем canvas
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [options]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};