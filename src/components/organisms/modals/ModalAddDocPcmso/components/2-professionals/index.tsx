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
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { TypeInputModal } from 'components/organisms/modals/ModalSingleInput';
import dayjs from 'dayjs';

import SStarFullIcon from 'assets/icons/SStarFullIcon';
import SStarIcon from 'assets/icons/SStarIcon';

import { IProfessional } from 'core/interfaces/api/IProfessional';
import { dateToString } from 'core/utils/date/date-format';
import { dateMonthMask } from 'core/utils/masks/date.mask';

import { IUseAddCompany } from '../../hooks/useHandleActions';
import { useStep } from './hooks/useStep';

export const ProfessionalModalStep = (props: IUseAddCompany) => {
  const {
    onSubmit,
    control,
    onAddSigner,
    onPrevStep,
    loading,
    onAddArray,
    onDeleteArray,
    onAddElaborator,
  } = useStep(props);

  const { data } = props;
  const buttons = [
    {
      text: 'Voltar',
    },
    {
      text: 'Confirmar Dados',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <div>
      <AnimatedStep>
        <SFlex width={['100%', 600]} gap={8} direction="column" mt={8}>
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
              defaultValue={
                dateToString(data?.validityEnd, 'MM/YYYY') ||
                (data.complementarySystems.length > 0
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
              const isSigner = professional?.professionalPgrSignature?.isSigner;
              const isElaborator =
                professional?.professionalPgrSignature?.isElaborator;
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
                          isSigner
                            ? BorderColorIcon
                            : DriveFileRenameOutlineIcon
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
      </AnimatedStep>
      <SModalButtons loading={loading} onClose={onPrevStep} buttons={buttons} />
    </div>
  );
};
