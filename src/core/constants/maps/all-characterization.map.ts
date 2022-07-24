import {
  characterizationMap,
  ICharacterizationMap,
} from './characterization.map';
import { environmentMap, IEnvironmentMap } from './environment.map';

export const allCharacterizationMap: IEnvironmentMap & ICharacterizationMap = {
  ...environmentMap,
  ...characterizationMap,
};
