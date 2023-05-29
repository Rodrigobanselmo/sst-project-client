/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import {
  RiskRecTextTypeEnum,
  RiskRecTypeEnum,
} from 'project/enum/RiskRecType.enum';

import { dateMask, dateMonthMask } from 'core/utils/masks/date.mask';

import { IUseEditComment } from '../../hooks/useEditComments';

export const ModalCommentStep = ({
  commentData,
  control,
  setValue,
}: IUseEditComment) => {
  return (
    <SFlex gap={8} direction="column" mt={8}>
      <InputForm
        autoFocus
        minRows={3}
        maxRows={6}
        multiline
        setValue={setValue}
        defaultValue={commentData.name}
        label="Motivo"
        control={control}
        placeholder={'descreva brevemente o motivo da alteração...'}
        name="text"
        size="small"
      />
      <SText color="text.label" fontSize={14} mb={-3}>
        Selecione uma justificativa abaixo
      </SText>
      <RadioFormText
        setValue={setValue}
        type="radio"
        control={control}
        defaultValue={String(commentData.textType)}
        options={[
          {
            content: 'Inviabilidade Financeira',
            value: RiskRecTextTypeEnum.MONEY,
          },
          {
            content: 'Inviabilidade \n Técnicate',
            value: RiskRecTextTypeEnum.TECHNIQUE,
          },
          {
            content: 'Inviabilidade de Logistica',
            value: RiskRecTextTypeEnum.LOGISTICS,
          },
          {
            content: 'Outros',
            value: RiskRecTextTypeEnum.OTHER,
          },
        ]}
        name="textType"
        columns={4}
        width="101%"
      />
      {commentData.type === RiskRecTypeEnum.POSTPONED && (
        <InputForm
          setValue={setValue}
          label="Novo Prazo"
          defaultValue={String(commentData.endDate)}
          control={control}
          placeholder={'__/__/____'}
          name="endDate"
          size="small"
          smallPlaceholder
          mask={dateMask.apply}
        />
      )}
    </SFlex>
  );
};
