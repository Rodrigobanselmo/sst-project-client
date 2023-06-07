import { FC } from 'react';

import NextLink from 'next/link';

import SLink from 'components/atoms/SLink/SLink';
import SText from 'components/atoms/SText';
import { RoutesEnum } from 'core/enums/routes.enums';

export const PrivacyAndTerms: FC = () => {
  return (
    <>
      <SText mt={20} fontSize={12}>
        <NextLink passHref href={RoutesEnum.PRIVACY_POLITICS}>
          <SLink target="_blank" unstyled>
            <SText
              sx={{ textDecoration: 'underline' }}
              component="span"
              fontSize={12}
            >
              Política de Privacidade
            </SText>
          </SLink>
        </NextLink>{' '}
        /{' '}
        <NextLink passHref href={RoutesEnum.TERMS_OF_USE}>
          <SLink target="_blank" unstyled>
            <SText
              sx={{ textDecoration: 'underline' }}
              component="span"
              fontSize={12}
            >
              Termos de uso
            </SText>
          </SLink>
        </NextLink>{' '}
      </SText>
      <SText fontSize={12}>
        @ {new Date().getFullYear()} SimpleSSt – Todos os direitos reservados
      </SText>
    </>
  );
};
