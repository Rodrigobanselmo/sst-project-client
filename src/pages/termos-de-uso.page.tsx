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
        <h1 style={headerStyle}>Termos de Uso</h1>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>INTRODUÇÃO</h2>
          <p>
            Estes termos de uso definem as regras para o acesso e utilização dos
            serviços em ambiente digital, tanto por indivíduos como por
            entidades públicas ou privadas que busquem nossos serviços. O
            propósito é garantir a privacidade e segurança das informações
            fornecidas por todas as partes envolvidas, assegurando o manejo e a
            proteção de dados pessoais em alinhamento com os direitos
            fundamentais de liberdade, privacidade e autodesenvolvimento.
          </p>
          <p>
            A SimpleSST provê serviços e soluções únicas por meio da criação de
            softwares tecnológicos específicos para promoção da saúde e
            segurança ocupacional a todos os usuários do serviço. Trata-se de
            uma plataforma para a elaboração de PCMSO e PGR, destinada também à
            gestão de SST.
          </p>
          <p>
            A SimpleSST não fornece nenhum serviço médico, relacionado à
            medicina do trabalho e saúde em geral, sem qualquer vínculo com a
            prestação de serviços médicos correlatos, nem interferindo na
            escolha de profissionais da saúde que são escolhidos de forma
            voluntária pelo usuário do serviço ao acessar o portal.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>PROTEÇÃO DOS DADOS E INFORMAÇÕES</h2>
          <p>
            O banco de dados é gerido por pessoas devidamente autorizadas e
            capacitadas pela SimpleSST, com o objetivo de cumprir as
            especificações do Contrato de Prestação de Serviços SimpleSST com
            seus clientes. Estes indivíduos são contratualmente responsáveis por
            garantir a confidencialidade das informações e aderir à legislação
            de proteção à privacidade e segredo de dados.
          </p>
          <p>
            Os Usuários são indivíduos que obtêm acesso exclusivo aos seus dados
            através do Cliente SimpleSST por meio de seu Usuário Administrador.
            As permissões de acesso são definidas pelos Clientes, de acordo com
            os termos acordados no contrato entre as partes, sem qualquer
            intervenção da SimpleSST nessa autorização.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>COMPARTILHAMENTO DE DADOS</h2>
          <p>
            O SimpleSST possibilita que Usuários Administradores estabeleçam
            novos Usuários e senhas. Por meio do sistema, esses Usuários podem
            representar outras empresas com seus respectivos conjuntos de
            Usuários. Este acesso é restrito, supervisionado e monitorado pelo
            Cliente SimpleSST e seus administradores, sendo o Cliente SimpleSST
            responsável por quaisquer ações realizadas por tais Usuários, sem
            qualquer interferência da SimpleSST.
          </p>
          <p>
            A SimpleSST não compartilha dados e informações pessoais com
            terceiros, a menos que se trate de investigação criminal,
            administrativa ou civil, por meio de ordem judicial ou
            administrativa expedida por autoridade ou órgão competente,
            observando sempre os casos de sigilo de informações determinados
            pela legislação específica em vigor para cada situação. Se existirem
            indícios ou razões suficientes para suspeitar que a atividade de um
            Usuário está tentando ou cometeu um delito, ou com a intenção de
            prejudicar terceiros, a SimpleSST, nestes casos específicos, poderá
            fornecer as informações e dados às autoridades competentes,
            informando ao Cliente SimpleSST. Esta medida será adotada pela
            SimpleSST com total confidencialidade, apenas quando considerar
            apropriado ou necessário para preservar a integridade e segurança de
            todos os Clientes SimpleSST e seus respectivos Usuários.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>
            ARMAZENAMENTO DO IP E ATIVIDADES DOS USUÁRIOS
          </h2>
          <p>
            O endereço IP (Protocolo de Internet) é a identidade única de um
            dispositivo de acesso (por exemplo, computador, smartphone ou
            tablet) em uma rede. Cada computador tem essa identidade distinta
            que é usada para comunicação via internet. O SimpleSST captura esse
            número e o associa ao Usuário, registrando-o em um programa
            conhecido como Registro de Acesso e Ações do SimpleSST, o que
            contribui para a segurança do ambiente.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>ACEITAÇÃO DOS TERMOS DE USO</h2>
          <p>
            O USUÁRIO do serviço é instado a ler cuidadosamente estes Termos de
            Uso e a demonstrar sua concordância com as condições aqui presentes,
            além da política de privacidade e segurança de dados correlata, por
            meio de um aceite eletrônico. Este aceite eletrônico representa uma
            concordância expressa, automática, completa e sem restrições a todas
            as disposições contidas nestes Termos, incluindo possíveis
            atualizações ou alterações através da adição de novos termos e
            limitações, estando o usuário sujeito à versão mais recente destes
            Termos. Para utilizar o serviço, o Usuário deve possuir competência
            legal para aceitar os Termos de Uso.
          </p>
          <p></p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>RESPONSABILIDADE DO USUÁRIO</h2>
          <p>
            O Usuário será dotado de um login de identificação e senha, e será
            completamente responsável pela segurança do acesso. Deve notificar a
            SimpleSST imediatamente se houver qualquer suspeita de violação de
            sigilo e segurança. Além disso, o Usuário reconhece que o seu
            registro no serviço implica uma identificação verdadeira, sendo ele
            completamente responsável por qualquer imprecisão ou omissão de
            dados fornecidos.
          </p>

          <p>
            O Usuário é o único responsável por sua conduta e por quaisquer
            danos causados durante a prestação do serviço, decorrentes da
            divulgação de qualquer conteúdo inapropriado, inadequado, imoral,
            ofensivo e censurável, sendo obrigado a reparar danos àqueles que
            sofrerem eventuais prejuízos. O Usuário se compromete a utilizar o
            serviço de boa-fé e em conformidade com todas as normas legais,
            morais, regulamentares e contratuais, sob pena de responsabilização
            administrativa, civil e penal.
          </p>

          <p>
            Cada Usuário é integralmente responsável por todo e qualquer
            conteúdo transmitido a um servidor ou de qualquer outra forma
            disponibilizado através do serviço. O Usuário garante a
            autenticidade de todas as informações fornecidas ao preencher
            formulários e outros registros relacionados à prestação do serviço,
            podendo ser responsabilizado por violação dos termos de uso e
            licença do serviço, bem como, por possíveis infrações penais nos
            termos dos Artigos 299 e 307 do Código Penal. O Usuário concorda em
            cumprir todas as leis aplicáveis em relação à transmissão de dados
            técnicos e comportamento dos Usuários na rede, bem como sobre
            conteúdos aceitáveis, tanto no Brasil como no país onde estiver
            localizado. O Usuário concorda em indenizar a SimpleSST por
            quaisquer perdas e danos que possam ser exigidos, incluindo despesas
            judiciais e honorários advocatícios, devido ao conteúdo submetido,
            exibido, transmitido ou disponibilizado no serviço.
          </p>

          <p>
            O Usuário concorda em não reproduzir, duplicar, copiar, vender,
            revender ou explorar para fins comerciais qualquer parte do serviço,
            sua utilização ou acesso. Ele também reconhece e concorda que o
            serviço contém informações confidenciais, protegidas pela Lei de
            Proteção à Propriedade Intelectual de Programa de Computador e
            normas correlatas. Além disso, o Usuário reconhece e concorda que o
            conteúdo incluído em propagandas patrocinadas ou informações
            apresentadas ao Usuário através do serviço ou anunciantes é
            protegido por direitos autorais, marcas registradas, patentes e
            outros direitos de propriedade intelectual e outras leis aplicáveis.
            Exceto se expressamente autorizado pela SimpleSST, o Usuário
            concorda em não modificar, alugar, vender, distribuir ou criar obras
            derivadas a partir do serviço, em parte ou na totalidade.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>RESTRIÇÕES E RENÚNCIA DE RESPONSABILIDADES</h2>
          <p>
            A SimpleSST tem o direito de examinar as informações fornecidas e,
            se constatadas irregularidades, pode optar por suspender ou cancelar
            imediatamente a conta de acesso do Usuário, sem necessidade de aviso
            prévio.
          </p>

          <p>
            A SimpleSST não assume responsabilidade pelas informações
            compartilhadas pelo Usuário por meio do sistema exclusivo, nem por
            quaisquer custos, prejuízos ou danos que possam advir da utilização
            do serviço pelo Usuário, sendo, portanto, isenta de qualquer culpa
            derivada.
          </p>

          <p>
            A SimpleSST não é obrigada a monitorar, e nem monitora, autoriza ou
            se responsabiliza se o Usuário optar por utilizar os serviços de
            maneira ilegal, difamatória, discriminatória, ofensiva, obscena,
            injuriosa, caluniosa, violenta, ameaçadora ou através da usurpação
            de identidade, ou se o conteúdo compartilhado violar a moralidade,
            os bons costumes e a ordem pública.
          </p>
        </div>
      </div>
      <SCopyRightBottom />
    </>
  );
};

export default PrivacyPolicy;
