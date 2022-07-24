import { useMemo } from 'react';

import { useRouter } from 'next/router';

import { characterizationOptionsConstant } from 'core/constants/maps/characterization-options.map';
import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';

import {
  IUseEditCharacterization,
  useEditCharacterization,
} from '../../ModalAddCharacterization/hooks/useEditCharacterization';
import {
  IUseEditEnvironment,
  useEditEnvironment,
} from '../../ModalAddEnvironment/hooks/useEditEnvironment';

const modalNameInit = ModalEnum.ALL_CHARACTERIZATION_ADD;

export const useEditAllChar = () => {
  const router = useRouter();

  const pageData = useMemo(() => {
    const characterizationType = router.query
      .characterization as CharacterizationEnum;
    let data = characterizationOptionsConstant[characterizationType];

    if (!data) {
      data = characterizationOptionsConstant[CharacterizationEnum.ENVIRONMENT];
    }
    return data;
  }, [router.query.characterization]);

  const propsChar = useEditCharacterization(modalNameInit);
  const propsEnv = useEditEnvironment(modalNameInit);

  if (
    [
      CharacterizationEnum.ENVIRONMENT,
      CharacterizationEnum.SUPPORT,
      CharacterizationEnum.OPERATION,
      CharacterizationEnum.ADM,
    ].includes(pageData.type as any)
  )
    return propsEnv;

  return propsChar;
};

export type IUseEditAllChar = ReturnType<typeof useEditAllChar> & {
  filterQuery: (IEnvironment | ICharacterization)[];
  setData: any;
};
