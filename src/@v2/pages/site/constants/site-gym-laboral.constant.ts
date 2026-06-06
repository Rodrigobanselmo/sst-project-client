/** Materiais gratuitos — ginástica laboral (embed YouTube, sem hospedagem local) */
export const SITE_GYM_LABORAL = {
  path: '/site/materiais/ginastica-laboral',
  title: 'Ginástica laboral para pausas rápidas no trabalho',
  subtitle:
    'Três vídeos curtos para apoiar mobilidade, circulação e alívio de tensões durante a rotina.',
  durationLabel: 'cerca de 2 a 3 minutos',
  disclaimer:
    'Material educativo. Respeite seus limites. Em caso de dor, condição médica, tontura ou desconforto, interrompa a atividade e procure orientação profissional.',
  ctaTitle: 'Quer organizar ações de ergonomia e SST na sua empresa?',
  ctaHref: '/site#contato',
  videos: [
    {
      title: 'Cabeça e pescoço',
      description:
        'Alongamentos suaves para aliviar tensão na região cervical e apoiar uma postura mais confortável durante o trabalho.',
      youtubeId: 'Rg6s1c5N6wo',
      youtubeUrl: 'https://www.youtube.com/watch?v=Rg6s1c5N6wo',
    },
    {
      title: 'Pernas e pés',
      description:
        'Movimentos para estimular circulação e mobilidade nas pernas e nos pés, ideais para pausas em ambientes sedentários.',
      youtubeId: 'UWnbiuHF4yU',
      youtubeUrl: 'https://www.youtube.com/watch?v=UWnbiuHF4yU',
    },
    {
      title: 'Mãos e braços',
      description:
        'Exercícios para reduzir tensão em mãos, punhos e braços — úteis para quem digita, escreve ou opera equipamentos.',
      youtubeId: 'eIPi--emwgM',
      youtubeUrl: 'https://www.youtube.com/watch?v=eIPi--emwgM',
    },
  ],
} as const;

export function getGymLaboralEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`;
}
