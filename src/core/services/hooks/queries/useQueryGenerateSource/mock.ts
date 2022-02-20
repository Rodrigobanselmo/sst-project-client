import * as faker from 'faker';

import { IGenerateSource } from 'core/interfaces/api/IGenerateSource';

const fakeData = (id?: string) => {
  return {
    id: id || faker.datatype.uuid(),
    name: faker.lorem.sentence(),
    system: true,
  } as IGenerateSource;
};

export const mockedSource = [
  ...Array.from({ length: 100 }).map(() => fakeData()),
];
