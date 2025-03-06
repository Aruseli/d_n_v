'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  depth: number; // 0-1, где 1 - ближе к пользователю
  vx: number;
  vy: number;
  color: string;
  connections: Set<number>; // ID нод, с которыми есть связь (используем Set вместо массива)
  isVisible: boolean;
  opacity: number; // Прозрачность ноды (для анимации появления)
  createdAt: number; // Время создания ноды (для анимации)
  animationPhase: 'appearing' | 'glowing' | 'stable'; // Фаза анимации ноды
}

interface Edge {
  from: number;
  to: number;
  opacity: number;
  width: number;
  createdAt: number; // Время создания ребра (для анимации)
}

interface GraphOptions {
  maxNodes?: number; // Максимальное количество нод
  nodeGrowthRate?: number; // Скорость появления новых нод (нод в секунду)
  nodeColor?: string; // Цвет нод (один цвет для всех нод)
  nodeColors?: string[]; // Устаревшее: массив цветов нод (для обратной совместимости)
  edgeColor?: string; // Цвет рёбер
  edgeColors?: string[]; // Устаревшее: массив цветов рёбер (для обратной совместимости)
  nodeSizeRange?: [number, number]; // Минимальный и максимальный размер нод
  edgeWidthRange?: [number, number]; // Минимальный и максимальный размер рёбер
  nodeDepthLevels?: number; // Количество уровней глубины
  maxConnections?: number; // Максимальное количество связей у одной ноды
  backgroundColor?: string; // Цвет фона
  nodeMovementSpeed?: number; // Скорость движения нод
  initialNodePosition?: [number, number]; // Позиция первой ноды [x, y] в процентах от размера канваса
  curveIntensity?: number; // Интенсивность изгиба рёбер (0-1)
  pulsationIntensity?: number; // Интенсивность пульсации нодов (0-1)
  connectionProbability?: number; // Вероятность создания дополнительных связей (0-1)
  repulsionForce?: number; // Сила отталкивания между нодами (0-1)
  repulsionRadius?: number; // Радиус действия силы отталкивания
  attractionForce?: number; // Сила притяжения между связанными нодами (0-1)
  optimalDistance?: number; // Оптимальное расстояние между связанными нодами
  centeringForce?: number; // Сила центрирования графа (0-1)
  collisionDamping?: number; // Коэффициент затухания при столкновении (0-1)
  collisionElasticity?: number; // Коэффициент упругости при столкновении (0-1)
  velocityDamping?: number; // Коэффициент затухания скорости (0-1)
  randomImpulseIntensity?: number; // Интенсивность случайных импульсов (0-1)
  randomImpulseProbability?: number; // Вероятность случайного импульса (0-1)
  boundaryRepulsionForce?: number; // Сила отталкивания от границ (0-1)
  minDistanceBetweenNodes?: number; // Минимальное расстояние между нодами
  wanderingFactor?: number; // Фактор блуждания нодов (0-1)
}

interface GraphNetworkProps {
  options?: GraphOptions;
  className?: string;
  style?: React.CSSProperties;
}

// Утилиты
const getRandomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = (colors: string[]): string => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// Интерфейс для ноды в очереди на добавление
interface QueuedNode {
  parentNodeId: number;
  delay: number; // Задержка перед добавлением в мс
  createdAt: number; // Время добавления в очередь
}

export const GraphNetwork: React.FC<GraphNetworkProps> = ({
  options = {},
  className = '',
  style = {},
}) => {
  // Настройки по умолчанию
  const defaultOptions: GraphOptions = {
    maxNodes: 25,
    nodeGrowthRate: 1, // 1 нода в секунду
    nodeColor: '#929292', // Основной цвет нод (серый, как рёбра)
    nodeColors: ['#6D4E5C', '#aaa', '#FFC458', '#43AD28', '#3B82F6'], // Устаревшее
    edgeColor: '#929292', // Основной цвет рёбер (серый, как в ParticlesNetwork)
    edgeColors: ['#929292', '#666666'], // Устаревшее
    nodeSizeRange: [1.5, 7], // Минимальный и максимальный размер нодов
    edgeWidthRange: [0.5, 0.7],
    nodeDepthLevels: 5,
    maxConnections: 5,
    backgroundColor: 'transparent',
    nodeMovementSpeed: 0.3, // Уменьшаем скорость для более плавного движения
    initialNodePosition: [0.5, 0.5], // Центр канваса
    curveIntensity: 0, // Отключаем изгиб рёбер (прямые линии)
    pulsationIntensity: 0.15, // Интенсивность пульсации нодов
    connectionProbability: 0.2, // Уменьшаем вероятность создания дополнительных связей
    repulsionForce: 0.7, // Сила отталкивания между нодами (увеличиваем для более свободной сети)
    repulsionRadius: 200, // Радиус действия силы отталкивания (увеличиваем для более свободной сети)
    attractionForce: 0.05, // Сила притяжения между связанными нодами (слабая, чтобы не перевешивать отталкивание)
    optimalDistance: 100, // Оптимальное расстояние между связанными нодами
    centeringForce: 0.01, // Слабая сила центрирования графа
    collisionDamping: 0.7, // Коэффициент затухания при столкновении (0.7 = 30% потери энергии)
    collisionElasticity: 1.2, // Коэффициент упругости при столкновении (1.2 = небольшое увеличение скорости)
    velocityDamping: 0.98, // Коэффициент затухания скорости (0.98 = очень медленное затухание)
    randomImpulseIntensity: 0.3, // Интенсивность случайных импульсов
    randomImpulseProbability: 0.05, // Вероятность случайного импульса (5% на каждый кадр)
    boundaryRepulsionForce: 0.8, // Сила отталкивания от границ (направленная к центру)
    minDistanceBetweenNodes: 30, // Минимальное расстояние между нодами (в пикселях)
    wanderingFactor: 0.2, // Фактор блуждания нодов (случайное изменение направления)
  };

  // Объединяем настройки по умолчанию с переданными пользователем
  const mergedOptions = useRef<GraphOptions>({ ...defaultOptions, ...options });

  // Используем Map вместо массивов для хранения нодов и рёбер
  const nodesRef = useRef<Map<number, Node>>(new Map());
  const edgesRef = useRef<Map<string, Edge>>(new Map());
  const isInitializedRef = useRef<boolean>(false);
  const lastNodeTimeRef = useRef<number>(0);

  // Очередь нодов для последовательного добавления
  const nodeQueueRef = useRef<QueuedNode[]>([]);

  // Кэш для отрисованных нодов
  const nodeRenderCacheRef = useRef<Map<string, ImageData>>(new Map());

  // Рефы для DOM-элементов и анимации
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Вспомогательная функция для получения массива нодов из Map
  const getNodesArray = (): Node[] => {
    return Array.from(nodesRef.current.values());
  };

  // Вспомогательная функция для получения массива рёбер из Map
  const getEdgesArray = (): Edge[] => {
    return Array.from(edgesRef.current.values());
  };

  // Вспомогательная функция для создания ключа ребра
  const edgeKey = (edge: Edge): string => {
    // Сортируем ID нодов, чтобы ребро A->B и B->A имели одинаковый ключ
    const [min, max] = [edge.from, edge.to].sort((a, b) => a - b);
    return `${min}-${max}`;
  };

  // Функция для получения кэшированного изображения ноды
  const getNodeImage = (
    size: number,
    color: string,
    glowSize: number,
    glowOpacity: number
  ): ImageData => {
    // Создаем ключ для кэша на основе параметров
    const cacheKey = `${size.toFixed(2)}_${color}_${glowSize.toFixed(2)}_${glowOpacity.toFixed(2)}`;

    // Проверяем, есть ли изображение в кэше
    if (nodeRenderCacheRef.current.has(cacheKey)) {
      return nodeRenderCacheRef.current.get(cacheKey)!;
    }

    // Если нет, создаем новое изображение
    const canvas = document.createElement('canvas');
    // Размер канваса должен быть достаточным для ноды и свечения
    const padding = 4; // Дополнительный отступ
    const maxRadius = Math.max(size, glowSize);
    const canvasSize = Math.ceil(maxRadius * 2) + padding * 2;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d')!;

    // Очищаем канвас с прозрачным фоном
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Центр канваса
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;

    // Рисуем свечение
    if (glowSize > size && glowOpacity > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${glowOpacity})`;
      ctx.fill();
    }

    // Рисуем основную ноду
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Получаем ImageData и сохраняем в кэш
    const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    nodeRenderCacheRef.current.set(cacheKey, imageData);

    return imageData;
  };

  // Функция для обновления рёбер
  const updateEdges = () => {
    if (getNodesArray().length < 2) return;

    const now = Date.now();
    const existingEdges = getEdgesArray(); // Сохраняем существующие рёбра
    const newEdgesMap = new Map<string, Edge>();

    // Создаем рёбра на основе связей нод
    getNodesArray().forEach(node => {
      node.connections.forEach(connectedNodeId => {
        // Создаем ключ для ребра
        const [min, max] = [node.id, connectedNodeId].sort((a, b) => a - b);
        const key = `${min}-${max}`;

        // Проверяем, существует ли уже такое ребро
        if (edgesRef.current.has(key)) {
          // Если ребро уже существует, сохраняем его
          newEdgesMap.set(key, edgesRef.current.get(key)!);
        } else {
          // Если ребра нет, создаем новое
          const connectedNode = nodesRef.current.get(connectedNodeId);
          if (connectedNode) {
            // Определяем прозрачность ребра на основе глубины соединяемых нод
            const avgDepth = (node.depth + connectedNode.depth) / 2;

            // Определяем ширину ребра
            const widthRange = mergedOptions.current.edgeWidthRange!;
            const width = widthRange[0] + avgDepth * (widthRange[1] - widthRange[0]);

            newEdgesMap.set(key, {
              from: node.id,
              to: connectedNodeId,
              opacity: 0, // Начинаем с полностью прозрачного ребра
              width,
              createdAt: now, // Запоминаем время создания
            });
          }
        }
      });
    });

    edgesRef.current = newEdgesMap;
  };

  // Функция для добавления ноды в очередь
  const queueNewNode = () => {
    if (!isInitializedRef.current || getNodesArray().length >= mergedOptions.current.maxNodes!)
      return;

    const now = Date.now();
    const timeSinceLastNode = now - lastNodeTimeRef.current;
    const nodeInterval = 1000 / mergedOptions.current.nodeGrowthRate!;

    if (timeSinceLastNode >= nodeInterval) {
      // Если уже достигли максимального количества нод, не добавляем новые
      if (getNodesArray().length >= mergedOptions.current.maxNodes!) {
        return;
      }

      // Если очередь слишком длинная, пропускаем добавление
      if (nodeQueueRef.current.length >= 3) {
        // Уменьшаем максимальную длину очереди
        return;
      }

      // Выбираем случайную существующую ноду для подключения
      const parentNodeIndex = Math.floor(Math.random() * getNodesArray().length);
      const parentNodeId = getNodesArray()[parentNodeIndex].id;

      // Добавляем ноду в очередь с задержкой
      const delay = 1200; // Увеличиваем задержку между появлением нодов (1.2 секунды)

      nodeQueueRef.current.push({
        parentNodeId,
        delay,
        createdAt: now,
      });

      // Обновляем время последней добавленной ноды
      lastNodeTimeRef.current = now;
    }
  };

  // Функция для обработки очереди нодов
  const processNodeQueue = () => {
    const now = Date.now();

    if (nodeQueueRef.current.length > 0) {
      const nextNode = nodeQueueRef.current[0];
      const timeInQueue = now - nextNode.createdAt;

      // Если прошло достаточно времени, добавляем ноду
      if (timeInQueue >= nextNode.delay) {
        // Удаляем ноду из очереди
        nodeQueueRef.current.shift();

        // Добавляем ноду
        addNewNode(nextNode.parentNodeId);
      }
    }
  };

  // Функция для добавления новой ноды
  const addNewNode = (parentNodeId: number) => {
    if (!isInitializedRef.current || getNodesArray().length >= mergedOptions.current.maxNodes!)
      return;

    const now = Date.now();

    // Находим родительскую ноду
    const parentNode = nodesRef.current.get(parentNodeId);
    if (!parentNode) return;

    // Определяем глубину новой ноды (случайно, но с тенденцией к уменьшению)
    const depthLevel = Math.max(0.1, parentNode.depth - getRandomInRange(0.1, 0.3));

    // Определяем размер ноды на основе глубины С ЖЕСТКИМ ОГРАНИЧЕНИЕМ
    const sizeRange = mergedOptions.current.nodeSizeRange!;
    let size = sizeRange[0] + depthLevel * (sizeRange[1] - sizeRange[0]);

    // Жесткое ограничение размера
    const maxAllowedSize = 10; // Максимально допустимый размер нода в пикселях
    if (size > maxAllowedSize) {
      size = maxAllowedSize;
    }

    // Случайное положение новой ноды относительно родительской, но на большем расстоянии
    const angle = Math.random() * Math.PI * 2;
    const optimalDistance = mergedOptions.current.optimalDistance || 100;
    const distance = getRandomInRange(optimalDistance * 0.8, optimalDistance * 1.2); // Используем оптимальное расстояние с небольшим разбросом
    const x = parentNode.x + Math.cos(angle) * distance;
    const y = parentNode.y + Math.sin(angle) * distance;

    // Создаем новую ноду с тем же цветом, что и у родительской
    const newNodeId = getNodesArray().length;
    const newNode: Node = {
      id: newNodeId,
      x,
      y,
      size,
      depth: depthLevel,
      vx: getRandomInRange(-0.3, 0.3) * mergedOptions.current.nodeMovementSpeed!,
      vy: getRandomInRange(-0.3, 0.3) * mergedOptions.current.nodeMovementSpeed!,
      color: parentNode.color, // Наследуем цвет от родительской ноды
      connections: new Set([parentNodeId]),
      isVisible: true,
      opacity: 0, // Начинаем с полностью прозрачной ноды
      createdAt: now, // Запоминаем время создания
      animationPhase: 'appearing', // Начальная фаза анимации
    };

    // Обновляем связи родительской ноды
    const updatedParentNode = {
      ...parentNode,
      connections: new Set([...parentNode.connections, newNodeId]),
    };

    // Обновляем родительскую ноду
    nodesRef.current.set(parentNodeId, updatedParentNode);

    // Добавляем новую ноду
    nodesRef.current.set(newNodeId, newNode);

    // Создаем дополнительные связи для более плотной сети, но с меньшей вероятностью
    if (getNodesArray().length > 3) {
      const connectionProbability = mergedOptions.current.connectionProbability || 0.2;

      // Перебираем существующие ноды и с некоторой вероятностью создаем дополнительные связи
      getNodesArray().forEach(node => {
        if (node.id !== newNodeId && Math.random() < connectionProbability) {
          // Проверяем, не слишком ли много связей у ноды
          if (node.connections.size < mergedOptions.current.maxConnections!) {
            // Проверяем расстояние между нодами - соединяем только если они не слишком далеко
            const distance = calculateDistance(node.x, node.y, newNode.x, newNode.y);
            if (distance < 300) {
              // Ограничиваем максимальное расстояние для связи
              // Добавляем связь между новой нодой и существующей
              if (!node.connections.has(newNodeId)) {
                const updatedNode = {
                  ...node,
                  connections: new Set([...node.connections, newNodeId]),
                };
                nodesRef.current.set(node.id, updatedNode);

                // Добавляем обратную связь
                newNode.connections.add(node.id);
              }
            }
          }
        }
      });
    }

    // Обновляем рёбра
    updateEdges();
  };

  // Функция для анимации и отрисовки
  const animate = () => {
    if (!canvasRef.current || !contextRef.current || getNodesArray().length === 0) return;

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const now = Date.now();

    // Обрабатываем очередь нодов
    processNodeQueue();

    // Добавляем новые ноды в очередь
    queueNewNode();

    // Очищаем канвас
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рассчитываем силы отталкивания между нодами
    const repulsionForce = mergedOptions.current.repulsionForce || 0.7;
    const repulsionRadius = mergedOptions.current.repulsionRadius || 200;
    const attractionForce = mergedOptions.current.attractionForce || 0.05;
    const optimalDistance = mergedOptions.current.optimalDistance || 100;
    const centeringForce = mergedOptions.current.centeringForce || 0.01;
    const collisionDamping = mergedOptions.current.collisionDamping || 0.7;
    const collisionElasticity = mergedOptions.current.collisionElasticity || 1.2;
    const velocityDamping = mergedOptions.current.velocityDamping || 0.98;
    const randomImpulseIntensity = mergedOptions.current.randomImpulseIntensity || 0.3;
    const randomImpulseProbability = mergedOptions.current.randomImpulseProbability || 0.05;
    const boundaryRepulsionForce = mergedOptions.current.boundaryRepulsionForce || 0.8;
    const minDistanceBetweenNodes = mergedOptions.current.minDistanceBetweenNodes || 30;
    const wanderingFactor = mergedOptions.current.wanderingFactor || 0.2;

    // Создаем временный массив для хранения сил отталкивания
    const forces = new Map<number, { fx: number; fy: number }>();

    // Инициализируем силы для каждой ноды
    getNodesArray().forEach(node => {
      forces.set(node.id, { fx: 0, fy: 0 });
    });

    // Рассчитываем силы отталкивания между всеми парами нод
    const nodesArray = getNodesArray();
    for (let i = 0; i < nodesArray.length; i++) {
      const nodeA = nodesArray[i];

      for (let j = i + 1; j < nodesArray.length; j++) {
        const nodeB = nodesArray[j];

        // Рассчитываем расстояние между нодами
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Проверяем, не слишком ли близко ноды друг к другу
        const minDistance = minDistanceBetweenNodes + nodeA.size + nodeB.size;
        if (distance < minDistance && distance > 0) {
          // Рассчитываем силу отталкивания (чем ближе, тем сильнее)
          const force = repulsionForce * 2 * (1 - distance / minDistance);

          // Нормализуем направление
          const nx = dx / distance;
          const ny = dy / distance;

          // Рассчитываем компоненты силы
          const fx = -nx * force;
          const fy = -ny * force;

          // Добавляем силы к обеим нодам (в противоположных направлениях)
          const forceA = forces.get(nodeA.id)!;
          const forceB = forces.get(nodeB.id)!;

          forceA.fx += fx;
          forceA.fy += fy;

          forceB.fx -= fx;
          forceB.fy -= fy;
        }

        // Проверяем столкновение нодов (если расстояние меньше суммы радиусов)
        const collisionDistance = nodeA.size + nodeB.size;
        if (distance < collisionDistance && distance > 0) {
          // Обрабатываем столкновение
          // Нормализуем направление
          const nx = dx / distance;
          const ny = dy / distance;

          // Рассчитываем относительную скорость
          const dvx = nodeB.vx - nodeA.vx;
          const dvy = nodeB.vy - nodeA.vy;

          // Проекция относительной скорости на направление столкновения
          const dotProduct = dvx * nx + dvy * ny;

          // Применяем импульс только если ноды сближаются
          if (dotProduct < 0) {
            // Рассчитываем импульс с учетом коэффициента упругости
            const impulse = (1 + collisionElasticity) * dotProduct;

            // Применяем импульс к обеим нодам
            const forceA = forces.get(nodeA.id)!;
            const forceB = forces.get(nodeB.id)!;

            // Увеличиваем силу импульса для большей инерции
            const impulseFactor = 1.5; // Увеличиваем импульс в 1.5 раза

            forceA.fx -= nx * impulse * collisionDamping * impulseFactor;
            forceA.fy -= ny * impulse * collisionDamping * impulseFactor;

            forceB.fx += nx * impulse * collisionDamping * impulseFactor;
            forceB.fy += ny * impulse * collisionDamping * impulseFactor;

            // Добавляем более сильное случайное отклонение для более хаотичного движения
            const randomAngle = Math.random() * Math.PI * 2;
            const randomForce = 0.2; // Увеличиваем случайную силу

            forceA.fx += Math.cos(randomAngle) * randomForce;
            forceA.fy += Math.sin(randomAngle) * randomForce;

            forceB.fx += Math.cos(randomAngle + Math.PI) * randomForce;
            forceB.fy += Math.sin(randomAngle + Math.PI) * randomForce;
          }
        }

        // Применяем силу отталкивания только если ноды достаточно близко
        if (distance < repulsionRadius && distance > 0) {
          // Сила отталкивания обратно пропорциональна расстоянию
          const force = repulsionForce * (1 - distance / repulsionRadius);

          // Нормализуем направление
          const nx = dx / distance;
          const ny = dy / distance;

          // Рассчитываем компоненты силы
          const fx = -nx * force;
          const fy = -ny * force;

          // Добавляем силы к обеим нодам (в противоположных направлениях)
          const forceA = forces.get(nodeA.id)!;
          const forceB = forces.get(nodeB.id)!;

          forceA.fx += fx;
          forceA.fy += fy;

          forceB.fx -= fx;
          forceB.fy -= fy;
        }

        // Применяем силу притяжения между связанными нодами
        const areConnected = nodeA.connections.has(nodeB.id) || nodeB.connections.has(nodeA.id);
        if (areConnected && distance > 0) {
          // Рассчитываем силу притяжения на основе разницы между текущим и оптимальным расстоянием
          // Если расстояние больше оптимального - притягиваем, если меньше - слегка отталкиваем
          const distanceDiff = distance - optimalDistance;
          const force = (attractionForce * distanceDiff) / optimalDistance;

          // Нормализуем направление
          const nx = dx / distance;
          const ny = dy / distance;

          // Рассчитываем компоненты силы (положительные для притяжения, отрицательные для отталкивания)
          const fx = nx * force;
          const fy = ny * force;

          // Добавляем силы к обеим нодам
          const forceA = forces.get(nodeA.id)!;
          const forceB = forces.get(nodeB.id)!;

          forceA.fx += fx;
          forceA.fy += fy;

          forceB.fx -= fx;
          forceB.fy -= fy;
        }
      }
    }

    // Рассчитываем центр масс графа
    let centerX = 0;
    let centerY = 0;

    nodesArray.forEach(node => {
      centerX += node.x;
      centerY += node.y;
    });

    centerX /= nodesArray.length;
    centerY /= nodesArray.length;

    // Рассчитываем силу центрирования для каждой ноды
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    // Вектор от центра масс графа к центру канваса
    const centeringDx = canvasCenterX - centerX;
    const centeringDy = canvasCenterY - centerY;

    // Применяем силу центрирования к каждой ноде
    nodesArray.forEach(node => {
      const force = forces.get(node.id)!;
      force.fx += centeringDx * centeringForce;
      force.fy += centeringDy * centeringForce;
    });

    // Обновляем позиции и прозрачность нод
    const nodes = getNodesArray().map(node => {
      let { x, y, vx, vy, opacity, size, animationPhase } = node;

      // ЖЕСТКОЕ ОГРАНИЧЕНИЕ РАЗМЕРА НОДА
      // Убедимся, что размер нода никогда не превышает допустимые пределы
      const maxAllowedSize = 10; // Максимально допустимый размер нода в пикселях
      if (size > maxAllowedSize) {
        size = maxAllowedSize;
      }

      // Применяем силы отталкивания
      const force = forces.get(node.id);
      if (force) {
        vx += force.fx;
        vy += force.fy;
      }

      // Добавляем случайные импульсы с некоторой вероятностью для поддержания движения
      if (Math.random() < randomImpulseProbability) {
        const angle = Math.random() * Math.PI * 2;
        vx += Math.cos(angle) * randomImpulseIntensity;
        vy += Math.sin(angle) * randomImpulseIntensity;
      }

      // Добавляем фактор блуждания для более естественного движения
      // Это создает эффект, будто ноды "исследуют" пространство
      const wanderingAngle = Math.random() * Math.PI * 2;
      vx += Math.cos(wanderingAngle) * wanderingFactor * 0.1;
      vy += Math.sin(wanderingAngle) * wanderingFactor * 0.1;

      // Применяем затухание скорости (очень медленное, чтобы сохранить движение)
      vx *= velocityDamping;
      vy *= velocityDamping;

      // Ограничиваем максимальную скорость, чтобы ноды не двигались слишком быстро
      const absoluteMaxSpeed = 2.0;
      const currentSpeed = Math.sqrt(vx * vx + vy * vy);
      if (currentSpeed > absoluteMaxSpeed) {
        vx = (vx / currentSpeed) * absoluteMaxSpeed;
        vy = (vy / currentSpeed) * absoluteMaxSpeed;
      }

      // Обеспечиваем минимальную скорость, чтобы ноды всегда были в движении
      const minSpeed = 0.1;
      if (currentSpeed < minSpeed && currentSpeed > 0) {
        vx = (vx / currentSpeed) * minSpeed;
        vy = (vy / currentSpeed) * minSpeed;
      }

      // Обновляем позицию с более плавным движением
      x += vx;
      y += vy;

      // Центр канваса для расчета направления отталкивания
      const canvasCenterX = canvas.width / 2;
      const canvasCenterY = canvas.height / 2;

      // Отталкивание от границ с направлением к центру экрана
      const boundaryMargin = 50; // Расстояние от границы, на котором начинает действовать отталкивание

      // Проверяем близость к левой границе
      if (x < boundaryMargin) {
        // Рассчитываем силу отталкивания (чем ближе к границе, тем сильнее)
        const force = boundaryRepulsionForce * (1 - x / boundaryMargin);

        // Направление к центру экрана
        const dx = canvasCenterX - x;
        const dy = canvasCenterY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          // Нормализуем направление
          const nx = dx / distance;
          const ny = dy / distance;

          // Применяем силу отталкивания в направлении центра
          vx += nx * force;
          vy += ny * force;
        }

        // Корректируем позицию, чтобы нода не застряла в границе
        x = Math.max(size, x);
      }

      // Проверяем близость к правой границе
      if (x > canvas.width - boundaryMargin) {
        // Рассчитываем силу отталкивания (чем ближе к границе, тем сильнее)
        const force = boundaryRepulsionForce * (1 - (canvas.width - x) / boundaryMargin);

        // Направление к центру экрана
        const dx = canvasCenterX - x;
        const dy = canvasCenterY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          // Нормализуем направление
          const nx = dx / distance;
          const ny = dy / distance;

          // Применяем силу отталкивания в направлении центра
          vx += nx * force;
          vy += ny * force;
        }

        // Корректируем позицию, чтобы нода не застряла в границе
        x = Math.min(canvas.width - size, x);
      }

      // Проверяем близость к верхней границе
      if (y < boundaryMargin) {
        // Рассчитываем силу отталкивания (чем ближе к границе, тем сильнее)
        const force = boundaryRepulsionForce * (1 - y / boundaryMargin);

        // Направление к центру экрана
        const dx = canvasCenterX - x;
        const dy = canvasCenterY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          // Нормализуем направление
          const nx = dx / distance;
          const ny = dy / distance;

          // Применяем силу отталкивания в направлении центра
          vx += nx * force;
          vy += ny * force;
        }

        // Корректируем позицию, чтобы нода не застряла в границе
        y = Math.max(size, y);
      }

      // Проверяем близость к нижней границе
      if (y > canvas.height - boundaryMargin) {
        // Рассчитываем силу отталкивания (чем ближе к границе, тем сильнее)
        const force = boundaryRepulsionForce * (1 - (canvas.height - y) / boundaryMargin);

        // Направление к центру экрана
        const dx = canvasCenterX - x;
        const dy = canvasCenterY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          // Нормализуем направление
          const nx = dx / distance;
          const ny = dy / distance;

          // Применяем силу отталкивания в направлении центра
          vx += nx * force;
          vy += ny * force;
        }

        // Корректируем позицию, чтобы нода не застряла в границе
        y = Math.min(canvas.height - size, y);
      }

      // Добавляем небольшое случайное отклонение для более естественного движения
      vx += (Math.random() - 0.5) * 0.05;
      vy += (Math.random() - 0.5) * 0.05;

      // Ограничиваем максимальную скорость
      const nodeMaxSpeed = 0.8 * mergedOptions.current.nodeMovementSpeed!;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > nodeMaxSpeed) {
        vx = (vx / speed) * nodeMaxSpeed;
        vy = (vy / speed) * nodeMaxSpeed;
      }

      // Управление фазами анимации
      const timeSinceCreation = now - node.createdAt;
      const appearingDuration = 800; // Длительность фазы появления (мс)
      const glowingDuration = 400; // Длительность фазы добавления свечения (мс)

      // Определяем текущую фазу анимации
      if (timeSinceCreation < appearingDuration) {
        animationPhase = 'appearing';
        // В фазе появления прозрачность линейно увеличивается от 0 до 1
        opacity = timeSinceCreation / appearingDuration;
      } else if (timeSinceCreation < appearingDuration + glowingDuration) {
        animationPhase = 'glowing';
        // В фазе добавления свечения прозрачность уже максимальная
        opacity = 1;
      } else {
        animationPhase = 'stable';
        opacity = 1;
      }

      // ОТКЛЮЧАЕМ ПУЛЬСАЦИЮ, так как она может быть причиной проблемы
      // const pulsationIntensity = mergedOptions.current.pulsationIntensity || 0.15;
      // const pulsation = Math.sin(now * 0.003 + node.id * 0.5) * pulsationIntensity;
      // const pulsatedSize = node.size * (1 + pulsation);

      // Используем фиксированный размер без пульсации
      const pulsatedSize = size;

      return { ...node, x, y, vx, vy, opacity, size: pulsatedSize, animationPhase };
    });

    // Обновляем Map нодов
    nodesRef.current = new Map(nodes.map(node => [node.id, node]));

    // Обновляем прозрачность рёбер
    const edges = getEdgesArray().map(edge => {
      // Если ребро уже полностью видимо, не меняем его прозрачность
      if (edge.opacity >= 1) return edge;

      // Плавное появление ребра (в течение 1.5 секунд)
      const fadeInDuration = 1500; // 1.5 секунды
      const timeSinceCreation = now - edge.createdAt;
      const baseOpacity = Math.min(1, timeSinceCreation / fadeInDuration);

      // Находим ноды, которые соединяет это ребро
      const fromNode = nodesRef.current.get(edge.from);
      const toNode = nodesRef.current.get(edge.to);

      // Определяем прозрачность ребра на основе глубины соединяемых нод и времени создания
      let opacity = baseOpacity;
      if (fromNode && toNode) {
        const avgDepth = (fromNode.depth + toNode.depth) / 2;
        opacity = baseOpacity * (0.2 + avgDepth * 0.8); // От 0.2 до 1.0, с учетом времени появления
      }

      return { ...edge, opacity };
    });

    // Обновляем Map рёбер
    edgesRef.current = new Map(edges.map(edge => [edgeKey(edge), edge]));

    // Отрисовываем рёбра (прямые линии)
    edges.forEach(edge => {
      const fromNode = nodesRef.current.get(edge.from);
      const toNode = nodesRef.current.get(edge.to);

      if (fromNode && toNode && fromNode.isVisible && toNode.isVisible) {
        // Рисуем прямую линию
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);

        // Используем edgeColor с прозрачностью на основе глубины и времени создания
        const edgeColor = mergedOptions.current.edgeColor || '#929292';
        ctx.strokeStyle = `rgba(${hexToRgb(edgeColor)}, ${edge.opacity})`;
        ctx.lineWidth = edge.width;
        ctx.stroke();
      }
    });

    // Отрисовываем ноды (сортируем по глубине, чтобы ноды с меньшей глубиной были позади)
    const sortedNodes = [...nodes].sort((a, b) => a.depth - b.depth);

    sortedNodes.forEach(node => {
      if (!node.isVisible) return;

      // ПРЯМАЯ ОТРИСОВКА БЕЗ ЭФФЕКТОВ

      // Определяем базовый размер ноды (с жестким ограничением)
      const baseSize = Math.min(node.size, 10); // Никогда не больше 10 пикселей

      // Определяем цвет ноды с учетом прозрачности и глубины
      const baseColor = node.color;
      const depthOpacity = 0.3 + node.depth * 0.7; // От 0.3 до 1.0 в зависимости от глубины
      const finalOpacity = depthOpacity * node.opacity; // Учитываем время создания

      // Получаем RGBA цвет
      const rgbaColor = baseColor.startsWith('#')
        ? `rgba(${hexToRgb(baseColor)}, ${finalOpacity})`
        : baseColor;

      // ПОЛНОСТЬЮ ОТКЛЮЧАЕМ СВЕЧЕНИЕ
      // Просто рисуем ноду без каких-либо эффектов
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseSize, 0, Math.PI * 2);
      ctx.fillStyle = rgbaColor;
      ctx.fill();
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Инициализация канваса и первой ноды
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;
    contextRef.current = context;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Создаем первую ноду, если еще не инициализировано
    if (!isInitializedRef.current) {
      const [xPercent, yPercent] = mergedOptions.current.initialNodePosition || [0.5, 0.5];

      // Используем nodeColor или первый цвет из массива nodeColors
      const nodeColor =
        mergedOptions.current.nodeColor ||
        (mergedOptions.current.nodeColors && mergedOptions.current.nodeColors.length > 0
          ? mergedOptions.current.nodeColors[0]
          : '#3B82F6');

      const now = Date.now();

      // Определяем размер первой ноды С ЖЕСТКИМ ОГРАНИЧЕНИЕМ
      let initialSize = mergedOptions.current.nodeSizeRange![1]; // Самая большая нода

      // Жесткое ограничение размера
      const maxAllowedSize = 10; // Максимально допустимый размер нода в пикселях
      if (initialSize > maxAllowedSize) {
        initialSize = maxAllowedSize;
      }

      const initialNode: Node = {
        id: 0,
        x: canvas.width * xPercent,
        y: canvas.height * yPercent,
        size: initialSize,
        depth: 1, // Самый верхний слой
        vx: 0,
        vy: 0,
        color: nodeColor,
        connections: new Set(),
        isVisible: true,
        opacity: 0, // Начинаем с полностью прозрачной ноды
        createdAt: now, // Запоминаем время создания
        animationPhase: 'appearing', // Начальная фаза анимации
      };

      // Очищаем Map нодов и добавляем первую ноду
      nodesRef.current.clear();
      nodesRef.current.set(0, initialNode);

      isInitializedRef.current = true;
      lastNodeTimeRef.current = now;

      // Очищаем очередь нодов
      nodeQueueRef.current = [];

      // Очищаем кэш отрисованных нодов
      nodeRenderCacheRef.current.clear();
    }

    // Запускаем анимацию
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [options]); // Зависимость только от options, чтобы эффект запускался только при изменении опций

  // Обновляем mergedOptions при изменении options
  useEffect(() => {
    const prevOptions = mergedOptions.current;
    mergedOptions.current = { ...defaultOptions, ...options };

    // Проверяем, изменился ли цвет нод
    const prevNodeColor =
      prevOptions.nodeColor ||
      (prevOptions.nodeColors && prevOptions.nodeColors.length > 0
        ? prevOptions.nodeColors[0]
        : '#3B82F6');

    const newNodeColor =
      mergedOptions.current.nodeColor ||
      (mergedOptions.current.nodeColors && mergedOptions.current.nodeColors.length > 0
        ? mergedOptions.current.nodeColors[0]
        : '#3B82F6');

    // Если цвет изменился и есть ноды, обновляем цвет всех нод
    if (prevNodeColor !== newNodeColor && getNodesArray().length > 0) {
      updateAllNodesColor(newNodeColor);
    }
  }, [options]);

  // Функция для обновления цвета всех нод
  const updateAllNodesColor = (newColor: string) => {
    if (getNodesArray().length === 0) return;

    // Обновляем цвет всех нод
    nodesRef.current = new Map(
      getNodesArray().map(node => [node.id, { ...node, color: newColor }])
    );
  };

  return (
    <div ref={containerRef} className={`relative w-screen h-screen ${className}`} style={style}>
      <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full' />
    </div>
  );
};

// Функция для преобразования HEX-цвета в RGB
const hexToRgb = (hex: string): string => {
  // Удаляем # из начала строки, если она есть
  hex = hex.replace(/^#/, '');

  // Преобразуем 3-символьный HEX в 6-символьный
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Преобразуем HEX в RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
};

export default GraphNetwork;
