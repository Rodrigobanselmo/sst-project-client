/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as faker from 'faker';

import { firstNodeId } from 'core/constants/first-node-id.constant';

const fakeData = () => {
  return {
    id: faker.datatype.uuid(),
    label: faker.name.firstName(),
  };
};

const nestedObjectToMap = (data: any) => {
  const mapObject: any = {};

  const loopChildren = (
    { children, ...dataChildren }: any,
    parentId?: number | string,
  ) => {
    const insert = {
      ...dataChildren,
      parentId: null as number | string | null,
      childrenIds: children.map((child: any) => child.id),
    };

    if (parentId || typeof parentId === 'number') {
      insert.parentId = parentId;
    }

    mapObject[insert.id] = insert;

    if (Array.isArray(children) && children.length > 0)
      children.map((child) => {
        loopChildren(child, dataChildren.id);
      });
  };

  loopChildren(data);

  return mapObject;
};

export const dndData = {
  '13496': {
    id: '13496',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '61439',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '13756': {
    id: '13756',
    childrenIds: ['92851', '70440'],
    type: 5,
    label: '1',
    parentId: '00588',
    expand: true,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '16349': {
    id: '16349',
    childrenIds: ['58216', '61439'],
    type: 3,
    label: '1',
    parentId: '57134',
    expand: true,
  },
  '21136': {
    id: '21136',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '00588',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '27902': {
    id: '27902',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '36857',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '34577': {
    id: '34577',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '61439',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '36857': {
    id: '36857',
    childrenIds: ['75759', '27902'],
    type: 4,
    label: '2',
    parentId: '58223',
    expand: true,
  },
  '37155': {
    id: '37155',
    childrenIds: [],
    type: 5,
    label: '',
    parentId: '92851',
    expand: false,
  },
  '40063': {
    id: '40063',
    childrenIds: [],
    type: 5,
    label: '',
    parentId: '92851',
    expand: false,
  },
  '43080': {
    id: '43080',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '00588',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '57134': {
    id: '57134',
    childrenIds: ['16349'],
    type: 2,
    label: '2',
    parentId: firstNodeId,
    expand: true,
  },
  '58216': {
    id: '58216',
    childrenIds: ['91752', '77289'],
    type: 4,
    label: '1',
    parentId: '16349',
    expand: false,
  },
  '58223': {
    id: '58223',
    childrenIds: ['00588', '36857'],
    type: 2,
    label: '1',
    parentId: firstNodeId,
    expand: true,
  },
  '61439': {
    id: '61439',
    childrenIds: ['65899', '34577', '13496'],
    type: 4,
    label: '2',
    parentId: '16349',
    expand: false,
  },
  '62145': {
    id: '62145',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '92851',
    expand: false,
  },
  '65899': {
    id: '65899',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '61439',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '70440': {
    id: '70440',
    childrenIds: [],
    type: 4,
    label: '11',
    parentId: '13756',
    expand: false,
  },
  '75759': {
    id: '75759',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '36857',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '77289': {
    id: '77289',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '58216',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '91610': {
    id: '91610',
    childrenIds: [],
    type: 5,
    label: '',
    parentId: '92851',
    expand: false,
  },
  '91752': {
    id: '91752',
    childrenIds: [],
    type: 5,
    label: '1',
    parentId: '58216',
    expand: false,
    risks: ['862078be-6eb1-4941-803f-0ea31e5b6434'],
    med: ['2b7a4099-723b-4f3b-ae98-d0f6d1a4abe5'],
    rec: ['19478acb-91b4-45ab-a54c-9f00b0154f53'],
  },
  '92851': {
    id: '92851',
    childrenIds: ['62145', '91610', '37155', '40063'],
    type: 4,
    label: '21',
    parentId: '13756',
    expand: true,
  },
  [firstNodeId]: {
    id: firstNodeId,
    label: 'President',
    type: 1,
    parentId: null,
    childrenIds: ['58223', '57134'],
    expand: true,
  },
  '00588': {
    id: '00588',
    childrenIds: ['13756', '21136', '43080'],
    type: 4,
    label: '1',
    parentId: '58223',
    expand: true,
  },
};

// const dndNestedData = {
//   id: firstNodeId,
//   label: 'President',
//   type: 1,
//   children: [],
//   // children: [
//   //   {
//   //     ...fakeData(),
//   //     type: 2,
//   //     children: [
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               {
//   //                 ...fakeData(),
//   //                 children: [
//   //                   {
//   //                     ...fakeData(),
//   //                     children: [
//   //                       { ...fakeData(), children: [] },
//   //                       {
//   //                         ...fakeData(),
//   //                         children: [
//   //                           {
//   //                             ...fakeData(),
//   //                             children: [
//   //                               {
//   //                                 ...fakeData(),
//   //                                 children: [
//   //                                   {
//   //                                     ...fakeData(),
//   //                                     children: [
//   //                                       {
//   //                                         ...fakeData(),
//   //                                         children: [
//   //                                           {
//   //                                             ...fakeData(),
//   //                                             children: [
//   //                                               {
//   //                                                 ...fakeData(),
//   //                                                 children: [
//   //                                                   {
//   //                                                     ...fakeData(),
//   //                                                     children: [],
//   //                                                   },
//   //                                                   {
//   //                                                     ...fakeData(),
//   //                                                     children: [],
//   //                                                   },
//   //                                                   {
//   //                                                     ...fakeData(),
//   //                                                     children: [],
//   //                                                   },
//   //                                                 ],
//   //                                               },
//   //                                               {
//   //                                                 ...fakeData(),
//   //                                                 children: [
//   //                                                   {
//   //                                                     ...fakeData(),
//   //                                                     children: [
//   //                                                       {
//   //                                                         ...fakeData(),
//   //                                                         children: [
//   //                                                           {
//   //                                                             ...fakeData(),
//   //                                                             children: [
//   //                                                               {
//   //                                                                 ...fakeData(),
//   //                                                                 children: [
//   //                                                                   {
//   //                                                                     ...fakeData(),
//   //                                                                     children:
//   //                                                                       [],
//   //                                                                   },
//   //                                                                   {
//   //                                                                     ...fakeData(),
//   //                                                                     children:
//   //                                                                       [],
//   //                                                                   },
//   //                                                                   {
//   //                                                                     ...fakeData(),
//   //                                                                     children:
//   //                                                                       [],
//   //                                                                   },
//   //                                                                 ],
//   //                                                               },
//   //                                                               {
//   //                                                                 ...fakeData(),
//   //                                                                 children: [],
//   //                                                               },
//   //                                                               {
//   //                                                                 ...fakeData(),
//   //                                                                 children: [],
//   //                                                               },
//   //                                                             ],
//   //                                                           },
//   //                                                           {
//   //                                                             ...fakeData(),
//   //                                                             children: [],
//   //                                                           },
//   //                                                           {
//   //                                                             ...fakeData(),
//   //                                                             children: [],
//   //                                                           },
//   //                                                         ],
//   //                                                       },
//   //                                                       {
//   //                                                         ...fakeData(),
//   //                                                         children: [],
//   //                                                       },
//   //                                                       {
//   //                                                         ...fakeData(),
//   //                                                         children: [],
//   //                                                       },
//   //                                                     ],
//   //                                                   },
//   //                                                   {
//   //                                                     ...fakeData(),
//   //                                                     children: [],
//   //                                                   },
//   //                                                   {
//   //                                                     ...fakeData(),
//   //                                                     children: [],
//   //                                                   },
//   //                                                 ],
//   //                                               },
//   //                                               { ...fakeData(), children: [] },
//   //                                             ],
//   //                                           },
//   //                                           { ...fakeData(), children: [] },
//   //                                           { ...fakeData(), children: [] },
//   //                                         ],
//   //                                       },
//   //                                       { ...fakeData(), children: [] },
//   //                                       { ...fakeData(), children: [] },
//   //                                     ],
//   //                                   },
//   //                                   {
//   //                                     ...fakeData(),
//   //                                     children: [
//   //                                       { ...fakeData(), children: [] },
//   //                                       { ...fakeData(), children: [] },
//   //                                       { ...fakeData(), children: [] },
//   //                                     ],
//   //                                   },
//   //                                   { ...fakeData(), children: [] },
//   //                                 ],
//   //                               },
//   //                               { ...fakeData(), children: [] },
//   //                               { ...fakeData(), children: [] },
//   //                             ],
//   //                           },
//   //                           { ...fakeData(), children: [] },
//   //                           { ...fakeData(), children: [] },
//   //                         ],
//   //                       },
//   //                       { ...fakeData(), children: [] },
//   //                     ],
//   //                   },
//   //                   {
//   //                     ...fakeData(),
//   //                     children: [
//   //                       { ...fakeData(), children: [] },
//   //                       { ...fakeData(), children: [] },
//   //                       { ...fakeData(), children: [] },
//   //                     ],
//   //                   },
//   //                   { ...fakeData(), children: [] },
//   //                 ],
//   //               },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //     ],
//   //   },
//   //   {
//   //     ...fakeData(),
//   //     type: 3,
//   //     children: [
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //     ],
//   //   },
//   //   {
//   //     ...fakeData(),
//   //     type: 4,
//   //     children: [
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //     ],
//   //   },
//   //   {
//   //     ...fakeData(),
//   //     children: [
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //     ],
//   //   },
//   //   {
//   //     ...fakeData(),
//   //     children: [
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //       {
//   //         ...fakeData(),
//   //         children: [
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //           {
//   //             ...fakeData(),
//   //             children: [
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //               { ...fakeData(), children: [] },
//   //             ],
//   //           },
//   //         ],
//   //       },
//   //     ],
//   //   },
//   // ],
// };

// export const dndData = nestedObjectToMap(dndNestedData);
