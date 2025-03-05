import { motion, MotionValue } from 'framer-motion';

interface ParallaxSectionProps {
  y: MotionValue<number>;
  children: React.ReactNode;
}

export const ParallaxSection = ({ y, children }: ParallaxSectionProps) => {
  return (
    <motion.section
      style={{ y }}
      className="min-h-screen flex items-center justify-center"
    >
      {children}
    </motion.section>
  );
};