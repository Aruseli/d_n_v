import React, { useEffect, useRef } from 'react';

interface ParticleOptions {
  velocity?: number; // скорость движения частиц
  density?: number; // плотность частиц (чем ниже, тем больше частиц)
  netLineDistance?: number; // максимальное расстояние для соединения линиями
  netLineColor?: string; // цвет соединительных линий
  particleColors?: string[]; // массив цветов для частиц
}

interface ParticleNetworkProps {
  options?: ParticleOptions;
  className?: string;
  style?: React.CSSProperties;
}

// Вспомогательные функции
const getLimitedRandom = (min: number, max: number, roundToInteger: boolean = false): number => {
  let number = Math.random() * (max - min) + min;
  if (roundToInteger) {
    number = Math.round(number);
  }
  return number;
};

const returnRandomArrayItem = (array: any[]): any => {
  return array[Math.floor(Math.random() * array.length)];
};

export const ParticleNetwork: React.FC<ParticleNetworkProps> = ({ 
  options = {}, 
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<any[]>([]);
  const interactionParticleRef = useRef<any | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mouseIsDownRef = useRef<boolean>(false);
  const touchIsMovingRef = useRef<boolean>(false);
  const createIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Объединение настроек по умолчанию с пользовательскими
  const defaultOptions: ParticleOptions = {
    velocity: 1,
    density: 15000,
    netLineDistance: 200,
    netLineColor: '#929292',
    particleColors: ['#000']
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Класс частицы (преобразован в функцию)
  const createParticle = (x?: number, y?: number) => {
    const particle = {
      x: x || Math.random() * (canvasRef.current?.width || 0),
      y: y || Math.random() * (canvasRef.current?.height || 0),
      particleColor: returnRandomArrayItem(mergedOptions.particleColors || []),
      radius: getLimitedRandom(1.5, 2.5),
      opacity: 0,
      velocity: {
        x: (Math.random() - 0.5) * (mergedOptions.velocity || 0),
        y: (Math.random() - 0.5) * (mergedOptions.velocity || 0)
      },

      update: function() {
        if (this.opacity < 1) {
          this.opacity += 0.01;
        } else {
          this.opacity = 1;
        }

        // Отражение от границ
        if (this.x > (canvasRef.current?.width || 0) + 100 || this.x < -100) {
          this.velocity.x = -this.velocity.x;
        }
        if (this.y > (canvasRef.current?.height || 0) + 100 || this.y < -100) {
          this.velocity.y = -this.velocity.y;
        }

        // Обновление позиции
        this.x += this.velocity.x;
        this.y += this.velocity.y;
      },

      draw: function() {
        if (!ctxRef.current) return;
        ctxRef.current.beginPath();
        ctxRef.current.fillStyle = this.particleColor;
        ctxRef.current.globalAlpha = this.opacity;
        ctxRef.current.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctxRef.current.fill();
      }
    };

    return particle;
  };

  // Создание интерактивной частицы
  const createInteractionParticle = () => {
    const particle = createParticle();
    particle.velocity = { x: 0, y: 0 };
    interactionParticleRef.current = particle;
    particlesRef.current.push(particle);
    return particle;
  };

  // Удаление интерактивной частицы
  const removeInteractionParticle = () => {
    if (!interactionParticleRef.current) return;
    
    const index = particlesRef.current.indexOf(interactionParticleRef.current);
    if (index > -1) {
      interactionParticleRef.current = null;
      particlesRef.current.splice(index, 1);
    }
  };

  // Создание частиц
  const createParticles = (isInitial: boolean = false) => {
    particlesRef.current = [];
    const quantity = Math.floor(
      ((canvasRef.current?.width || 0) * (canvasRef.current?.height || 0)) / 
      (mergedOptions.density || 15000)
    );

    if (isInitial) {
      let counter = 0;
      if (createIntervalIdRef.current) {
        clearInterval(createIntervalIdRef.current);
      }
      
      createIntervalIdRef.current = setInterval(() => {
        if (counter < quantity - 1) {
          particlesRef.current.push(createParticle());
        } else if (createIntervalIdRef.current) {
          clearInterval(createIntervalIdRef.current);
        }
        counter++;
      }, 250);
    } else {
      for (let i = 0; i < quantity; i++) {
        particlesRef.current.push(createParticle());
      }
    }
  };

  // Функция анимации
  const update = () => {
    if (!canvasRef.current || !ctxRef.current) return;

    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctxRef.current.globalAlpha = 1;

    // Отрисовка соединений между частицами
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = particlesRef.current.length - 1; j > i; j--) {
        const p1 = particlesRef.current[i];
        const p2 = particlesRef.current[j];

        // Быстрая проверка дистанции по осям
        const distance = Math.min(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
        if (distance > (mergedOptions.netLineDistance || 200)) {
          continue;
        }

        // Точное вычисление дистанции
        const exactDistance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) +
          Math.pow(p1.y - p2.y, 2)
        );
        
        if (exactDistance > (mergedOptions.netLineDistance || 200)) {
          continue;
        }

        ctxRef.current.beginPath();
        ctxRef.current.strokeStyle = mergedOptions.netLineColor || '#929292';
        ctxRef.current.globalAlpha = 
          ((mergedOptions.netLineDistance || 200) - exactDistance) / 
          (mergedOptions.netLineDistance || 200) * p1.opacity * p2.opacity;
        ctxRef.current.lineWidth = 0.7;
        ctxRef.current.moveTo(p1.x, p1.y);
        ctxRef.current.lineTo(p2.x, p2.y);
        ctxRef.current.stroke();
      }
    }

    // Обновление и отрисовка частиц
    for (let i = 0; i < particlesRef.current.length; i++) {
      particlesRef.current[i].update();
      particlesRef.current[i].draw();
    }

    if ((mergedOptions.velocity || 0) !== 0) {
      animationFrameRef.current = requestAnimationFrame(update);
    }
  };

  // Обработчики событий мыши/касаний
  useEffect(() => {
    if (!canvasRef.current) return;

    const spawnQuantity = 3;

    const onMouseMove = (e: MouseEvent) => {
      if (!interactionParticleRef.current) {
        createInteractionParticle();
      }
      if (interactionParticleRef.current) {
        interactionParticleRef.current.x = e.offsetX;
        interactionParticleRef.current.y = e.offsetY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      touchIsMovingRef.current = true;
      if (!interactionParticleRef.current) {
        createInteractionParticle();
      }
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (interactionParticleRef.current && rect) {
        interactionParticleRef.current.x = e.changedTouches[0].clientX - rect.left;
        interactionParticleRef.current.y = e.changedTouches[0].clientY - rect.top;
      }
    };

    const onMouseDown = () => {
      mouseIsDownRef.current = true;
      let counter = 0;
      let quantity = spawnQuantity;
      const intervalId = setInterval(() => {
        if (mouseIsDownRef.current) {
          if (counter === 1) {
            quantity = 1;
          }
          for (let i = 0; i < quantity; i++) {
            if (interactionParticleRef.current) {
              particlesRef.current.push(
                createParticle(interactionParticleRef.current.x, interactionParticleRef.current.y)
              );
            }
          }
        } else {
          clearInterval(intervalId);
        }
        counter++;
      }, 50);
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      setTimeout(() => {
        if (!touchIsMovingRef.current) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            for (let i = 0; i < spawnQuantity; i++) {
              particlesRef.current.push(
                createParticle(
                  e.changedTouches[0].clientX - rect.left,
                  e.changedTouches[0].clientY - rect.top
                )
              );
            }
          }
        }
      }, 200);
    };

    const onMouseUp = () => {
      mouseIsDownRef.current = false;
    };

    const onMouseOut = () => {
      removeInteractionParticle();
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchIsMovingRef.current = false;
      removeInteractionParticle();
    };

    // Добавляем обработчики событий
    canvasRef.current.addEventListener('mousemove', onMouseMove);
    canvasRef.current.addEventListener('touchmove', onTouchMove as EventListener);
    canvasRef.current.addEventListener('mousedown', onMouseDown);
    canvasRef.current.addEventListener('touchstart', onTouchStart as EventListener);
    canvasRef.current.addEventListener('mouseup', onMouseUp);
    canvasRef.current.addEventListener('mouseout', onMouseOut);
    canvasRef.current.addEventListener('touchend', onTouchEnd as EventListener);

    // Очистка обработчиков событий
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', onMouseMove);
        canvasRef.current.removeEventListener('touchmove', onTouchMove as EventListener);
        canvasRef.current.removeEventListener('mousedown', onMouseDown);
        canvasRef.current.removeEventListener('touchstart', onTouchStart as EventListener);
        canvasRef.current.removeEventListener('mouseup', onMouseUp);
        canvasRef.current.removeEventListener('mouseout', onMouseOut);
        canvasRef.current.removeEventListener('touchend', onTouchEnd as EventListener);
      }
    };
  }, [mergedOptions.velocity, mergedOptions.netLineDistance, mergedOptions.netLineColor, mergedOptions.particleColors]);

  // Инициализация и очистка
  useEffect(() => {
    if (!containerRef.current) return;

    // Создаем canvas элемент
    const canvas = document.createElement('canvas');
    canvas.width = containerRef.current.offsetWidth;
    canvas.height = containerRef.current.offsetHeight;
    containerRef.current.appendChild(canvas);

    // Сохраняем ссылки
    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext('2d');

    // Создаем частицы с анимацией появления
    createParticles(true);

    // Запускаем анимацию
    animationFrameRef.current = requestAnimationFrame(update);

    // Обработка изменения размера окна
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.offsetWidth;
        canvasRef.current.height = containerRef.current.offsetHeight;
        
        if (ctxRef.current) {
          ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        
        createParticles();
      }
    };

    window.addEventListener('resize', handleResize);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (createIntervalIdRef.current) {
        clearInterval(createIntervalIdRef.current);
      }
      
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ width: '100%', height: '100%', ...style }} 
    />
  );
};

export default ParticleNetwork; 