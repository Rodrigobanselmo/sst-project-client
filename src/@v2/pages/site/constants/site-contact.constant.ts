/** Contatos comerciais — centralizar alterações futuras aqui. */
const SITE_WHATSAPP_MESSAGE =
  'Olá, vi o SimpleSST no site e tenho interesse em conhecer melhor a plataforma. Vocês podem me passar mais informações?';

export const SITE_CONTACT = {
  email: 'comercial@simplesst.com.br',
  whatsappNumber: '5551983485050',
  whatsappDisplay: '+55 (51) 98348-5050',
  whatsappHref: `https://wa.me/5551983485050?text=${encodeURIComponent(SITE_WHATSAPP_MESSAGE)}`,
} as const;

export function getSiteWhatsAppHref(): string {
  return SITE_CONTACT.whatsappHref;
}

const SITE_MAIL_SUBJECT = 'Interesse na plataforma SimpleSST';

const SITE_MAIL_BODY = `Olá,

Visitei o site do SimpleSST e gostaria de receber mais informações sobre a plataforma.

Por favor, entrem em contato para que eu possa entender melhor como o sistema pode atender minha necessidade.

Nome:
Empresa:
Cargo/Função:
Telefone:

Tenho interesse principalmente em:

( ) GRO/PGR
( ) Gestão completa de SST
( ) Fatores de Riscos Psicossociais
( ) Laudos e programas — LTCAT, Insalubridade, Periculosidade, PCA, PPR
( ) Ordens de Serviço
( ) Absenteísmo
( ) Aplicativo mobile para coleta de evidências em campo
( ) Outro: ______________________

Fico no aguardo.

Atenciosamente,
`;

export function getSiteMailtoHref(): string {
  const subject = encodeURIComponent(SITE_MAIL_SUBJECT);
  const body = encodeURIComponent(SITE_MAIL_BODY.replace(/\n/g, '\r\n'));
  return `mailto:${SITE_CONTACT.email}?subject=${subject}&body=${body}`;
}
