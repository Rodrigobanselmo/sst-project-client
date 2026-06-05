/** App mobile SimpleSST — interface de campo (não substitui a plataforma web) */
export const SITE_MOBILE_APP = {
  googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.simplesst.app',
  appStoreUrl: 'https://apps.apple.com/br/app/simplesst/id6756221157',
  qrGooglePlay: '/site/qrcode-google-play.png',
  qrAppStore: '/site/qrcode-app-store.png',
  fieldCollection: '/site/mobile-app-field-collection.png',
} as const;

export const SITE_MOBILE_FEATURES = [
  {
    title: 'Coleta em campo',
    description:
      'Registre fotos, vídeos, áudios e informações diretamente no local da atividade.',
    image: '/site/mobile-card-coleta-campo.png',
    imageAlt: 'Ilustração de coleta de informações em campo pelo aplicativo SimpleSST',
  },
  {
    title: 'Envio para a plataforma',
    description: 'As evidências coletadas são enviadas para o ambiente web do SimpleSST.',
    image: '/site/mobile-card-envio-plataforma.png',
    imageAlt: 'Ilustração de envio de evidências do aplicativo para a plataforma web',
  },
  {
    title: 'Gestão estruturada',
    description:
      'A plataforma organiza os dados em fluxos de riscos, ações, documentos e evidências.',
    image: '/site/mobile-card-gestao-estruturada.png',
    imageAlt: 'Ilustração de gestão estruturada de riscos e documentos na plataforma web',
  },
] as const;
