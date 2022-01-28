import { SVGAttributes } from 'react';

export interface ISvgProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string;
}
