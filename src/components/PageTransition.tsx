
'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};


export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const direction = pathname === '/' ? -1 : 1;

  return (
    <motion.div
      key={pathname}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}
