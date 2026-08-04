export interface SPageHeaderProps {
  title: string;
  /**
   * Contexto discreto abaixo do título (ex.: nome do elemento em edição).
   * Opcional — não altera o layout quando omitido.
   */
  subtitle?: string;
  mb?: number | number[];
  /** Quando omitido, usa `router.back()`. */
  onBack?: () => void;
}
