import { motion } from 'motion/react';

const Box = (props: any) => {
  return (
    <div
      ref={props.ref}
      aria-hidden={props.ariaHidden}
      className={props.className}
      aria-label={props.ariaLabel}
      {...props}
    />
  );
};

export const MotionBox = motion.create(Box);
