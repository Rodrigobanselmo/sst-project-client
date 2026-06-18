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
import { useWatch } from 'react-hook-form';

import SStarFullIcon from 'assets/icons/SStarFullIcon';
import SStarIcon from 'assets/icons/SStarIcon';

import { IProfessional } from 'core/interfaces/api/IProfessional';
import { intMask } from 'core/utils/masks/int.mask';

import { formatValidityRangePreview } from '../../../helpers/document-dates.helpers';
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

  const documentCreatedAt = useWatch({ control, name: 'documentCreatedAt' });
  const validityYears = useWatch({ control, name: 'validityYears' });
  const validityMonths = useWatch({ control, name: 'validityMonths' });

  const validityPreview = formatValidityRangePreview(
    documentCreatedAt,
    validityYears,
    validityMonths,
  );

  return (
    <SFlex width={['100%']} gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14} mb={-2}>
        Prazo de vigência
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
          defaultValue={String(data?.validityYears ?? 2)}
          label="Anos"
          control={control}
          placeholder={'0'}
          name="validityYears"
          size="small"
          smallPlaceholder
          mask={intMask.apply}
        />
        <InputForm
          setValue={setValue}
          defaultValue={String(data?.validityMonths ?? 0)}
          label="Meses"
          control={control}
          placeholder={'0'}
          name="validityMonths"
          size="small"
          smallPlaceholder
          mask={intMask.apply}
        />
      </Box>
      {validityPreview && (
        <SText color="text.secondary" fontSize={13}>
          Vigência: {validityPreview}
        </SText>
      )}
      <SText color="text.secondary" fontSize={12}>
        A data inicial da vigência é sempre a Data de Criação do documento.
      </SText>
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
              <STooltip withWrapper title="Assinar Documento">
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
              <STooltip withWrapper title="Elaborador Documento">
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
