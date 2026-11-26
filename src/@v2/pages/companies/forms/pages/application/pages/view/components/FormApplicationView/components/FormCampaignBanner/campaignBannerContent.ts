import type { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';

export type BannerTexts = { intro: string; why: string; contact: string };
export const bannerLimits = { intro: 450, why: 650, contact: 250 };
export function defaultBannerTexts(
  application: Pick<FormApplicationReadModel, 'name' | 'description'>,
): BannerTexts {
  return {
    intro:
      `Participe da campanha ${application.name}. ${application.description?.trim() || 'Sua participação contribui para compreender o tema desta pesquisa.'}`.slice(
        0,
        450,
      ),
    why: 'Sua participação ajuda a identificar percepções e oportunidades de melhoria relacionadas ao objetivo desta pesquisa. Leia cada pergunta com atenção e compartilhe sua experiência.',
    contact: 'Em caso de dúvidas, procure a equipe responsável pela campanha.',
  };
}
/** Rebuild only the exact generated introduction; preserve authored copy. */
export function campaignBannerIntro(
  application: Pick<
    FormApplicationReadModel,
    'name' | 'description' | 'bannerIntroText'
  >,
): string {
  const saved = application.bannerIntroText?.trim();
  if (!saved) return defaultBannerTexts(application).intro;
  const prefix = 'Participe da campanha ';
  const description =
    application.description?.trim() ||
    'Sua participação contribui para compreender o tema desta pesquisa.';
  const suffix = `. ${description}`;
  if (saved.startsWith(prefix) && saved.endsWith(suffix)) {
    const previousName = saved.slice(prefix.length, -suffix.length);
    if (
      previousName &&
      defaultBannerTexts({
        name: previousName,
        description: application.description,
      }).intro === saved
    ) {
      return defaultBannerTexts(application).intro;
    }
  }
  return saved;
}

export function bannerPrivacyText(
  application: Pick<
    FormApplicationReadModel,
    'isAnonymous' | 'isShareableLink'
  >,
): string {
  if (!application.isAnonymous)
    return 'Esta campanha não está configurada como anônima. As respostas podem estar associadas à identificação do participante.';
  if (application.isShareableLink)
    return 'Participação anônima por link compartilhado, sem necessidade de cadastro de empregado. No acesso por este link, as respostas não são vinculadas ao cadastro de um funcionário. O sistema utiliza barreiras de proteção para reduzir o risco de identificação dos respondentes.';
  return 'Esta campanha está configurada como anônima. O acesso individual pode permitir o controle de participação, enquanto o sistema protege o vínculo entre a pessoa e suas respostas e aplica barreiras para reduzir o risco de identificação nos resultados.';
}
