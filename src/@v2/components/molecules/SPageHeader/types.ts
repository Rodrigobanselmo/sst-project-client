export interface SPageHeaderProps {
  title: string;
  /**
   * Nome do registro em edição, na mesma linha e no mesmo tamanho do título,
   * com peso normal. Opcional — não altera o layout quando omitido.
   */
  contextName?: string;
  /**
   * Contexto discreto abaixo do título. Ignorado quando `contextName` está presente.
   */
  subtitle?: string;
  mb?: number | number[];
  /** Quando omitido, usa `router.back()`. */
  onBack?: () => void;
}
