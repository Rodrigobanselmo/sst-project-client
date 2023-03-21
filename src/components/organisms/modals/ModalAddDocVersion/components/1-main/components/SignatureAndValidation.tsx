/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import BorderColorIcon from '@mui/icons-material/BorderColor';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { InputForm } from 'components/molecules/form/input';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { TypeInputModal } from 'components/organisms/modals/ModalSingleInput';
import dayjs from 'dayjs';

import SStarFullIcon from 'assets/icons/SStarFullIcon';
import SStarIcon from 'assets/icons/SStarIcon';

import { IProfessional } from 'core/interfaces/api/IProfessional';
import { dateToString } from 'core/utils/date/date-format';
import { dateMonthMask } from 'core/utils/masks/date.mask';

import { IUseMainStep } from '../hooks/useMainStep';

export const SignatureAndValidation = (props: IUseMainStep) => {
  const {
    data,
    control,
    onAddSigner,
    onAddArray,
    onDeleteArray,
    onAddElaborator,
    setValue,
  } = props;

  return (
    <SFlex width={['100%']} gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14} mb={-2}>
        Vigência do documento
      </SText>
      <Box
        mt={5}
        sx={{
          gap: 10,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <InputForm
          setValue={setValue}
          defaultValue={
            dateToString(data?.validityStart, 'MM/YYYY') ||
            dayjs().format('MM/YYYY')
          }
          label="Início da vigência do PGR"
          control={control}
          placeholder={'00/0000'}
          name="validityStart"
          size="small"
          smallPlaceholder
          mask={dateMonthMask.apply}
        />
        <InputForm
          setValue={setValue}
          defaultValue={
            dateToString(data?.validityEnd, 'MM/YYYY') ||
            ('json' in data &&
            (data as any).json?.complementarySystems?.length > 0
              ? dayjs().add(3, 'years').format('MM/YYYY')
              : dayjs().add(2, 'years').format('MM/YYYY'))
          }
          label="Expiração do PGR"
          control={control}
          placeholder={'00/0000'}
          name="validityEnd"
          size="small"
          smallPlaceholder
          mask={dateMonthMask.apply}
        />
      </Box>
      <SDisplaySimpleArray
        values={data.professionals || []}
        valueField="name"
        onAdd={(_, user) => user && onAddArray(user, 'professionals')}
        onDelete={(_, user) => user && onDeleteArray(user, 'professionals')}
        label={
          'Profissionais responsaveis pela elaboração e/ou assinatura do documento'
        }
        buttonLabel={'Adicionar Profissional'}
        modalLabel={'Adicionar Profissional'}
        type={TypeInputModal.PROFESSIONAL}
        renderText={(user) => `${user.name} - ${user.email}`}
        onRenderStartElement={(professional: IProfessional) => {
          const isSigner =
            professional?.professionalDocumentDataSignature?.isSigner;
          const isElaborator =
            professional?.professionalDocumentDataSignature?.isElaborator;
          return (
            <>
              <STooltip withWrapper title="Assinar Documento PGR">
                <SIconButton
                  size="small"
                  onClick={() => {
                    onAddSigner(professional, !isSigner, 'professionals');
                  }}
                >
                  <Icon
                    component={
                      isSigner ? BorderColorIcon : DriveFileRenameOutlineIcon
                    }
                    sx={{ fontSize: '1.2rem', ...(isSigner ? {} : {}) }}
                    {...(isSigner ? { color: 'primary' } : {})}
                  />
                </SIconButton>
              </STooltip>
              <STooltip withWrapper title="Elaborador Documento PGR">
                <SIconButton
                  size="small"
                  onClick={() => {
                    onAddElaborator(
                      professional,
                      !isElaborator,
                      'professionals',
                    );
                  }}
                >
                  <Icon
                    component={isElaborator ? SStarFullIcon : SStarIcon}
                    sx={{ fontSize: '1.2rem', ...(isElaborator ? {} : {}) }}
                    {...(isElaborator ? { color: 'primary' } : {})}
                  />
                </SIconButton>
              </STooltip>
            </>
          );
        }}
      />
    </SFlex>
  );
};
