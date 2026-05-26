export interface SPageHeaderProps {
  title: string;
  mb?: number | number[];
  /** Quando omitido, usa `router.back()`. */
  onBack?: () => void;
}
