import * as faker from 'faker';

import { IRecMed } from 'core/interfaces/IRecMed';

const fakeData = (id?: string) => {
  return {
    id: id || faker.datatype.uuid(),
    medName:
      faker.lorem.sentence() +
      ' ' +
      faker.lorem.sentence() +
      ' ' +
      faker.lorem.sentence() +
      ' ' +
      faker.lorem.sentence(),
    recName:
      faker.lorem.sentence() +
      ' ' +
      faker.lorem.sentence() +
      ' ' +
      faker.lorem.sentence() +
      ' ' +
      faker.lorem.sentence(),
    system: true,
  } as IRecMed;
};

export const mockedRecMed = [
  ...Array.from({ length: 500 }).map(() => fakeData()),
];
