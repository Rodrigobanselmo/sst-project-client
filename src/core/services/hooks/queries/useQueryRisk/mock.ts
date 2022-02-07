import * as faker from 'faker';

import { IRiskFactors } from '../../../../interfaces/IRiskFactors';

const fakeData = (type: string) => {
  return {
    id: faker.datatype.uuid(),
    name: faker.lorem.sentence() + ' ' + faker.lorem.sentence(),
    system: true,
    type,
  } as IRiskFactors;
};

export const mockedRisks = [
  ...Array.from({ length: 20 }).map(() => fakeData('bio')),
  ...Array.from({ length: 60 }).map(() => fakeData('fis')),
  ...Array.from({ length: 700 }).map(() => fakeData('qui')),
  ...Array.from({ length: 200 }).map(() => fakeData('erg')),
  ...Array.from({ length: 100 }).map(() => fakeData('aci')),
];
