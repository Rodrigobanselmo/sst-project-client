import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * A geração do PDF de gráficos foi movida para o navegador
 * (`exportFormChartsPdfInBrowser` + botão na tela de resultados), pois
 * `renderToStream` + múltiplas chamadas à API estouravam timeout em serverless.
 *
 * Mantemos a rota com 410 para URLs antigas / integrações obsoletas.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  return res.status(410).json({
    code: 'FORM_CHARTS_PDF_CLIENT_ONLY',
    message:
      'A exportação de PDF dos gráficos é feita no navegador. Use o botão "Exportar PDF (Gráficos)" na tela de resultados do formulário.',
  });
}
