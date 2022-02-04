/* eslint-disable @typescript-eslint/no-explicit-any */
import * as faker from 'faker';

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

const dndNestedData = {
  id: 'seed',
  label: 'President',
  children: [
    {
      ...fakeData(),
      children: [
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                {
                  ...fakeData(),
                  children: [
                    {
                      ...fakeData(),
                      children: [
                        { ...fakeData(), children: [] },
                        {
                          ...fakeData(),
                          children: [
                            {
                              ...fakeData(),
                              children: [
                                {
                                  ...fakeData(),
                                  children: [
                                    {
                                      ...fakeData(),
                                      children: [
                                        {
                                          ...fakeData(),
                                          children: [
                                            {
                                              ...fakeData(),
                                              children: [
                                                {
                                                  ...fakeData(),
                                                  children: [
                                                    {
                                                      ...fakeData(),
                                                      children: [],
                                                    },
                                                    {
                                                      ...fakeData(),
                                                      children: [],
                                                    },
                                                    {
                                                      ...fakeData(),
                                                      children: [],
                                                    },
                                                  ],
                                                },
                                                {
                                                  ...fakeData(),
                                                  children: [
                                                    {
                                                      ...fakeData(),
                                                      children: [
                                                        {
                                                          ...fakeData(),
                                                          children: [
                                                            {
                                                              ...fakeData(),
                                                              children: [
                                                                {
                                                                  ...fakeData(),
                                                                  children: [
                                                                    {
                                                                      ...fakeData(),
                                                                      children:
                                                                        [],
                                                                    },
                                                                    {
                                                                      ...fakeData(),
                                                                      children:
                                                                        [],
                                                                    },
                                                                    {
                                                                      ...fakeData(),
                                                                      children:
                                                                        [],
                                                                    },
                                                                  ],
                                                                },
                                                                {
                                                                  ...fakeData(),
                                                                  children: [],
                                                                },
                                                                {
                                                                  ...fakeData(),
                                                                  children: [],
                                                                },
                                                              ],
                                                            },
                                                            {
                                                              ...fakeData(),
                                                              children: [],
                                                            },
                                                            {
                                                              ...fakeData(),
                                                              children: [],
                                                            },
                                                          ],
                                                        },
                                                        {
                                                          ...fakeData(),
                                                          children: [],
                                                        },
                                                        {
                                                          ...fakeData(),
                                                          children: [],
                                                        },
                                                      ],
                                                    },
                                                    {
                                                      ...fakeData(),
                                                      children: [],
                                                    },
                                                    {
                                                      ...fakeData(),
                                                      children: [],
                                                    },
                                                  ],
                                                },
                                                { ...fakeData(), children: [] },
                                              ],
                                            },
                                            { ...fakeData(), children: [] },
                                            { ...fakeData(), children: [] },
                                          ],
                                        },
                                        { ...fakeData(), children: [] },
                                        { ...fakeData(), children: [] },
                                      ],
                                    },
                                    {
                                      ...fakeData(),
                                      children: [
                                        { ...fakeData(), children: [] },
                                        { ...fakeData(), children: [] },
                                        { ...fakeData(), children: [] },
                                      ],
                                    },
                                    { ...fakeData(), children: [] },
                                  ],
                                },
                                { ...fakeData(), children: [] },
                                { ...fakeData(), children: [] },
                              ],
                            },
                            { ...fakeData(), children: [] },
                            { ...fakeData(), children: [] },
                          ],
                        },
                        { ...fakeData(), children: [] },
                      ],
                    },
                    {
                      ...fakeData(),
                      children: [
                        { ...fakeData(), children: [] },
                        { ...fakeData(), children: [] },
                        { ...fakeData(), children: [] },
                      ],
                    },
                    { ...fakeData(), children: [] },
                  ],
                },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
      ],
    },
    {
      ...fakeData(),
      children: [
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
      ],
    },
    {
      ...fakeData(),
      children: [
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
      ],
    },
    {
      ...fakeData(),
      children: [
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
      ],
    },
    {
      ...fakeData(),
      children: [
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
        {
          ...fakeData(),
          children: [
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
            {
              ...fakeData(),
              children: [
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
                { ...fakeData(), children: [] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const dndData = nestedObjectToMap(dndNestedData);
