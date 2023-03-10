export function transformArrayToObjectFunction<T>(entityMap: T[]): T {
  const obj: any = {};
  for (let i = 0; i < entityMap.length; i++) {
    obj[i] = entityMap[i];
  }
  return obj;
}
