import React from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: undefined as number | undefined,
    height: undefined as number | undefined,
  });

  React.useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
