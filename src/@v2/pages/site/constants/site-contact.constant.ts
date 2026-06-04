/** Contatos institucionais — centralizar alterações futuras aqui. */
export const SITE_CONTACT = {
  email: 'atendimento@simplesst.com',
  /** Número WhatsApp com DDI/DDD (ex.: 5511999999999). Vazio até definir o canal oficial. */
  whatsappNumber: '',
} as const;

export function getSiteWhatsAppHref(): string | undefined {
  const digits = SITE_CONTACT.whatsappNumber.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : undefined;
}
