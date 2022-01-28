import * as React from 'react';

import { ISvgProps } from '../../../core/interfaces/ISvgProps';

function LogoSimpleIcon({
  color = '#F27329',
  size = '1rem',
  ...props
}: ISvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 640 640"
      width={size}
      height={size}
      {...props}
    >
      <defs>
        <path
          d="m266.7 132.19 262.77 167.62L266.7 20.93v111.26Zm147.09 306.15 153.47-97.71-437-278.62v164.03c.14 4.8.83 9.51 2.07 14.14 1.25 4.63 3 9.05 5.29 13.27 2.27 4.22 5.01 8.12 8.2 11.71 3.19 3.57 6.75 6.73 10.69 9.49 6.82 4.34 40.94 26.08 102.37 65.19l154.91 98.5ZM168.78 398.4c-4.29 2.8-37.46 24.72-38.51 60.74v159.93L400.85 446.9 247.1 348.84c-41.77 26.43-67.88 42.95-78.32 49.56Z"
          id="a"
        />
      </defs>
      <use xlinkHref="#a" fill={color} />
      <use xlinkHref="#a" fillOpacity={0} stroke="#000" strokeOpacity={0} />
    </svg>
  );
}

export default LogoSimpleIcon;
