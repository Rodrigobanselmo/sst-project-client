import React from 'react';
import { Path } from 'react-konva';

export const ArrowIcon = (props) => {
  const path = 'M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z';

  return <Path data={path} {...props} />;
};
