import clone from 'clone';

// eslint-disable-next-line @typescript-eslint/ban-types
export const cleanObjectValues = (obj: Object) => {
  const copy = clone(obj) as any;
  Object.keys(copy).forEach((key) => {
    // if (copy[key] === undefined) delete copy[key];
    if (!copy[key]) delete copy[key];
    if (typeof copy[key] === 'function') delete copy[key];
  });

  return copy;
};
