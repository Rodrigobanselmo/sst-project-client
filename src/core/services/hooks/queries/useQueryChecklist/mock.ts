import * as faker from 'faker';

import { RiskEnum } from 'core/enums/risk.enums';

import { IRiskFactors } from '../../../../interfaces/IRiskFactors';

const fakeData = (type: RiskEnum) => {
  return {
    id: faker.datatype.uuid(),
    name: faker.lorem.sentence() + ' ' + faker.lorem.sentence(),
    system: true,
    type,
  } as IRiskFactors;
};

export const mockedRisks = [
  ...Array.from({ length: 20 }).map(() => fakeData(RiskEnum.ACI)),
  ...Array.from({ length: 60 }).map(() => fakeData(RiskEnum.BIO)),
  ...Array.from({ length: 700 }).map(() => fakeData(RiskEnum.QUI)),
  ...Array.from({ length: 200 }).map(() => fakeData(RiskEnum.ACI)),
  ...Array.from({ length: 100 }).map(() => fakeData(RiskEnum.QUI)),
];
