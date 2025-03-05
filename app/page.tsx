'use client';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import ParticleNetwork from './components/particles-network';
import { aquireFont } from './fonts';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const [options, setOptions] = useState({
    velocity: 1,
    density: 15000,
    netLineDistance: 200,
    netLineColor: '#929292',
    particleColors: ['#6D4E5C', '#aaa', '#FFC458']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <div ref={containerRef} className="relative">
      {/* Первая секция с parallax */}
      <motion.section 
        style={{ y: y1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <main className="flex flex-col gap-8 items-center sm:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={`${aquireFont.className} text-6xl flex items-center justify-center`}>Discover Deep, an innovative data management solution that uses advanced proxy and event-driven capabilities to streamline complex data relationships and system integrations</h1>
          </motion.div>
          
          {/* Добавляем компонент ThemeExample */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
          </motion.div>
          
          {/* ... остальной контент ... */}
        </main>
      </motion.section>

      {/* Вторая секция с parallax */}
      <motion.section 
        style={{ y: y2 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div style={{ width: '100vw', height: '100vh' }}>
          <ParticleNetwork options={options} />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex gap-4 items-center flex-col sm:flex-row"
        >
          {/* ... контент второй секции ... */}
        </motion.div>
      </motion.section>

      {/* Третья секция с parallax */}
      <motion.section 
        style={{ y: y3 }}
        className="min-h-screen flex items-center justify-center"
      >
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex gap-6 flex-wrap items-center justify-center"
        >
          {/* ... существующий футер ... */}
        </motion.footer>
      </motion.section>
    </div>
  );
}