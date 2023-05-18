/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */

import { formatCPF } from '@brazilian-utils/brazilian-utils';
import { Page, Text, View } from '@react-pdf/renderer';

import { styles } from '../styles';

export default function LaudoPcdPage({
  data,
}: {
  data?: { name?: string; cpf?: string };
}) {
  return (
    <Page style={styles.page}>
      <View style={styles.box}>
        {/* HEADER */}
        <View
          style={{
            ...styles.lineBottom,
            paddingHorizontal: 5,
            paddingBottom: 10,
            paddingTop: 5,
            lineHeight: 1,
          }}
        >
          <Text
            style={{
              ...styles.textCenter,
              ...styles.textBold,
              fontSize: 10,
              marginBottom: 2,
            }}
          >
            LAUDO CARACTERIZADOR DE DEFICIÊNCIA
          </Text>

          <Text
            style={{ ...styles.textCenter, ...styles.textBold, fontSize: 10 }}
          >
            De acordo com os dispositivos da Convenção sobre os Direitos das
            Pessoas com deficiência, Lei Brasileira de Inclusão – Estatuto da
            Pessoa com Deficiência - Lei 13.146/2015, Lei 12764/12, Decreto
            3.298/1999 e da Instrução Normativa SIT/ MTE n.º 98 de 15/08/2012.
          </Text>
        </View>

        {/* ROW 1 */}
        <View style={{ ...styles.lineBottom, ...styles.boxRow, height: 27 }}>
          <View
            style={{
              flex: 65,
              paddingBottom: 10,
              ...styles.ph,
              ...styles.lineRight,
            }}
          >
            <Text
              style={{
                ...styles.textBold,
                fontSize: 10,
                marginBottom: 2,
              }}
            >
              NOME: <Text style={{ ...styles.textHidden }}>_</Text>
              <Text style={{ fontSize: 10, fontWeight: 'normal' }}>
                {data?.name || ''}
              </Text>
            </Text>
          </View>

          <View style={{ flex: 35, paddingBottom: 10, ...styles.ph }}>
            <Text style={{ ...styles.textBold, fontSize: 10, marginBottom: 2 }}>
              CPF: <Text style={{ ...styles.textHidden }}>_</Text>
              <Text style={{ fontSize: 10, fontWeight: 'normal' }}>
                {data?.cpf ? formatCPF(data.cpf) : ''}
              </Text>
            </Text>
          </View>
        </View>

        {/* ROW 2 */}
        <View style={{ ...styles.lineBottom, height: 35 }}>
          <View style={{ ...styles.boxRow, ...styles.ph }}>
            <Text
              style={{
                ...styles.textBold,
                fontSize: 10,
              }}
            >
              CID:
            </Text>
            <Text
              style={{
                ...styles.textBold,
                fontSize: 10,
                marginLeft: 160,
              }}
            >
              Origem da deficiência:
            </Text>
          </View>
          <View
            style={{
              ...styles.boxRow,
              ...styles.ph,
              paddingTop: 1,
            }}
          >
            {[
              'Congênita',
              'Acid./Doença do. trabalho',
              'Acid. comum',
              'Doença comum',
              'Adquirida pós operatório',
            ].map((text) => (
              <View
                style={{
                  ...styles.boxRow,
                  ...styles.boxRowCenter,
                  paddingRight: 8,
                }}
              >
                <View style={{ ...styles.checkbox }}>
                  <View style={{ ...styles.checkboxInner }} />
                </View>
                <Text style={{ fontSize: 9 }}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ROW 3 */}
        <View style={{ ...styles.lineBottom, height: 95, ...styles.ph }}>
          <Text style={{ fontSize: 9, lineHeight: 1.2, ...styles.textBold }}>
            Descrição{' '}
            <Text style={{ fontSize: 9, ...styles.udl }}>detalhada</Text> dos
            impedimentos (alterações) nas funções e estruturas do corpo (física,
            auditiva, visual, intelectual e mental - psicossocial).
            <Text style={{ fontSize: 8.5 }}>
              {' '}
              Utilizar folhas adicionais, se necessário. Adicionar as
              informações e exames complementares solicitados abaixo para cada
              tipo de deficiência
            </Text>
          </Text>
        </View>

        {/* ROW 4 */}
        <View
          style={{
            ...styles.lineBottom,
            ...styles.ph,
            height: 120,
            lineHeight: 1.2,
          }}
        >
          <Text style={{ fontSize: 9, ...styles.textBold }}>
            Descrição das limitações no desempenho de atividades da vida diária
            e restrições de participação social, (informar se necessita de
            apoios – órteses, próteses, softwares, ajudas técnicas, cuidador
            etc.).
            <Text style={{ fontSize: 8.5 }}>
              {' '}
              Utilizar folhas adicionais, se necessário.
            </Text>
          </Text>
        </View>

        {/* ROW 5 BLOCKs */}
        <View style={{ ...styles.lineBottom, ...styles.boxRow, height: 363 }}>
          {/* BLOCK 1 */}
          <View style={{ flex: 1 }}>
            {/* BLOCK 1.1 */}
            <View
              style={{
                position: 'relative',
                paddingTop: 2,
                paddingBottom: 10,
                ...styles.lineBottom,
                ...styles.ph,
                ...styles.lineRight,
              }}
            >
              <View
                style={{
                  ...styles.checkbox,
                  position: 'absolute',
                  top: 5,
                  left: styles.ph.paddingHorizontal,
                }}
              >
                <View style={{ ...styles.checkboxInner }} />
              </View>
              <Text
                style={{
                  fontSize: 9,
                  marginBottom: 2,
                  ...styles.lh,
                }}
              >
                <Text style={{ ...styles.textHidden }}>___</Text>
                <Text style={{ ...styles.textBold }}>
                  I- Deficiência Física
                </Text>{' '}
                - alteração completa ou parcial de um ou mais segmentos do corpo
                humano,{' '}
                <Text style={{ fontSize: 9, ...styles.udl }}>
                  acarretando o comprometimento da função física,
                </Text>
                apresentando-se sob a forma de:
              </Text>
              <View
                style={{
                  borderBottom: '0.5px solid #000',
                  paddingBottom: 10,
                  marginBottom: 15,
                  marginRight: 10,
                }}
              >
                {[
                  ['paraplegia', 'paraparesia'],
                  ['monoplegia', 'monoparesia'],
                  ['tetraplegia', 'tetraparesia'],
                  ['triplegia', 'triparesia'],
                  ['hemiplegia', 'hemiparesia'],
                  ['ostomia', 'amputação ou ausência de membro'],
                  'paralisia cerebral',
                  'membros com deformidade congênita ou adquirida',
                  'nanismo (altura: _______)',
                  'outras - especificar: __________________________________________',
                ].map((text) => {
                  if (Array.isArray(text)) {
                    return (
                      <View
                        style={{
                          ...styles.boxRow,
                          ...styles.boxRowCenter,
                        }}
                      >
                        <View
                          style={{
                            ...styles.boxRow,
                            ...styles.boxRowCenter,
                            paddingRight: 8,
                            flex: 35,
                          }}
                        >
                          <View style={{ ...styles.checkbox }}>
                            <View style={{ ...styles.checkboxInner }} />
                          </View>
                          <Text style={{ fontSize: 8 }}>{text[0]}</Text>
                        </View>
                        <View
                          style={{
                            ...styles.boxRow,
                            ...styles.boxRowCenter,
                            paddingRight: 8,
                            flex: 70,
                          }}
                        >
                          <View style={{ ...styles.checkbox }}>
                            <View style={{ ...styles.checkboxInner }} />
                          </View>
                          <Text style={{ fontSize: 8 }}>{text[1]}</Text>
                        </View>
                      </View>
                    );
                  }

                  return (
                    <View
                      style={{
                        ...styles.boxRow,
                        ...styles.boxRowCenter,
                        paddingRight: 8,
                      }}
                    >
                      <View style={{ ...styles.checkbox }}>
                        <View style={{ ...styles.checkboxInner }} />
                      </View>
                      <Text style={{ fontSize: 8 }}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* BLOCK 1.2 */}
            <View
              style={{
                position: 'relative',
                paddingTop: 2,
                paddingBottom: 8,
                ...styles.ph,
                ...styles.lineBottom,
                ...styles.lineRight,
              }}
            >
              <View
                style={{
                  ...styles.checkbox,
                  position: 'absolute',
                  top: 5,
                  left: styles.ph.paddingHorizontal,
                }}
              >
                <View style={{ ...styles.checkboxInner }} />
              </View>
              <Text
                style={{
                  fontSize: 9,
                  marginBottom: 2,
                  ...styles.lh,
                }}
              >
                <Text style={{ ...styles.textHidden }}>___</Text>
                <Text style={{ ...styles.textBold }}>
                  II- Deficiência Auditiva
                </Text>{' '}
                a - perda bilateral, parcial ou total, de 41 decibéis (dB) ou
                mais, aferida por audiograma nas frequências de 500HZ, 1.000HZ,
                2.000Hz e 3.000Hz
              </Text>
              <Text
                style={{ fontSize: 8.5, ...styles.udl, ...styles.textBold }}
              >
                Obs: Anexar audiograma
              </Text>
            </View>

            {/* BLOCK 1.3 */}
            <View
              style={{
                position: 'relative',
                paddingTop: 2,
                paddingBottom: 8,
                ...styles.ph,
                ...styles.lineRight,
              }}
            >
              <View
                style={{
                  ...styles.checkbox,
                  position: 'absolute',
                  top: 5,
                  left: styles.ph.paddingHorizontal,
                }}
              >
                <View style={{ ...styles.checkboxInner }} />
              </View>
              <Text
                style={{
                  fontSize: 8.5,
                  marginBottom: 2,
                }}
              >
                <Text style={{ ...styles.textHidden }}>___</Text>
                <Text style={{ ...styles.textBold }}>
                  III- Deficiência Visual
                </Text>
              </Text>
              <Text style={{ fontSize: 8.5, ...styles.lh }}>
                (<Text style={{ ...styles.textHidden }}>__</Text>) cegueira -
                acuidade visual ≤ 0,05 (20/400) no melhor olho, com a melhor
                correção óptica;
              </Text>
              <Text style={{ fontSize: 8.5, ...styles.lh }}>
                (<Text style={{ ...styles.textHidden }}>__</Text>) baixa visão -
                acuidade visual entre 0,3 (20/60) e 0,05 (20/400) no melhor
                olho, com a melhor correção óptica;
              </Text>
              <Text style={{ fontSize: 8, ...styles.lh }}>
                (<Text style={{ ...styles.textHidden }}>__</Text>) somatória da
                medida do campo visual em ambos os olhos igual ou menor que 60º
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  ...styles.udl,
                  ...styles.lh,
                  ...styles.textBold,
                }}
              >
                Obs: Anexar laudo oftalmológico, com acuidade visual, pela
                tabela de Snellen, com a melhor correção óptica ou somatório do
                campo visual em graus.
              </Text>
            </View>
          </View>

          {/* BLOCK 2 */}
          <View style={{ flex: 1 }}>
            {/* BLOCK 2.1 */}
            <View
              style={{
                paddingTop: 2,
                paddingBottom: 5,
                ...styles.ph,
                ...styles.lineBottom,
              }}
            >
              <View style={{ ...styles.boxRow, marginRight: 20 }}>
                <View
                  style={{
                    ...styles.checkbox,
                    marginTop: 2,
                    marginRight: 5,
                  }}
                >
                  <View style={{ ...styles.checkboxInner }} />
                </View>

                <Text
                  style={{
                    fontSize: 8.5,
                    marginBottom: 2,
                    ...styles.lh,
                  }}
                >
                  <Text style={{ ...styles.textBold }}>
                    III a- Visão Monocular-
                  </Text>{' '}
                  conforme parecer CONJUR/MTE 444/11: cegueira legal em um olho,
                  na qual a acuidade visual com a melhor correção óptica é igual
                  ou menor que 0,05 (20/400) (ou cegueira declarada por
                  oftalmologista).
                </Text>
              </View>
              <Text style={{ fontSize: 8.5 }}>
                Obs: Anexar laudo oftalmológico
              </Text>
            </View>

            {/* BLOCK 2.2 */}
            <View
              style={{
                position: 'relative',
                paddingTop: 2,
                paddingBottom: 5,
                ...styles.lineBottom,
                ...styles.ph,
              }}
            >
              <View
                style={{
                  ...styles.checkbox,
                  position: 'absolute',
                  top: 5,
                  left: styles.ph.paddingHorizontal,
                }}
              >
                <View style={{ ...styles.checkboxInner }} />
              </View>
              <Text
                style={{
                  fontSize: 9,
                  marginBottom: 2,
                  ...styles.lh,
                }}
              >
                <Text style={{ ...styles.textHidden }}>___</Text>
                <Text style={{ ...styles.textBold }}>
                  IV- Deficiência Intelectual-
                </Text>{' '}
                funcionamento intelectual significativamente inferior à média e
                limitações associadas a duas ou mais habilidades adaptativas,
                tais como:
              </Text>
              <View
                style={{
                  marginRight: 10,
                }}
              >
                {[
                  'a) - Comunicação;',
                  ' b) - Cuidado pessoal;',
                  ' c) - Habilidades sociais;',
                  ' d) - Utilização de recursos da comunidade;',
                  ' e) - Saúde e segurança;',
                  ' f) - Habilidades acadêmicas;',
                  ' g) - Lazer;',
                  ' h) - Trabalho.',
                ].map((text) => {
                  return (
                    <View
                      style={{
                        ...styles.boxRow,
                        ...styles.boxRowCenter,
                        paddingRight: 8,
                      }}
                    >
                      <View style={{ ...styles.checkbox }}>
                        <View style={{ ...styles.checkboxInner }} />
                      </View>
                      <Text style={{ fontSize: 8 }}>{text}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={{ fontSize: 8, ...styles.udl, ...styles.textBold }}>
                Obs: Anexar laudo do especialista
              </Text>
            </View>

            {/* BLOCK 2.3 */}
            <View
              style={{
                position: 'relative',
                paddingTop: 2,
                paddingBottom: 5,
                ...styles.ph,
                ...styles.lineBottom,
              }}
            >
              <View
                style={{
                  ...styles.checkbox,
                  position: 'absolute',
                  top: 5,
                  left: styles.ph.paddingHorizontal,
                }}
              >
                <View style={{ ...styles.checkboxInner }} />
              </View>
              <Text
                style={{
                  fontSize: 9,
                  marginBottom: 2,
                  ...styles.lh,
                }}
              >
                <Text style={{ ...styles.textHidden }}>___</Text>
                <Text style={{ ...styles.textBold }}>
                  IV a- Deficiência Mental
                </Text>{' '}
                – Psicossocial – conforme Convenção ONU – Esquizofrenia,
                Transtornos psicóticos e outras limitações psicossociais que
                impedem a plena e efetiva participação na sociedade em igualdade
                de oportunidades com as demais pessoas.
                <Text style={{ fontSize: 8.5, ...styles.udl }}>
                  (Informar no campo descritivo se há outras doenças, data de
                  início das manifestações e citar as limitações para
                  habilidades adaptativas).
                </Text>
              </Text>
              <Text style={{ fontSize: 8, ...styles.udl, ...styles.textBold }}>
                Obs: Anexar laudo do especialista
              </Text>
            </View>

            {/* BLOCK 2.4 */}
            <View
              style={{
                position: 'relative',
                paddingTop: 2,
                paddingBottom: 5,
                ...styles.ph,
                ...styles.lineBottom,
              }}
            >
              <View
                style={{
                  ...styles.checkbox,
                  position: 'absolute',
                  top: 5,
                  left: styles.ph.paddingHorizontal,
                }}
              >
                <View style={{ ...styles.checkboxInner }} />
              </View>
              <Text
                style={{
                  fontSize: 9,
                  marginBottom: 2,
                  ...styles.lh,
                }}
              >
                <Text style={{ ...styles.textHidden }}>___</Text>
                <Text style={{ ...styles.textBold }}>
                  IV b- Deficiência Mental
                </Text>{' '}
                Lei 12764/2012 – Espectro Autista{' '}
                <Text
                  style={{ fontSize: 8, ...styles.udl, ...styles.textBold }}
                >
                  Obs: Anexar laudo do especialista.
                </Text>
              </Text>
            </View>

            {/* BLOCK 2.5 */}
            <View
              style={{
                paddingTop: 2,
                paddingBottom: 5,
                ...styles.ph,
                flex: 1,
              }}
            >
              <View style={{ ...styles.boxRow, marginRight: 20 }}>
                <View
                  style={{
                    ...styles.checkbox,
                    marginTop: 2,
                    marginRight: 5,
                  }}
                >
                  <View style={{ ...styles.checkboxInner }} />
                </View>

                <Text
                  style={{
                    fontSize: 8,
                    marginBottom: 2,
                    textAlign: 'center',
                    ...styles.lh,
                  }}
                >
                  <Text style={{ ...styles.textBold }}>
                    V- Deficiência Múltipla{' '}
                  </Text>{' '}
                  - associação de duas ou mais deficiências. (Assinalar cada uma
                  acima)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ROW 6 */}
        <View
          style={{
            ...styles.lineBottom,
            ...styles.ph,
            paddingBottom: 5,
            paddingTop: 2,
          }}
        >
          <Text style={{ fontSize: 8, lineHeight: 1.2 }}>
            <Text style={{ fontSize: 8, ...styles.textBold }}>Conclusão: </Text>
            A pessoa está enquadrada nas definições do artigo 2º, da Lei nº
            13.146/2015-Lei Brasileira de Inclusão-Estatuto da Pessoa com
            Deficiência; dos artigos 3º e 4º do Decreto nº 3.298/1999, com as
            alterações do Dec. 5296/2004; do artigo 1º, §2º, da Lei nº
            12.764/2012, Parecer CONJUR 444/11, das recomendações da IN
            98/SIT/2012, de acordo com dispositivos da Convenção sobre os
            Direitos das Pessoas com Deficiência e seu protocolo facultativo,
            promulgada pelo Decreto n°. 6.949/2009.
          </Text>
        </View>

        {/* ROW 7 */}
        <View style={{ ...styles.lineBottom, ...styles.boxRow, flex: 1 }}>
          <View
            style={{
              flex: 78,
              justifyContent: 'flex-end',
              ...styles.ph,
              ...styles.lineRight,
            }}
          >
            <Text style={{ fontSize: 9, lineHeight: 1 }}>
              Assinatura e carimbo do Profissional de nível
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 5 }}>
              superior da área da saúde/Especialidade
            </Text>
          </View>

          <View style={{ flex: 22, paddingBottom: 10, ...styles.ph }}>
            <Text style={{ fontSize: 9.5, marginTop: 8 }}>Data:</Text>
          </View>
        </View>

        {/* ROW 8 */}
        <View style={{ ...styles.boxRow }}>
          <View
            style={{
              flex: 60,
              ...styles.ph,
              ...styles.lineRight,
              ...styles.lh,
            }}
          >
            <Text
              style={{
                fontSize: 8,
                marginBottom: 2,
                marginRight: 30,
              }}
            >
              Estou ciente de que estou sendo enquadrado na cota de pessoas com
              Deficiência /reabilitados da empresa. Autorizo a apresentação
              deste Laudo e exames ao Ministério do Trabalho.
            </Text>
          </View>

          <View style={{ flex: 40, paddingBottom: 10, ...styles.ph }}>
            <Text style={{ fontSize: 8, marginTop: 2 }}>
              Assinatura do empregado
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}
