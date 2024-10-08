import React from 'react';
import { Path } from 'react-konva';

export const TextUpIcon = (props) => {
  const path =
    'M.99 19h2.42l1.27-3.58h5.65L11.59 19h2.42L8.75 5h-2.5L.99 19zm4.42-5.61L7.44 7.6h.12l2.03 5.79H5.41zM20 11h3v2h-3v3h-2v-3h-3v-2h3V8h2v3z';

  return <Path data={path} {...props} />;
};
