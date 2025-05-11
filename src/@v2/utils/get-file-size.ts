export const getSizeInMbOrKb = (size: number): string => {
  const mb = Math.floor(size / 1024 / 1024);
  const kb = Math.floor((size % (1024 * 1024)) / 1024);
  if (mb === 0) {
    return `${kb} KB`;
  }
  return `${mb} MB`;
};
