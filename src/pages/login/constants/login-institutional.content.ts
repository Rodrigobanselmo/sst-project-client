export const LOGIN_HEADLINE_LEAD = 'Gestão de SST integrada,';
export const LOGIN_HEADLINE_REST = 'rastreável e';
export const LOGIN_HEADLINE_ACCENT = 'segura.';

export const LOGIN_SUBTITLE =
  'Centralize riscos, saúde ocupacional, documentos e ações em uma única plataforma.';

export const LOGIN_AUTH_TITLE = 'Acesse sua conta';
export const LOGIN_AUTH_SUBTITLE_BEFORE = 'Entre para acessar seu ambiente ';
export const LOGIN_AUTH_SUBTITLE_BRAND = 'SimpleSST';
export const LOGIN_AUTH_SUBTITLE_AFTER = '.';

export const LOGIN_TRUST_LINE = 'Ambiente seguro e protegido';

/** Marca oficial H-Destaque copiada de Downloads — uso exclusivo do login. */
export const LOGIN_BRAND = {
  logoOnLight: '/site/simplesst-logo-h-destaque-yellow-black.png',
  logoOnDark: '/site/simplesst-logo-h-destaque-yellow-white.png',
} as const;

/**
 * Geometria copiada do slide 03 (PRESENTATION_WHAT.orbit + primary).
 * Mantida local para o login não importar a apresentação.
 */
export const LOGIN_ECOSYSTEM_ORBIT = {
  hubX: 50,
  hubY: 50,
  cx: 50,
  cy: 52.5,
  rx: 39.61,
  ry: 18.23,
  rotate: -48,
} as const;

export type LoginEcosystemNodeSide =
  | 'left'
  | 'top'
  | 'right'
  | 'bottom'
  | 'top-left';

export const LOGIN_ECOSYSTEM_NODES = [
  { label: 'Estrutura de trabalho', x: 38.8, y: 37.8, side: 'left' },
  { label: 'Inventário de riscos', x: 66.2, y: 20.9, side: 'top' },
  { label: 'Medidas de controle', x: 72.5, y: 52.8, side: 'right' },
  { label: 'Plano de ação', x: 44.4, y: 80.2, side: 'bottom' },
  { label: 'Evidências', x: 23.5, y: 81.9, side: 'left' },
  { label: 'Acompanhamento', x: 27.5, y: 52.2, side: 'top-left' },
] as const satisfies ReadonlyArray<{
  label: string;
  x: number;
  y: number;
  side: LoginEcosystemNodeSide;
}>;

export const LOGIN_STATS = [
  { id: 'companies', label: 'empresas atendidas' },
  { id: 'workers', label: 'trabalhadores gerenciados' },
  { id: 'documents', label: 'documentos gerados' },
] as const;
