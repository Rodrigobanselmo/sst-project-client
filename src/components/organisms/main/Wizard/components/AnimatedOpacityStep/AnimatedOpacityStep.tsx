import * as React from 'react';

import { motion } from 'framer-motion';

const AnimatedOpacity: React.FC<
  { children?: any } & { children: React.ReactNode }
> = ({ children }) => {
  return (
    <motion.div
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

export default React.memo(AnimatedOpacity);
