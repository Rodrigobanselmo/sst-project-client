import { SCopyRightBottom } from 'components/atoms/SCopyRightBottom/SCopyRightBottom';
import React from 'react';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  maxWidth: '1200px',
  padding: '20px',
  lineHeight: 1.6,
  fontFamily: 'Arial, sans-serif',
};

const headerStyle = {
  color: '#333',
  marginBottom: '16px',
};

const sectionStyle = {
  backgroundColor: '#f9f9f9',
  padding: '10px 20px',
  borderRadius: '5px',
  marginBottom: '20px',
  width: '100%',
};

const titleStyle = {
  color: '#333',
  fontWeight: 'bold',
  marginBottom: '6px',
  fontSize: '20px',
};

const paragraphStyle = {
  color: '#000',
  fontSize: '15px',
};

const PrivacyPolicy = () => {
  return (
    <>
      <div style={containerStyle as any}>
        <h1 style={headerStyle}>Política de Privacidade</h1>
        <div style={sectionStyle}>
          <h2 style={titleStyle}>OBJETIVO</h2>
          <p style={paragraphStyle}>
            Esta Política de Privacidade e Segurança de Dados estabelece as
            diretrizes para o tratamento das informações pessoais coletadas
            durante o acesso e uso do serviço oferecido pela SimpleSST, uma
            empresa de natureza jurídica Sociedade Empresária Limitada,
            registrada sob o CNPJ nº 60.161.885/0001-32, razão social
            &quot;Rodrigo Barbosa Marins Anselmo Desenvolvimento de Software
            LTDA&quot;. A empresa é uma matriz e está ativa desde 31/03/2025,
            com endereço comercial situado à Rua Armando Strazzacappa, 54, Apt
            16 Bloco 2, Parque Rural Fazenda Santa Candida, no município de
            Campinas | SP – CEP 13087-605, com email atendimento@simplesst.com.
          </p>
          <p style={paragraphStyle}>
            Esta Política de Privacidade complementa os Termos de Uso que
            regulam o acesso e uso do serviço pelo Usuário.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>
            REGISTRO E ACEITAÇÃO DOS TERMOS E CONDIÇÕES
          </h2>
          <p>
            Ao se cadastrar como usuário, você concorda integral e
            irrevogavelmente com todos os termos e condições estabelecidos.
          </p>
          <p>
            A SimpleSST se reserva o direito, a seu critério exclusivo, de
            modificar esta Política, incluindo a possibilidade de fazer
            alterações, adições e restrições. A continuidade do acesso e uso do
            serviço por parte do usuário implica na aceitação imediata de
            quaisquer atualizações que possam ocorrer.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>ARMAZENAMENTO DE DADOS</h2>
          <p>
            Ao acessar o serviço, as informações necessárias para identificar o
            acesso e uso do serviço são automaticamente registradas. Esses
            registros podem incluir dados sobre o navegador utilizado, tipo de
            dispositivo, tempo gasto, endereço de IP, sistema operacional,
            idioma, fuso horário e local. Esses dados são coletados para fins de
            segurança e autenticidade, a fim de identificar a autoria dos
            relatórios gerados.
          </p>
          <p>
            As informações capturadas são armazenadas para fins operacionais e
            estratégicos, visando a administração, gestão, ampliação e melhoria
            das funcionalidades do serviço. Elas são tratadas com rigorosos
            padrões de confidencialidade e segurança, incluindo criptografia.
          </p>
          <p>
            A SimpleSST armazenará criptograficamente os dados em seus próprios
            servidores, garantindo segurança e proteção contra perdas, uso
            indevido e acesso não autorizado.
          </p>
          <p>
            O acesso, uso e preservação dessas informações serão razoavelmente
            necessários para cumprir as disposições legais e fazer valer os
            Termos de Serviço aplicáveis, incluindo a investigação de possíveis
            violações, a detecção e prevenção de questões técnicas, fraudes e
            problemas de segurança.
          </p>
          <p>
            É de responsabilidade do usuário do serviço manter e arquivar a
            assinatura dos documentos, seguindo suas práticas de segurança. Além
            disso, o usuário também é responsável por preservar as informações
            de terceiros em formato físico (papel) ou digital (arquivos
            exportados), mesmo que gerados através do software SimpleSST
          </p>
          <p>
            A SimpleSST mantém uma política estrita de não divulgação ou
            compartilhamento de nenhum documento ou informação pessoal, a menos
            que haja autorização expressa do Usuário ou ordem judicial
            decorrente de uma determinação legal. Em nenhum caso as informações
            serão divulgadas ou compartilhadas sem o consentimento adequado.
            Essa medida visa garantir a privacidade e a segurança dos dados dos
            usuários.
          </p>
          <p>
            A SimpleSST utiliza cookies para aprimorar e aperfeiçoar a qualidade
            do serviço, armazenando e melhorando os resultados das pesquisas.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>COMPARTILHAMENTO DE INFORMAÇÕES</h2>
          <p>
            Nós não compartilharemos seus Dados Pessoais, exceto como definido
            nesta Política de Privacidade.
          </p>
          <p>
            A SimpleSST está constantemente aperfeiçoando seus procedimentos
            para garantir que esses Dados Pessoais sejam tratados em
            conformidade com as mais rigorosas normas de proteção de dados,
            incluindo a LGPD e ISO 27.001.
          </p>
          <p>
            Preservamos nosso direito de compartilhar Dados Pessoais quando for
            obrigatório pela legislação vigente ou para proteger os direitos de
            propriedade ou a segurança da SimpleSST, seus funcionários, clientes
            ou o público em geral. Nesses casos específicos, as informações e
            dados podem ser fornecidos às autoridades apropriadas, mantendo o
            Cliente informado, de modo que essa situação será tratada pela
            SimpleSST com total discrição, quando considerar adequado ou
            necessário para a preservação da integridade e segurança de todos os
            Clientes e seus respectivos usuários.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>DIREITOS E RESPONSABILIDADE DO USUÁRIO</h2>
          <p>
            O Usuário é encarregado pela precisão das informações fornecidas e
            pela integridade dos dados, podendo ser responsabilizado se tais
            informações forem imprecisas, o que pode resultar em suspensão e
            cancelamento do serviço, além das consequências contratuais.
          </p>
          <p>
            Os direitos dos usuários em relação à transparência, informação,
            acesso e notificação são garantidos, e eles estão cientes de como
            seus dados estão sendo manuseados.
          </p>
        </div>
      </div>
      <SCopyRightBottom />
    </>
  );
};

export default PrivacyPolicy;
