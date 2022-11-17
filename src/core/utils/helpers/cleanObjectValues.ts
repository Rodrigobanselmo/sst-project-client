import clone from 'clone';

// eslint-disable-next-line @typescript-eslint/ban-types
export const cleanObjectValues = (obj: Object) => {
  const copy = clone(obj) as any;
  Object.keys(copy).forEach((key) => {
    // if (copy[key] === undefined) delete copy[key];
    if (typeof copy[key] === 'string' && copy[key].match(/\d{4}-\d{2}-\d{2}/))
      copy[key] = new Date(copy[key]);
    if (!copy[key]) delete copy[key];
    if (typeof copy[key] === 'function') delete copy[key];
  });

  return copy;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const cleanObjectNullValues = (obj: Object) => {
  const copy = clone(obj) as any;
  Object.keys(copy).forEach((key) => {
    if (copy[key] == null || copy[key] == undefined) delete copy[key];
  });

  return copy;
};
