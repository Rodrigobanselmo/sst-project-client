/** Espelho das regras da API (validação server-side continua obrigatória). */
export const CATALOG_ONLY_MAX_IMAGES_PER_ANALYSIS = 5;
export const CATALOG_ONLY_MAX_TEMP_IMAGE_BYTES = 2 * 1024 * 1024;
export const CATALOG_ONLY_ALLOWED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type CatalogOnlyAllowedImageMime =
  (typeof CATALOG_ONLY_ALLOWED_IMAGE_MIME)[number];
