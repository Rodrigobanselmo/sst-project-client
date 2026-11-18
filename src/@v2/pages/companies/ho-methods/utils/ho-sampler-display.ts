/** Shared presentation identity. Source records retain laboratory-specific setups. */
const standardSamplers = [
  {
    code: '226-17-1A',
    alias: /^(?:tubo\s+(?:de\s+)?)?Hopcalite(?:\s+de)?\s*200\s*mg$/i,
    short: 'Anasorb C300 200 mg',
    full: [
      'SKC 226-17-1A — Anasorb C300 Sorbent Tube.',
      'Tubo sorvente com uma seção de 200 mg, dimensões de 6 mm de diâmetro externo × 70 mm de comprimento e granulometria de 20/40 mesh.',
      'Extremidades seladas em vidro (GS); sorvente retido entre tampões de lã de vidro (WW); protetor de tubo tipo A.',
      'O NIOSH 6009 para mercúrio descreve Hopcalite de 200 mg em seção única e cita o SKC 226-17-1A ou equivalente. O catálogo atual da SKC denomina o sorvente desse código Anasorb C300; a descrição original Hopcalite é preservada abaixo.',
      'Quando a origem informa apenas Hopcalite 200 mg, o código é uma referência técnica adotada pelo sistema; a marca efetivamente fornecida pelo laboratório não foi confirmada. Não se acrescenta pré-filtro ou cassete à montagem sem indicação do laboratório ou do método aplicado.',
      'Fontes: SKC — https://skcinc.com/knowledge-center/model/detail/id/365/',
      'SKC — https://www.skcinc.com/media/catalog/2024-25-skc-international-catalog.pdf',
      'NIOSH 6009 — https://www.cdc.gov/niosh/docs/2003-154/pdfs/6009.pdf',
    ].join('\n'),
  },
  {
    code: '225-9004',
    alias:
      /^Cassete\s+2\s*[x×]\s*(?:Fibra de Vidro|FV)\s*[-·–]\s*1\s*[µμu]m\s*[-·–]\s*[ÁA]cido Sulf[úu]rico$/i,
    short: 'Cassete 2 × FV 1 µm · H₂SO₄',
    full: [
      'SKC 225-9004 — Coated Filter Cassette, Glass Fiber A/E coated with sulfuric acid.',
      'Conjunto pré-carregado com dois filtros de fibra de vidro tratados com ácido sulfúrico, sem suporte, em cassete de poliestireno de 37 mm, de três peças, com banda de vedação.',
      'A indicação 2 × corresponde a dois filtros no mesmo cassete, não a dois cassetes em série.',
      'A porosidade de 1 µm foi preservada da especificação do laboratório; as fontes SKC consultadas identificam filtros de fibra de vidro A/E, sem explicitar essa porosidade na descrição do conjunto.',
      'O código é uma referência técnica adotada pelo sistema; a marca e a montagem efetivamente fornecidas pelo laboratório não foram confirmadas.',
      'Fonte: SKC — https://skcinc.com/coated-filter-cassette-glass-fiber-ae-coated-w-sulfuric-acid-w-o-support-pad-37mm-3-piece-traditional-style-styrene-cassette-banded-10pk-225-9004',
    ].join('\n'),
  },
  {
    code: '226-35-03',
    alias: /$^/,
    short: 'Tenax TA 100/50',
    full: [
      'SKC 226-35-03 — Tenax TA Sorbent Tube.',
      'Tubo sorvente de Tenax TA com duas seções: 100 mg na seção principal e 50 mg na seção de retaguarda. Dimensões: diâmetro externo de 8 mm × comprimento de 110 mm.',
      'Extremidades seladas em vidro (GS); separadores de lã de vidro / lã de vidro / lã de vidro (WWW); protetor de tubo tipo B.',
      'A descrição do laboratório informa Tenax GC-100/50. O catálogo oficial da SKC identifica este código como Tenax TA; o nome padronizado segue o fabricante e a descrição original é preservada abaixo, sem presumir equivalência entre Tenax GC e Tenax TA.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/tenax-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '225-9018',
    alias:
      /^Cassete\s+(?:Fibra de Vidro|FV)\s*\+\s*\(?Poli[ée]ster\s*[-·–]\s*Cloreto de Merc[úu]rio\)?$/i,
    short: 'Cassete FV + poliéster/HgCl₂ · 37 mm',
    full: [
      'SKC 225-9018 — Preloaded Coated Filters.',
      'Cassete de 37 mm, de três peças, pré-carregado com um filtro de fibra de vidro sem tratamento e um filtro de poliéster tratado com cloreto de mercúrio(II) (HgCl₂). Coleta em face fechada.',
      'Aplicação indicada pela SKC: fosfina pelo método OSHA 1003. Conjunto fornecido montado, com tampões e bandas de vedação.',
      'Conforme instrução SKC 40047 Rev. 1810: antes da coleta, conservar a até 4 °C por até 3 meses; após a coleta, conservar a até 4 °C ou a 22 °C por até 17 dias.',
      'O tratamento com cloreto de mercúrio é aplicado ao filtro de poliéster; o filtro de fibra de vidro não é tratado. Não confundir com o cassete de fibra de vidro tratado com acetato de mercúrio.',
      'Quando a origem informa somente a combinação de filtros e reagente, o código é uma referência técnica adotada pelo sistema; a marca e a montagem efetivamente fornecidas pelo laboratório não foram confirmadas.',
      'Fonte: SKC — https://www.skc-asia.com/catalog/pdf/instructions/40047.pdf',
    ].join('\n'),
  },
  {
    code: '226-119',
    alias: /$^/,
    short: 'TSG 300/150 · DNPH',
    full: [
      'SKC 226-119 — Silica Gel, high purity, ultra-low background, treated with 2,4-dinitrophenylhydrazine (DNPH).',
      'Tubo sorvente de sílica gel de alta pureza e fundo analítico ultrabaixo, tratada com 2,4-dinitrofenil-hidrazina (DNPH), com duas seções: 300 mg na seção principal e 150 mg na seção de retaguarda.',
      'Dimensões: diâmetro externo de 6 mm × comprimento de 110 mm; granulometria de 20/40 mesh.',
      'Não confundir com a variante SKC 226-119-7, de diâmetro externo de 7 mm.',
      'Fonte: SKC — https://skcinc.com/sorbent-tube-silica-gel-high-purity-ultra-low-background-treated-w-24-dinitrophenylhydrazine-6-x-110-mm-size-2-sections-300-150-mg-sorbent-20-40-mesh-20pk-226-119',
    ].join('\n'),
  },
  {
    code: '225-9007',
    alias:
      /^Cassete\s+(?:Fibra de Vidro|FV)\s*[-·–]\s*Acetato de Merc[úu]rio$/i,
    short: 'Cassete FV 37 mm · acetato de mercúrio',
    full: [
      'SKC 225-9007 — Preloaded Coated Filters.',
      'Filtro de fibra de vidro tratado com acetato de mercúrio(II) (acetato mercúrico), pré-montado em cassete de 37 mm, de duas seções, para coleta em face fechada.',
      'Conjunto fornecido com tampões e bandas de vedação, pronto para uso.',
      'Aplicações indicadas pela SKC: OSHA 26 para metilmercaptana; NIOSH 2542 para metil-, etil- e n-butilmercaptanas; OSHA PV2075 para fenilmercaptana.',
      'Antes da coleta: armazenar a até 4 °C por até 8 meses. Após a coleta: conservar a até 4 °C por até 15 dias, conforme instrução SKC 40036 Rev. 211118.',
      'Quando a origem informa somente fibra de vidro e acetato de mercúrio, o código é uma referência técnica adotada pelo sistema; marca, diâmetro e versão efetivamente fornecidos pelo laboratório não foram confirmados.',
      'Fonte: SKC — https://www.skcinc.com/media/documents/KnowledgeCenter/Technical%20Information/Product%20Publications/Operating%20Instructions/Preloaded%20Coated%20Filters%20225-9007%20OI.pdf',
    ].join('\n'),
  },
  {
    code: '226-30',
    alias:
      /^(?:(?:tubo(?: de resina)?|resina)\s+)?XAD[-\s]*2(?:\s+de)?[-\s]*80\s*\/\s*40(?:\s*mg)?$/i,
    short: 'XAD-2 80/40',
    full: [
      'SKC 226-30 — XAD-2 Sorbent Tube.',
      'Tubo sorvente de resina XAD-2, polímero orgânico poroso hidrofóbico, com duas seções: 80 mg na seção principal e 40 mg na seção de retaguarda.',
      'Dimensões: diâmetro externo de 7 mm × comprimento de 70 mm.',
      'Extremidades seladas em vidro (GS); separadores de lã de vidro / lã de vidro / lã de vidro (WWW); protetor de tubo tipo B.',
      'Esta referência corresponde à resina sem tratamento indicado no catálogo. Não confundir com o SKC 226-30-18, que utiliza XAD-2 80/40 tratada com naftilisotiocianato.',
      'Quando a origem informa somente a resina e as massas, o código é uma referência técnica adotada pelo sistema; a marca efetivamente utilizada pelo laboratório não foi confirmada.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/xad-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '226-57',
    alias: /$^/,
    short: 'OVS XAD-7 200/100 · fibra de vidro',
    full: [
      'SKC 226-57 — OSHA Versatile Sampler (OVS), resina XAD-7 com filtro de fibra de vidro.',
      'Tubo de vidro com extremidades abertas, combinando filtro para aerossóis e duas seções de sorvente para vapores: 200 mg na seção principal e 100 mg na seção de retaguarda.',
      'Componentes/separadores indicados pela SKC: espuma / espuma / filtro de fibra de vidro / anel de PTFE (FFGT).',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/osha-versatile-sampler-ovs-tubes.html',
    ].join('\n'),
  },
  {
    code: '225-9006',
    alias: /^Cassete\s+PTFE\s*\+\s*(?:Filtro de )?Prata$/i,
    short: 'Cassete PTFE + prata · 25 mm',
    full: [
      'SKC 225-9006 — cassete pré-carregado com pré-filtro de PTFE e membrana de prata especialmente limpa, ambos com suporte plástico poroso, diâmetro de 25 mm.',
      'Conjunto indicado pela SKC para coleta de bromo e cloro pelo método NIOSH 6011.',
      'O código corresponde ao conjunto montado; PTFE é o material do pré-filtro, não do corpo do cassete. O corpo é preto, de plástico condutivo.',
      'A página atual da SKC Inc. identifica cassete de duas seções; o catálogo SKC Ltd. descreve três seções. Conferir a versão fornecida e as instruções do conjunto, sem deduzir a quantidade de seções a partir da descrição genérica do laboratório.',
      'Quando a origem informa somente Cassete PTFE + Filtro de Prata, o código é uma referência técnica adotada pelo sistema; marca, diâmetro e versão efetivamente fornecidos pelo laboratório não foram confirmados.',
      'Fontes: SKC Inc. — produto 225-9006; SKC Ltd. — Silver Membrane Filters.',
      'https://skcinc.com/coated-filter-cassette-1-ptfe-pre-filter-1-specially-cleaned-silver-membrane-w-porous-polyethylene-support-25mm-2-piece-black-conductive-goblet-style-cassette-banded-5pk-225-9006',
      'https://www.skcltd.com/products2/filters-cassettes/silver-membrane-filters.html',
    ].join('\n'),
  },
  {
    code: '226-95',
    alias:
      /^(?:(?:tubo(?: de resina)?|resina)\s+)?XAD[-\s]*7[-\s]*100\s*\/\s*50(?:\s*mg)?$/i,
    short: 'XAD-7 100/50',
    full: [
      'SKC 226-95 — XAD-7 Sorbent Tube.',
      'Tubo sorvente de resina XAD-7 sem impregnação indicada no catálogo, com duas seções: 100 mg na seção principal e 50 mg na seção de retaguarda.',
      'Dimensões: diâmetro externo de 6 mm × comprimento de 110 mm.',
      'Extremidades seladas em vidro (GS); separadores de lã de vidro / lã de vidro / lã de vidro (WWW); protetor de tubo tipo B.',
      'Não confundir com o SKC 226-96, que contém XAD-7 100/50 mg tratada com cloreto de NBD.',
      'Quando a origem informa somente XAD-7 100/50, o código é uma referência técnica adotada pelo sistema; a marca efetivamente utilizada pelo laboratório não foi confirmada.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/xad-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '225-321',
    alias: /$^/,
    short: 'Cassete condutivo MCE 25 mm · 0,8 µm',
    full: [
      'SKC 225-321 — BestChek® Asbestos Cassette.',
      'Cassete pré-carregado de polipropileno preto condutivo, com filtro de membrana de ésteres mistos de celulose (MCE) de 25 mm e porosidade de 0,8 µm, incluindo suporte de celulose.',
      'Montado com prolongador de entrada (cowl) e banda de vedação; configuração destinada à análise de fibras por microscopia de contraste de fase (PCM).',
      'O código identifica o conjunto cassete + filtro + suporte, não somente a membrana.',
      'Fonte: SKC — catálogo global 2024–2025, seção BestChek Asbestos Cassettes.',
      'https://www.skcltd.com/images/pdfs/2024-2025-skc-global-catalogue-web.pdf',
    ].join('\n'),
  },
  {
    code: '226-82',
    alias: /^(?:2\s*[x×]\s*)?Anasorb\s+747[-\s]*400\s*\/\s*200(?:\s*mg)?$/i,
    short: 'Anasorb 747 · 400 + 200 mg · 2 tubos em série',
    full: [
      'SKC 226-82 — Anasorb® 747, conjunto de dois tubos em série.',
      'Sorvente de carbono sintético com baixo teor de cinzas.',
      'O conjunto contém dois tubos separados, cada um com uma única seção: um tubo com 400 mg e outro com 200 mg. Não são dois tubos com 400/200 mg cada.',
      'Dimensões de cada tubo: diâmetro externo de 8 mm × comprimento de 110 mm. Extremidades seladas em vidro; separadores de espuma e lã de vidro (FW); protetor tipo D.',
      'Montagem em série: tubo de 400 mg seguido pelo tubo de 200 mg no sentido do fluxo, conforme o método aplicável.',
      'A expressão do laboratório “2 x Anasorb 747-400/200” é apresentada como o conjunto de dois tubos do código 226-82. Não confundir com o SKC 226-83, que reúne 400/200 mg em duas seções de um único tubo.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/anasorb-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '226-30-08',
    alias: /^Anasorb\s+708\s+(?:de\s+)?100\s*mg$/i,
    short: 'Anasorb 708 100 mg',
    full: [
      'SKC 226-30-08 — Anasorb® 708 Sorbent Tube',
      'Tubo sorvente com uma única seção de 100 mg de Anasorb 708, equivalente a Chromosorb 108 segundo a SKC.',
      'Dimensões de cada tubo: diâmetro externo de 6 mm × comprimento de 70 mm.',
      'Extremidades seladas em vidro; separadores de lã de vidro; protetor tipo A.',
      'O código corresponde a um tubo individual. Quando a descrição do laboratório indicar dois tubos em série, utilizar dois tubos de 100 mg cada; não se trata de duas seções dentro de um único tubo.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/anasorb-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '226-30-04',
    alias:
      /^(?:(?:tubo(?: de resina)?|resina)\s+)?XAD[-\s]*2[-\s]*100\s*\/\s*50(?:\s*mg)?$/i,
    short: 'XAD-2 100/50',
    full: [
      'SKC 226-30-04 — XAD-2 Sorbent Tube',
      'Tubo sorvente de resina XAD-2, polímero orgânico poroso hidrofóbico.',
      'Duas seções: 100 mg na seção principal e 50 mg na seção de retaguarda.',
      'Dimensões: diâmetro externo de 8 mm × comprimento de 110 mm.',
      'Extremidades seladas em vidro; separadores de lã de vidro; protetor de tubo tipo B.',
      'Quando a origem informa somente XAD-2 100/50, o código é uma referência técnica adotada pelo sistema; a marca efetivamente utilizada pelo laboratório não foi confirmada.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/xad-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '225-7',
    alias: /$^/,
    short: 'FV AE 37 mm · 1 µm',
    full: [
      'SKC 225-7 — Glass Fibre Depth Filter, Type AE',
      'Filtro de profundidade de fibra de vidro borossilicato, tipo AE, sem aglutinante.',
      'Diâmetro: 37 mm. Porosidade nominal: 1,0 µm. Espessura: 310–350 µm.',
      'Fornecido sem suporte. O código identifica o filtro base; não comprova tratamento com ácido sulfúrico.',
      'Fonte: SKC — https://www.skc-asia.com/products/product/89-glass-fibre-depth-filters',
    ].join('\n'),
  },
  {
    code: '225-2250',
    alias: /$^/,
    short: 'Cassete 37 mm · 2 seções',
    full: [
      'SKC 225-2250 — Cassette Blank, 2-Piece, 37-mm, Clear Styrene',
      'Cassete vazio de estireno transparente, com duas seções, diâmetro de 37 mm.',
      'Fonte: SKC — https://www.skc-asia.com/products/product/98-cassette-blanks/category_pathway-16',
    ].join('\n'),
  },
  {
    code: '225-5',
    alias: /$^/,
    short: 'MCE 37 mm · 0,8 µm',
    full: [
      'SKC 225-5 — Mixed Cellulose Ester (MCE) Membrane Filter',
      'Filtro de membrana de ésteres mistos de celulose (acetato e nitrato de celulose), diâmetro de 37 mm e porosidade de 0,8 µm, fornecido com suporte.',
      'Fonte: SKC — https://www.skcltd.com/products2/filters-cassettes/mixed-cellulose-ester-mce-membrane-filters.html',
    ].join('\n'),
  },
  {
    code: '226-01',
    alias: /\bTCA[-\s]*100\s*\/\s*50\b/i,
    short: 'TCA 100/50',
    full: [
      'SKC 226-01 — Anasorb® CSC (Coconut Shell Charcoal)',
      'Tubo sorvente de carvão ativado de casca de coco.',
      'Dimensões: 6 × 70 mm.',
      'Duas seções de sorvente: 100 mg na seção principal e 50 mg na seção de retaguarda.',
      'Granulometria: 20/40 mesh.',
      'Extremidades seladas em vidro.',
      'Separadores: lã de vidro / espuma / espuma.',
      'Fonte: SKC — https://skcinc.com/tubes-sorbent-ansb-csc-50pk-226-01',
    ].join('\n'),
  },
  {
    code: '226-58',
    alias:
      /^(?=.*\b(?:OVS[-\s]*2|XAD[-\s]*2)\b)(?=.*\b270\s*\/\s*140\b)(?=.*(?:quartzo|quartz)).*$/i,
    short: 'OVS XAD-2 270/140 · quartzo',
    full: [
      'SKC 226-58 — XAD-2/Quartz Filter (OVS)',
      'Tubo OVS com filtro de fibra de quartzo para retenção de aerossóis e resina XAD-2 para adsorção de vapores.',
      'Duas seções de sorvente: 270 mg na seção principal e 140 mg na seção de retaguarda.',
      'Dimensões no catálogo global SKC 2024–2025: diâmetro externo de 13 para 8 mm e comprimento de 75 mm.',
      'Extremidades abertas em vidro (GO).',
      'Componentes/separadores: espuma / espuma / filtro de quartzo / anel de PTFE (FFQT).',
      'Suporte de tubo: tipo V (OVS).',
      'Fonte: SKC — catálogo global 2024–2025.',
      'https://www.skcinc.com/media/catalog/2024-25-skc-international-catalog.pdf',
    ].join('\n'),
  },
  {
    code: '225-9002',
    // A generic 1-mg coating is not an alias: SKC assigns that to 225-9013.
    alias: /$^/,
    short: 'Cassete FV 37 mm · 1-2PP 2 mg',
    full: [
      'SKC 225-9002 — Preloaded Coated Filters',
      'Cassete de três seções, de 37 mm, com filtro de fibra de vidro e suporte de celulose, tratado com 2,0 mg de 1-(2-piridil)piperazina (1-2PP).',
      'Fornecido pré-montado, com tampões e bandas de vedação.',
      'Configuração de coleta: face aberta (open-face); remover o tampão de saída e a seção de entrada do cassete, conforme as instruções do fabricante.',
      'Antes da coleta: conservar a até 4 °C, por até seis meses.',
      'O SKC 225-9002 utiliza 2,0 mg de reagente; a versão com 1,0 mg é o SKC 225-9013.',
      'Fonte: SKC — instruções 40031 Rev. 1710; boletim 1219 Rev. 1901.',
      'https://www.skc-asia.com/catalog/pdf/instructions/40031.pdf',
      'https://www.skcltd.com/images/pdfs/1219.pdf',
    ].join('\n'),
  },
  {
    code: '226-96',
    alias:
      /^(?=.*\bXAD[-\s]*7\b)(?=.*\b100\s*\/\s*50\b)(?=.*(?:cloreto de NBD|NBD.? chloride)).*$/i,
    short: 'XAD-7 100/50 · cloreto de NBD',
    full: [
      'SKC 226-96 — XAD-7 ([NBD] Chloride)',
      'Tubo sorvente de resina XAD-7 tratada com cloreto de NBD.',
      'Dimensões: 8 × 110 mm.',
      'Duas seções de sorvente: 100 mg na seção principal e 50 mg na seção de retaguarda.',
      'Extremidades seladas em vidro.',
      'Separadores: lã de vidro / lã de vidro / lã de vidro.',
      'Protetor de tubo: tipo B.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/xad-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '226-98',
    alias:
      /^(?=.*\bXAD[-\s]*7\b)(?=.*\b(?:80\s*\/\s*40|40\s*\/\s*80)\b)(?=.*(?:[áa]cido fosf[óo]rico|phosphoric acid|H3PO4)).*$/i,
    short: 'XAD-7 80/40 · ácido fosfórico',
    full: [
      'SKC 226-98 — XAD-7 (Phosphoric acid)',
      'Tubo sorvente de resina XAD-7 tratada com ácido fosfórico.',
      'Dimensões: 6 × 70 mm.',
      'Duas seções de sorvente: 80 mg na seção principal e 40 mg na seção de retaguarda.',
      'Extremidades seladas em vidro.',
      'Separadores: lã de vidro / lã de vidro / lã de vidro.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/xad-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '226-37',
    alias: /$^/,
    short: 'TCA 400 + 200 mg (2 tubos)',
    full: [
      'SKC 226-37 — Anasorb® CSC (Coconut Shell Charcoal)',
      'Conjunto de dois tubos sorventes de carvão ativado de casca de coco.',
      'Um tubo com 400 mg e outro com 200 mg de sorvente; cada tubo possui uma única seção.',
      'Dimensões de cada tubo: 8 × 110 mm.',
      'Extremidades seladas em vidro.',
      'Separadores: espuma e lã de vidro.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/charcoal-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '226-09',
    alias: /\bTCA[-\s]*400\s*\/\s*200\b/i,
    short: 'TCA 400/200',
    full: 'Tubo de carvão ativado de duas seções: 400 mg na seção principal e 200 mg na seção de retaguarda.',
  },
  {
    code: '226-10',
    alias: /\bTSG[-\s]*150\s*\/\s*75\b/i,
    short: 'TSG 150/75',
    full: [
      'SKC 226-10 — Silica Gel Sorbent Tube.',
      'Tubo sorvente de sílica gel, com duas seções: 150 mg na seção principal e 75 mg na seção de retaguarda.',
      'Dimensões: diâmetro externo de 6 mm × comprimento de 70 mm.',
      'Extremidades seladas em vidro (GS); separadores de espuma / lã de vidro / lã de vidro (FWW); protetor de tubo tipo A.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/silica-gel-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '226-10-03',
    alias: /\bTSG[-\s]*400\s*\/\s*200\b/i,
    short: 'TSG 400/200',
    full: [
      'SKC 226-10-03 — Silica Gel (specially cleaned)',
      'Tubo sorvente de sílica gel especialmente limpa, com duas seções: 400 mg na seção principal e 200 mg na seção de retaguarda.',
      'Dimensões: diâmetro externo de 7 mm × comprimento de 110 mm.',
      'Extremidades seladas em vidro; protetor tipo B.',
      'Separadores WWGW: lã de vidro / lã de vidro / filtro de fibra de vidro / lã de vidro.',
      'Quando associado a um cassete na descrição de origem, o código identifica somente o tubo. O cassete adicional não é identificado por este código.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/silica-gel-sorbent-tubes.html',
    ].join('\n'),
  },
  {
    code: '226-51',
    alias: /\bTSG[-\s]*100\s*\/\s*50\b/i,
    short: 'TSG 100/50',
    full: [
      'SKC 226-51 — Silica Gel Sorbent Tube',
      'Tubo sorvente de sílica gel com duas seções: 100 mg na seção principal e 50 mg na seção de retaguarda.',
      'Dimensões: diâmetro externo de 6 mm × comprimento de 70 mm.',
      'Extremidades seladas em vidro; protetor de tubo tipo A.',
      'Separadores FWW: espuma / lã de vidro / lã de vidro.',
      'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/silica-gel-sorbent-tubes.html',
    ].join('\n'),
  },
];

export function samplerDisplay(
  name?: string | null,
  description?: string | null,
) {
  const source = name?.trim() || '';
  if (/^XAD[-\s]*7[-\s]*80\s*\/\s*40(?:\s*mg)?$/i.test(source)) {
    return {
      code: '—',
      description: 'XAD-7 80/40',
      tooltip: [
        'Tubo de resina XAD-7 com duas seções de 80 mg e 40 mg, conforme descrição do laboratório. Tratamento químico, dimensões e fabricante não informados.',
        'O SKC 226-98 contém XAD-7 80/40 mg tratada com ácido fosfórico. A descrição genérica XAD7-80/40 não permite confirmar esse tratamento; por isso, esse código não foi atribuído automaticamente.',
        'A referência XAD-7 sem tratamento identificada no catálogo SKC utiliza outras massas, como 60/30 mg (226-94) e 100/50 mg (226-95). Mantidas as massas de 80/40 mg informadas pelo laboratório, sem substituição de sorvente ou tratamento.',
        'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/xad-sorbent-tubes.html',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (/226[-\s]*09\b/i.test(source) && /225[-\s]*17[-\s]*04\b/i.test(source)) {
    return {
      code: 'SKC 226-09; SKC 225-17-04',
      description: 'PTFE 37 mm · 0,45 µm → TCA 400/200',
      tooltip: [
        'Ordem da montagem informada pelo laboratório, no sentido do fluxo de ar: filtro de PTFE de 37 mm e 0,45 µm montado em cassete com suporte de plástico poroso → tubo de carvão ativado 400/200 mg → bomba.',
        'SKC 225-17-04 — membrana de PTFE de 37 mm e porosidade de 0,45 µm, com suporte laminado de polipropileno. O código identifica o filtro com suporte, não o cassete completo; o código e a quantidade de peças do cassete não foram informados.',
        'SKC 226-09 — Anasorb CSC (carvão ativado de casca de coco), duas seções de 400 mg e 200 mg, tubo de 8 × 110 mm, granulometria de 20/40 mesh, extremidades seladas em vidro, separadores espuma/lã de vidro/lã de vidro e protetor tipo B.',
        'São componentes complementares de uma montagem: um filtro precedendo um tubo de duas seções. Não são dois tubos em série. A ordem foi preservada da orientação do laboratório, independentemente da ordem dos códigos na coluna.',
        'Fontes: SKC — https://skcinc.com/filter-ptfe-w-laminated-pp-support-0-45-m-37mm-100pk-225-17-04',
        'SKC — https://www.skcltd.com/images/pdfs/SKC-Global-Catalogue-2020-21.pdf',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /^impinger\s+(?:com|contendo)\s+15\s*ml\s+de\s+dimetilftalato$/i.test(
      source,
    )
  ) {
    return {
      code: 'SKC 225-36-1',
      description: 'Impinger · dimetilftalato 15 mL',
      tooltip: [
        'Líquido de coleta informado pelo laboratório: 15 mL de dimetilftalato (ftalato de dimetila). O líquido é preparado ou fornecido pelo laboratório e não acompanha necessariamente o frasco.',
        'Referência técnica do frasco: SKC 225-36-1 — Glass Midget Impinger, 25 mL, Standard Nozzle: impinger de vidro, capacidade de 25 mL, com bico padrão.',
        'Os 15 mL correspondem ao volume de líquido no frasco, não ao volume de ar coletado. Vazão e volume de ar seguem o método e a estratégia de amostragem. Pureza ou diluição não foram informadas nesta descrição.',
        'O laboratório pode fornecer o impinger de outro fabricante ou montagem própria. A referência SKC não confirma a marca, capacidade ou geometria do frasco efetivamente utilizado.',
        'Fonte do frasco de referência: SKC — https://skcinc.com/midget-impinger-glass-25-ml-standard-nozzle-225-36-1',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /dois filtros|2\s*[x×]?\s*filtros/i.test(source) &&
    /fibra de vidro/i.test(source) &&
    /25\s*mm/i.test(source) &&
    /1\s*[µμu]m/i.test(source) &&
    /oxisulfato de tit[âa]nio/i.test(source)
  ) {
    return {
      code: '—',
      description: '2 × FV 25 mm · 1 µm · TiOSO₄',
      tooltip: [
        'Configuração informada pelo laboratório: dois filtros de fibra de vidro de 25 mm e porosidade de 1 µm, juntos, impregnados com solução de oxisulfato de titânio. A quantidade corresponde a dois filtros, não a dois cassetes ou tubos em série.',
        'Referência citada pelo laboratório: artigo sobre amostragem simultânea de ácido peracético e peróxido de hidrogênio em ambiente de trabalho. A descrição não informa concentração da solução, código do produto ou configuração completa da coleta simultânea.',
        'Referência SKC relacionada: 225-9030, para peróxido de hidrogênio pelo OSHA 1019, contém dois filtros de QUARTZO R-100 tratados com oxisulfato de titânio(IV) hidratado, em cassete de poliestireno de 25 mm, de duas peças, sem suporte.',
        'A composição SKC difere da fibra de vidro de 1 µm informada pelo laboratório. Por isso, o código 225-9030 não foi atribuído como identidade desta montagem, nem o material foi substituído automaticamente. Não se presume que esses filtros, isoladamente, constituam a montagem completa para coleta de ácido peracético.',
        'Fonte: SKC — https://skcinc.com/media/knowledge/oi/preloaded-coated-filters-225-9030-oi-40056.pdf',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (/^Impinger\s*[-–—·]\s*[ÁA]cido hexanossulf[ôo]nico$/i.test(source)) {
    return {
      code: 'SKC 225-36-1',
      description: 'Impinger · ácido hexanossulfônico',
      tooltip: [
        'Líquido de coleta informado pelo laboratório: solução de ácido hexanossulfônico (HSA). Volume e concentração não informados nesta descrição; a solução é preparada ou fornecida pelo laboratório.',
        'Referência técnica do frasco: SKC 225-36-1 — Glass Midget Impinger, 25 mL, Standard Nozzle: impinger de vidro, capacidade de 25 mL, com bico padrão.',
        'Referência de consulta: o NIOSH 3509 para aminoetanóis descreve impinger com 15 mL de HSA 2 mmol/L. Esses valores não foram atribuídos automaticamente ao cadastro do laboratório nem usados para definir vazão ou volume de ar.',
        'O laboratório pode fornecer o impinger de outro fabricante ou montagem própria. A referência SKC não confirma a marca, capacidade ou geometria do frasco efetivamente utilizado.',
        'Fontes: SKC — https://skcinc.com/midget-impinger-glass-25-ml-standard-nozzle-225-36-1',
        'NIOSH 3509 — https://www.cdc.gov/niosh/docs/2003-154/pdfs/3509.pdf',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /impinger/i.test(source) &&
    /10\s*m[lL]\b/.test(source) &&
    /[áa]cido sulf[úu]rico/i.test(source) &&
    /0[,.]05\s*M\b/.test(source) &&
    !/s[ée]rie|\b[23]\s*impingers?/i.test(source)
  ) {
    return {
      code: 'SKC 225-36-1',
      description: 'Impinger · H₂SO₄ 0,05 M · 10 mL',
      tooltip: [
        'Líquido de coleta informado pelo laboratório: 10 mL de solução de ácido sulfúrico (H₂SO₄) 0,05 mol/L. A solução é preparada ou fornecida pelo laboratório e não acompanha necessariamente o frasco.',
        'Referência técnica do frasco: SKC 225-36-1 — Glass Midget Impinger, 25 mL, Standard Nozzle: impinger de vidro, capacidade de 25 mL, com bico padrão.',
        'Os 10 mL correspondem ao volume de solução no frasco, não ao volume de ar coletado. Vazão e volume de ar seguem o método e a estratégia de amostragem.',
        'O laboratório pode fornecer o impinger de outro fabricante ou montagem própria. A referência SKC não confirma a marca, capacidade ou geometria do frasco efetivamente utilizado.',
        'Fonte do frasco de referência: SKC — https://skcinc.com/midget-impinger-glass-25-ml-standard-nozzle-225-36-1',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /^(?:[—–-]\s*)?(?:bal[ãa]o|bolsa|saco)(?:\s+de)?\s+Tedlar\s*5\s*(?:L|litros?)$/i.test(
      source,
    ) ||
    /^(?:SKC\s*)?232[-\s]*05$/i.test(source)
  ) {
    return {
      code: 'SKC 232-05',
      description: 'Bolsa Tedlar 5 L',
      tooltip: [
        'SKC 232-05 — Tedlar Sample Bag, capacidade máxima de 5 litros, filme de Tedlar com espessura de 2 mil (aproximadamente 50,8 µm).',
        'Referência com conexão única de polipropileno, combinando entrada para mangueira/válvula e porta-septo.',
        'Quando a origem informa apenas Balão de Tedlar 5 L, o código é uma referência técnica adotada pelo sistema; fabricante e tipo de conexão efetivamente fornecidos pelo laboratório não foram confirmados. A SKC também oferece versões de 5 L com conexão de aço inoxidável (233-05) ou duas conexões de aço inoxidável (231-05).',
        'A capacidade máxima da bolsa não define automaticamente o volume de coleta ou a estratégia de amostragem.',
        'Fonte: SKC — https://www.skcltd.com/products-category/113-sample-bags.html',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /sem\s+(?:o\s+)?filtro/i.test(source) &&
    (/226[-\s]*30[-\s]*16\b/i.test(source) ||
      (/XAD[-\s]*2/i.test(source) &&
        /OVS/i.test(source) &&
        /270\s*\/\s*140/i.test(source)))
  ) {
    const orbo = /ORBO\s*49P/i.test(source);
    return {
      code: orbo ? 'SKC 226-30-16; Supelco 20350' : 'SKC 226-30-16',
      description: 'OVS-2 XAD-2 270/140 · sem filtro',
      tooltip: [
        'Orientação do laboratório: consultar MDHS para a coleta de particulado e utilizar a montagem de vapor sem o filtro. A descrição não informa a revisão MDHS nem identifica o cabeçote e o filtro de particulado.',
        'SKC 226-30-16 — OSHA Versatile Sampler (OVS-2), tubo com resina XAD-2, duas seções de 270 mg e 140 mg, originalmente fornecido com filtro de fibra de vidro embutido.',
        'Extremidades abertas em vidro; componentes/separadores de espuma / espuma / filtro de fibra de vidro / anel de PTFE (FFGT); suporte tipo V.',
        orbo
          ? 'Alternativa mencionada pelo laboratório: Supelco ORBO 49P (OVS), código 20350, com Supelpak-20 / XAD-2 de 270/140 mg e filtro de fibra de vidro na configuração original. Os códigos representam alternativas de fabricante, não dois tubos em série.'
          : '',
        'A orientação “sem o filtro” é uma configuração do laboratório que difere dos produtos originais completos. Foi preservada explicitamente; não se presume equivalência de coleta com o filtro instalado.',
        'Fontes: SKC — https://www.skcltd.com/products2/sorbent-tubes/osha-versatile-sampler-ovs-tubes.html',
        orbo
          ? 'Supelco — https://www.merckmillipore.com/IN/en/product/supelco/20350'
          : '',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    };
  }
  if (
    /impinger/i.test(source) &&
    /15\s*m[lL]/i.test(source) &&
    /iodeto de pot[áa]ssio/i.test(source) &&
    /0[,.]02\s*%/.test(source) &&
    /carbonato\s*\/\s*bicarbonato de s[óo]dio/i.test(source)
  ) {
    return {
      code: 'SKC 225-36-1',
      description: 'Impinger · KI 0,02% tamponado · 15 mL',
      tooltip: [
        'Líquido de coleta informado pelo laboratório: 15 mL de solução de iodeto de potássio (KI) a 0,02%, em solução tampão de carbonato/bicarbonato de sódio.',
        'Concentrações dos componentes do tampão e pH não especificados nesta descrição; seguir o método e as orientações do laboratório.',
        'Referência técnica do frasco: SKC 225-36-1 — Glass Midget Impinger, 25 mL, Standard Nozzle.',
        'Impinger de vidro, capacidade de 25 mL, com bico padrão. Coleta por borbulhamento do ar no líquido coletor, utilizando bomba de amostragem.',
        'Os 15 mL correspondem ao volume de solução colocado no frasco, não à capacidade do impinger. A solução é preparada ou fornecida pelo laboratório conforme o método e não acompanha necessariamente o frasco.',
        'O código SKC é uma referência técnica adotada pelo sistema; capacidade e tipo de bico não foram especificados na descrição original. Conferir a montagem exigida pelo método.',
        'O próprio laboratório pode fornecer o impinger, inclusive de outro fabricante; a referência SKC não confirma a marca do material fornecido.',
        'Fonte do frasco de referência: SKC — https://skcinc.com/midget-impinger-glass-25-ml-standard-nozzle-225-36-1',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /sem\s+(?:o\s+)?filtro/i.test(source) &&
    (/226[-\s]*57\b/i.test(source) ||
      (/XAD[-\s]*7/i.test(source) &&
        /OVS/i.test(source) &&
        /200\s*\/\s*100/i.test(source)))
  ) {
    return {
      code: 'SKC 226-57',
      description: 'OVS XAD-7 200/100 · sem filtro',
      tooltip: [
        'Configuração informada pelo laboratório: utilizar sem o filtro. Essa orientação difere da montagem original do SKC 226-57, que inclui filtro de fibra de vidro.',
        standardSamplers.find((item) => item.code === '226-57')!.full,
        'A descrição original menciona filtro de 13 mm e, ao final, “sem o filtro”. A indicação de retirada foi preservada; não se apresenta a montagem modificada como o produto original completo nem se presume equivalência de coleta com filtro.',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    };
  }
  if (/225[-\s]*70A\b/i.test(source) && /225[-\s]*8[-\s]*04\b/i.test(source)) {
    return {
      code: 'SKC 225-70A; SKC 225-8-04',
      description: 'IOM + filtro PVC 25 mm · 5 µm',
      tooltip: [
        'Montagem: filtro de PVC de 25 mm e porosidade de 5 µm, instalado no cassete reutilizável do amostrador IOM para coleta da fração inalável.',
        'SKC 225-70A — conjunto IOM em plástico condutivo, com cassete, clipe e tampa de transporte, conforme boletim SKC 1050.',
        'SKC 225-8-04 — filtro de policloreto de vinila (PVC), 25 mm, 5 µm, listado nas instruções SKC 37372 Rev. 0302 para uso no IOM.',
        'Os códigos identificam componentes complementares: conjunto IOM e filtro. Não representam dois amostradores em série.',
        'O boletim SKC 1050 Rev. 2002 apresenta o filtro PVC 25 mm de 5 µm com o código 225-5-25. Preservado o código 225-8-04 informado pelo laboratório e documentado na instrução anterior; não se presume substituição comercial entre os códigos.',
        'Não se acrescenta espuma MultiDust ou ciclone à montagem informada.',
        'Fontes: SKC — boletim 1050 e instrução 37372 Rev. 0302.',
        'https://www.skc-asia.com/catalog/pdf/instructions/1050.pdf',
        'https://device.report/m/bc16e2899846adbd23d14e810e3db773393f9389ef1f3d320a92e0521f2fb868.pdf',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (/225[-\s]*1930\b/i.test(source) && /225[-\s]*70A\b/i.test(source)) {
    return {
      code: 'SKC 225-1930; SKC 225-70A',
      description: 'IOM + filtro MCE 25 mm · 0,8 µm',
      tooltip: [
        'Montagem: filtro MCE de 25 mm e porosidade de 0,8 µm, colocado no cassete do amostrador IOM.',
        'SKC 225-1930 — filtro de membrana de ésteres mistos de celulose (acetato e nitrato de celulose), 25 mm, 0,8 µm; fornecido sem suporte de filtro.',
        'SKC 225-70A — amostrador IOM e cassete reutilizável em plástico condutivo, com clipe e tampa de transporte, destinado à coleta da fração inalável.',
        'Os códigos identificam componentes complementares da mesma montagem: o filtro e o conjunto IOM com cassete. Não representam dois amostradores em série.',
        'A montagem apresentada não inclui espuma seletora ou ciclone; não se deve inferir coleta da fração respirável sem essa especificação no método.',
        'Fontes: SKC — catálogo de filtros MCE e instruções do amostrador IOM.',
        'https://www.skcltd.com/products2/filters-cassettes/mixed-cellulose-ester-mce-membrane-filters.html',
        'https://skcinc.com/media/knowledge/oi/iom-personal-samplers-iom-samplers-with-multidust-oi-37372.pdf',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /2\s*impingers?/i.test(source) &&
    /s[ée]rie/i.test(source) &&
    /triclorofenol/i.test(source) &&
    /met[óo]xido de s[óo]dio/i.test(source)
  ) {
    return {
      code: 'SKC 225-36-1',
      description: '2 impingers em série · triclorofenol + metóxido de sódio',
      tooltip: [
        'Configuração informada pelo laboratório: dois impingers ligados em série, contendo solução de triclorofenol e metóxido de sódio.',
        'Volume, concentrações e distribuição da solução entre os frascos não especificados nesta descrição; seguir o método e as orientações do laboratório.',
        'Referência técnica de cada frasco: SKC 225-36-1 — Glass Midget Impinger, 25 mL, Standard Nozzle.',
        'Impinger de vidro, capacidade de 25 mL, com bico padrão. O código identifica um frasco individual; a montagem informada utiliza dois frascos em série.',
        'Coleta por borbulhamento do ar na solução coletora, utilizando bomba de amostragem. A solução é preparada ou fornecida pelo laboratório conforme o método e não acompanha necessariamente os frascos.',
        'O código SKC é uma referência técnica adotada pelo sistema; capacidade e tipo de bico não foram especificados na descrição original. Conferir a montagem exigida pelo método.',
        'O próprio laboratório pode fornecer os impingers, inclusive de outro fabricante; a referência SKC não confirma a marca do material fornecido.',
        'Fonte dos frascos de referência: SKC — https://skcinc.com/midget-impinger-glass-25-ml-standard-nozzle-225-36-1',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /^impinger\s+com\s+15\s*m[lL]\s+de\s+[áa]gua\s+destilada[.]?$/i.test(source)
  ) {
    return {
      code: 'SKC 225-36-1',
      description: 'Impinger · água destilada 15 mL',
      tooltip: [
        'Líquido de coleta informado pelo laboratório: 15 mL de água destilada. Seguir o método e as orientações do laboratório para o preparo e a utilização.',
        'Referência técnica: SKC 225-36-1 — Glass Midget Impinger, 25 mL, Standard Nozzle.',
        'Frasco impinger de vidro, capacidade de 25 mL, com bico padrão. Coleta por borbulhamento do ar no líquido coletor, utilizando bomba de amostragem.',
        'Os 15 mL correspondem ao volume de água destilada colocado no frasco, não à capacidade do impinger. O líquido de coleta é preparado ou fornecido pelo laboratório conforme o método e não acompanha necessariamente o frasco.',
        'O código SKC é uma referência técnica adotada pelo sistema; o tipo de bico não foi especificado na descrição original. Conferir a montagem exigida pelo método.',
        'O próprio laboratório pode fornecer o impinger, inclusive de outro fabricante; a referência SKC não confirma a marca do material fornecido.',
        'Fonte do frasco de referência: SKC — https://skcinc.com/midget-impinger-glass-25-ml-standard-nozzle-225-36-1',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /impinger/i.test(source) &&
    /10\s*m[lL]/i.test(source) &&
    /cloridrato de hidroxilamina/i.test(source) &&
    /hidr[óo]xido de s[óo]dio/i.test(source)
  ) {
    return {
      code: 'SKC 225-36-1',
      description: 'Impinger · hidroxilamina-HCl + NaOH · 10 mL',
      tooltip: [
        'Orientação do laboratório: usar no prazo de 2 horas. Preservar essa restrição na preparação e utilização da solução de coleta.',
        'Líquido de coleta informado pelo laboratório: 10 mL de solução de cloridrato de hidroxilamina e hidróxido de sódio (NaOH). Concentrações não especificadas nesta descrição; seguir o método e as orientações do laboratório.',
        'Referência técnica: SKC 225-36-1 — Glass Midget Impinger, 25 mL, Standard Nozzle.',
        'Frasco impinger de vidro, capacidade de 25 mL, com bico padrão. Coleta por borbulhamento do ar no líquido coletor, utilizando bomba de amostragem.',
        'Os 10 mL correspondem ao volume de solução colocado no frasco, não à capacidade do impinger. A solução é preparada ou fornecida pelo laboratório conforme o método e não acompanha necessariamente o frasco.',
        'O código SKC é uma referência técnica adotada pelo sistema; o tipo de bico não foi especificado na descrição original. Conferir a montagem exigida pelo método.',
        'O próprio laboratório pode fornecer o impinger, inclusive de outro fabricante; a referência SKC não confirma a marca do material fornecido.',
        'Fonte do frasco de referência: SKC — https://skcinc.com/midget-impinger-glass-25-ml-standard-nozzle-225-36-1',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /MDHS\s*14\s*\/\s*3/i.test(source) &&
    /impinger/i.test(source) &&
    /15\s*m[lL]/i.test(source) &&
    /isooctano/i.test(source)
  ) {
    return {
      code: 'SKC 225-36-1',
      description: 'Impinger · isooctano 15 mL',
      tooltip: [
        'Observação do laboratório: consultar MDHS 14/3 para a coleta de particulado. Essa referência não identifica o filtro ou o cabeçote; o código abaixo corresponde somente ao impinger, não à montagem completa.',
        'Referência técnica: SKC 225-36-1 — Glass Midget Impinger, 25 mL, Standard Nozzle.',
        'Frasco impinger de vidro, capacidade de 25 mL, com bico padrão. Coleta por borbulhamento do ar no líquido coletor, utilizando bomba de amostragem.',
        'Líquido de coleta informado pelo laboratório: 15 mL de isooctano. Esse volume é o conteúdo colocado no frasco, não sua capacidade. A solução é preparada ou fornecida pelo laboratório conforme o método e não acompanha necessariamente o impinger.',
        'O código SKC é uma referência técnica adotada pelo sistema; o tipo de bico não foi especificado na descrição original. Conferir a montagem exigida pelo método.',
        'O próprio laboratório pode fornecer o impinger, inclusive de outro fabricante; a referência SKC não confirma a marca do material fornecido.',
        'Fonte: SKC — https://skcinc.com/midget-impinger-glass-25-ml-standard-nozzle-225-36-1',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações adicionais do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (/^(?:OVM\s*3500\s*(?:\(3M\)|3M)?|3M\s*(?:OVM\s*)?3500)$/i.test(source)) {
    return {
      code: '3M 3500',
      description: 'OVM 3500 · passivo',
      tooltip: [
        '3M 3500 — Organic Vapor Diffusion Monitor (OVM).',
        'Monitor passivo por difusão para amostragem de determinados vapores orgânicos, com uma única pastilha adsorvente de carvão.',
        'Não utiliza bomba, mangueiras ou baterias. Pode ser utilizado na zona respiratória para amostragem pessoal ou em área com circulação de ar adequada.',
        'O modelo 3500 é destinado à análise pelo usuário ou por laboratório independente; não inclui análise pré-paga.',
        'A aplicabilidade, a taxa de captação e o tempo de exposição dependem do composto e das condições ambientais; seguir o guia de amostragem e análise da 3M. Não corresponde a uma vazão de bomba.',
        'Não confundir com o modelo 3500+ ou com o 3520, que possui duas pastilhas adsorventes.',
        'Fonte: 3M — https://multimedia.3m.com/mws/media/211130O/3m-organic-vapor-diffusion-monitor-3500-3510-and-3520-3530-brochure.pdf',
        `Descrição original do laboratório: ${source}`,
        description?.trim()
          ? `Observações do laboratório: ${description.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }
  if (
    /^Cassete\s+2\s*[x×]\s*Fibra de Vidro\s+1\s*[µμu]m\s*\/\s*carbonato de s[óo]dio$/i.test(
      source,
    )
  ) {
    return {
      code: 'SKC 225-9032',
      description: 'Cassete 2 filtros quartzo · Na₂CO₃',
      tooltip: [
        'Referência técnica SKC 225-9032 — Preloaded Coated Filters, NIOSH 7907.',
        'Cassete de 37 mm, três seções, pré-montado com tampões e bandas de vedação; coleta em face fechada.',
        'Dois filtros de quartzo R-100: um pré-filtro sem tratamento e um filtro tratado com carbonato de sódio (Na₂CO₃).',
        'Aplicações indicadas pela SKC: cloreto de hidrogênio, brometo de hidrogênio e ácido nítrico.',
        'Antes da coleta: armazenamento a 22 °C por até dois anos, conforme instrução do fabricante.',
        'Após a coleta: até sete dias a 22 °C; para armazenamento mais longo, até 28 dias a no máximo 4 °C, conforme instrução do fabricante.',
        'Nota da origem — laboratório: ' + source,
        ...(description?.trim()
          ? ['Descrição adicional da origem: ' + description.trim()]
          : []),
        'Diferença preservada: o laboratório informa fibra de vidro de 1 µm; a referência SKC utiliza quartzo R-100. O código foi adotado como referência técnica para o NIOSH 7907 e não confirma o produto efetivamente usado pelo laboratório nem equivalência integral entre os filtros.',
        'Fonte: SKC — instrução 40139 Rev. 211118.',
        'https://www.skcinc.com/media/documents/KnowledgeCenter/Technical%20Information/Product%20Publications/Operating%20Instructions/Preloaded%20Coated%20Filters%20225-9032%20OI.pdf',
      ].join('\n'),
    };
  }

  if (/^Cassete PVC\s+5(?:[,.]0)?\s*[µμu]m$/i.test(source)) {
    return {
      code: 'SKC 225-802 / 225-803',
      description: 'Cassete PVC 5 µm',
      tooltip: [
        'Referências técnicas SKC — cassetes pré-carregados com filtro de membrana de PVC GLA-5000, porosidade de 5,0 µm (micrômetros).',
        'SKC 225-802: diâmetro de 37 mm, cassete de estireno transparente com duas seções, suporte e banda de vedação.',
        'SKC 225-803: diâmetro de 37 mm, cassete de estireno transparente com três seções, suporte e banda de vedação.',
        'PVC é o material da membrana filtrante, não o material do cassete.',
        'Seleção da montagem: para ciclones SKC compatíveis, utilizar cassete de três seções, removendo a seção de entrada e conectando o ciclone ao anel central. A coleta em face aberta também pode exigir três seções; sem ciclone, verificar a configuração do método antes de optar por duas seções.',
        'Os códigos são referências técnicas possíveis de 37 mm. A descrição de origem não informa o diâmetro, o número de seções nem se o filtro é pré-pesado; não identifica um modelo único.',
        'O laboratório pode utilizar outra marca ou montagem própria; o fabricante efetivamente utilizado não foi confirmado. Confirmar a configuração prevista pelo método antes de selecionar o produto.',
        'Fonte: SKC — https://www.skcltd.com/products2/filters-cassettes/gla-5000-pvc-membrane-filters.html',
      ].join('\n'),
    };
  }

  if (
    /^Cassete PTFE\s*\+\s*Espa[çc]ador de Celulose\s*\+\s*XAD[-\s]*2[-\s]*100\s*\/\s*50$/i.test(
      source,
    ) ||
    /^Tubo XAD[-\s]*2 de 100\s*\/\s*50\s*mg com pr[ée]-filtro de PTFE$/i.test(
      source,
    )
  ) {
    const celluloseSupport = /celulose/i.test(source);
    return {
      code: 'SKC 226-30-04',
      description: celluloseSupport
        ? 'PTFE + suporte celulose + XAD-2 100/50'
        : 'PTFE + XAD-2 100/50',
      tooltip: [
        'Montagem de filtro de PTFE em cassete, seguido de tubo sorvente XAD-2 de 100/50 mg.',
        ...(celluloseSupport
          ? [
              'Suporte de celulose para o filtro, descrito na origem como “espaçador de celulose”.',
            ]
          : []),
        'Referência do tubo: SKC 226-30-04 — XAD-2, duas seções: 100 mg na seção principal e 50 mg na seção de retaguarda.',
        'Especificações do tubo SKC: diâmetro externo de 8 mm × comprimento de 110 mm; extremidades seladas em vidro; separadores de lã de vidro; protetor tipo B.',
        'O código SKC identifica somente o tubo sorvente, não o conjunto completo. PTFE identifica o filtro, não o material do cassete.',
        'A descrição do laboratório não informa o diâmetro e a porosidade do filtro nem os códigos do cassete e do suporte. Essas características devem seguir o método aplicável.',
        'Referência técnica adotada pelo sistema; a marca e o modelo efetivamente utilizados pelo laboratório não foram confirmados.',
        'Fonte: SKC — https://www.skcltd.com/products2/sorbent-tubes/xad-sorbent-tubes.html',
      ].join('\n'),
    };
  }

  if (
    /^(?:tubo(?: de)?\s+)?peneiras? moleculares? de carv[aã]o(?: de)?\s+160\s*\/\s*80\s*mg[.]?$/i.test(
      source,
    ) ||
    /^(?:Supelco\s+)?(?:20362|ORBO[-\s]*92(?:\s*[·—–-]\s*(?:CMS\s*)?160\s*\/\s*80\s*mg)?)$/i.test(
      source,
    )
  ) {
    return {
      code: 'Supelco 20362',
      description: 'ORBO 92 · CMS 160/80 mg',
      tooltip: [
        'Supelco 20362 — ORBO™ 92 Carboxen® 564 (20/45)',
        'Tubo sorvente com peneira molecular de carvão (CMS — carbon molecular sieve), Carboxen 564.',
        'Duas seções: 160 mg na seção principal e 80 mg na seção de retaguarda.',
        'Granulometria: 20/45 mesh. Dimensões: diâmetro externo de 6 mm × comprimento de 75 mm.',
        'Separadores W,F,F: lã de vidro e espuma.',
        'O fabricante apresenta este produto para o grupo analítico acetato de vinila.',
        'Referência técnica adotada pelo sistema a partir da descrição do sorvente e das massas informadas; o laboratório não identificou a marca nem o modelo. A equivalência integral e a aplicação ao método dependem das demais características da montagem.',
        'O laboratório pode utilizar outra marca ou montagem própria; essa possibilidade não foi confirmada.',
        'Fonte: Supelco / Sigma-Aldrich — https://www.sigmaaldrich.com/CA/en/product/supelco/20362',
      ].join('\n'),
    };
  }

  // A laboratory's generic label does not identify diameter or cassette assembly.
  if (/^Cassete\s+MCE\s+0[,.]8\s*[µμu]m$/i.test(source)) {
    return {
      code: 'SKC 225-508 / 225-3-01',
      description: 'Cassete MCE 0,8 µm',
      tooltip: [
        'Referências técnicas SKC para cassetes com filtro MCE de 0,8 µm:',
        'SKC 225-508: cassete de estireno transparente, 37 mm, duas seções, com filtro MCE de 0,8 µm, suporte e banda de vedação.',
        'SKC 225-3-01: cassete de estireno transparente, 37 mm, três seções, com filtro MCE de 0,8 µm, suporte e banda de vedação.',
        'MCE: membrana de ésteres mistos de celulose (acetato e nitrato de celulose).',
        'Seleção da montagem: para ciclones SKC compatíveis, utilizar cassete de três seções, removendo a seção de entrada e conectando o ciclone ao anel central. A coleta em face aberta também pode exigir três seções; sem ciclone, verificar a configuração do método antes de optar por duas seções.',
        'Referências adotadas pelo sistema para comparação técnica; não identificam o fabricante ou o produto efetivamente fornecido pelo laboratório.',
        'A descrição de origem não informa o diâmetro nem o número de seções. Confirmar essas características para definir a equivalência e a montagem aplicável.',
        'O laboratório pode utilizar outra marca ou montar o cassete com membranas adquiridas separadamente; essa possibilidade não foi confirmada.',
        'Fonte: SKC — https://www.skcltd.com/products2/filters-cassettes/mixed-cellulose-ester-mce-membrane-filters.html',
      ].join('\n'),
    };
  }

  const codePattern =
    /\b(?:SKC\s*)?(225|226)[\s-]*(\d+(?:[\s-]+\d+)*[A-Z]?)(?![\w])/gi;
  const codes = [
    ...new Set(
      Array.from(
        source.matchAll(codePattern),
        (match) =>
          `${match[1]}-${match[2].replace(/\s*-\s*|\s+/g, '-').toUpperCase()}`,
      ),
    ),
  ];
  for (const standard of standardSamplers) {
    if (standard.alias.test(source) && !codes.includes(standard.code))
      codes.push(standard.code);
  }
  const parts = source.split(/\s+[—–]\s+/);
  const text = (
    parts.length > 1
      ? parts.slice(1).join(' — ')
      : source.replace(codePattern, '')
  )
    .replace(/\(\s*\)/g, '')
    .replace(/^[\s,;/—–-]+|[\s,;/—–-]+$/g, '');
  const standards = codes.map((code) =>
    standardSamplers.find((item) => item.code === code),
  );
  const known = standards.length > 0 && standards.every(Boolean);
  const twoTubes = /\b(?:2\s*[x×]|dois tubos|2 tubos)\b/i.test(source);
  const series = /\bsérie\b/i.test(source);
  const accessorySource =
    codes.length === 1 &&
    [
      '225-9002',
      '225-9004',
      '225-9006',
      '225-9007',
      '225-9018',
      '225-321',
      '226-58',
    ].includes(codes[0])
      ? source.replace(/cassete|tratad[oa]s?|impregnad[oa]s?/gi, '')
      : source;
  const accessory =
    /(?:pr[ée][ -]?filtro|cassete|secante|impregnad|tratad|associad|precedid)/i.test(
      accessorySource,
    );
  const cyclone = /ciclone|cyclone/i.test(source + ' ' + (description || ''));
  const sulfuricFilter =
    codes.includes('225-7') &&
    /[áa]cido sulf[úu]rico|sulfuric acid|H2SO4/i.test(
      source + ' ' + (description || ''),
    );
  const silicaCassette =
    codes.length === 1 && codes[0] === '226-10-03' && /cassete/i.test(source);
  const setup = [
    silicaCassette ? 'com cassete' : '',
    sulfuricFilter ? 'H₂SO₄ (laboratório)' : '',
    cyclone ? 'ciclone (conferir montagem)' : '',
    twoTubes &&
    !codes.some((code) => ['226-37', '226-82', '225-9004'].includes(code))
      ? '2 tubos'
      : '',
    series && !codes.includes('226-82') ? 'em série' : '',
    accessory &&
    !silicaCassette &&
    !(
      codes.length === 1 &&
      ['226-98', '226-96'].includes(codes[0]) &&
      !/pr[ée][ -]?filtro|cassete|secante|associad|precedid/i.test(source)
    )
      ? 'montagem específica'
      : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const short = known
    ? standards.map((item) => item!.short).join(' + ')
    : text || description?.trim() || '—';
  const details = [
    ...new Set([source, description?.trim()].filter(Boolean)),
  ].join('\n');
  return {
    code: codes.map((code) => `SKC ${code}`).join('; ') || '—',
    description: known && setup ? `${short} · ${setup}` : short,
    tooltip:
      codes.includes('226-30-08') ||
      codes.includes('226-30-04') ||
      codes.includes('225-7') ||
      codes.includes('225-2250') ||
      codes.includes('225-5') ||
      codes.includes('226-01') ||
      codes.includes('226-37') ||
      codes.includes('226-98') ||
      codes.includes('226-96') ||
      codes.includes('225-9002') ||
      codes.includes('226-58')
        ? standards
            .filter((item) => Boolean(item))
            .map((item) => item!.full)
            .join('\n\n') +
          (sulfuricFilter
            ? '\n\nTratamento com ácido sulfúrico informado pelo laboratório. Concentração e carga do reagente não informadas nesta descrição; não são especificações do filtro base SKC 225-7.'
            : '') +
          (cyclone && codes.includes('225-2250')
            ? '\n\nMontagem com ciclone informada na origem: o código 225-2250 corresponde a um cassete de duas seções. A SKC orienta o uso de cassete de três seções, com a seção de entrada removida e o ciclone inserido no anel central, para seus ciclones. Conferir o modelo do ciclone e a montagem; o código original foi preservado.'
            : '')
        : known
          ? `${standards.map((item) => item!.full).join('\n')}${details ? `\n\nConfiguração informada pelo laboratório:\n${details}` : ''}`
          : details || 'Descrição não informada',
  };
}
