import { IPopperProps } from 'components/molecules/SPopperArrow/types';
import { ExposureTypeEnum } from 'core/enums/exposure.enum';

export type ISelectExposureProps = {
  exposure?: ExposureTypeEnum;
  onSelect: (exposure: ExposureTypeEnum) => void;
};
