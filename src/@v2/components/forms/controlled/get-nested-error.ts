export function getNestedError(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path
    .replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
    .split('.')
    .filter(Boolean)
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj,
    );
}
