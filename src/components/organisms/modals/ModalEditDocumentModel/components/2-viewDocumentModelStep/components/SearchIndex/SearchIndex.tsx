import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { SectionTypeModelSelect } from 'components/organisms/tagSelects/SectionTypeModelSelect/SectionTypeModelSelect';
import { DocumentModelSectionPropagationAction } from 'components/organisms/documentModel/section-propagation/DocumentModelSectionPropagationAction';
import { documentModelAddSectionButtonSx } from 'components/organisms/tables/DocumentModelTable/document-model-presentation-theme';
import { setDocumentAddSection } from 'store/reducers/document/documentSlice';
import { v4 } from 'uuid';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { IUseViewDocumentModel } from '../../hooks/useViewDocumentModel';

export const SearchIndex = (props: IUseViewDocumentModel) => {
  const handleAddSection = (section: IDocumentModelFull['sections'][0]) => {
    props.dispatch(
      setDocumentAddSection({
        section: { id: v4(), section: true, type: section.type },
      }),
    );
  };
  return (
    <Box zIndex={100} position="sticky" top={0} p={5} sx={{ backgroundColor: 'background.paper' }}>
      <SInput
        unstyled
        endAdornment={
          <SFlex center height={'100%'}>
            {props.model?.sections && (
              <SectionTypeModelSelect
                sections={props.model?.sections}
                selected={''}
                text="+"
                minWidth={20}
                active
                bg="primary.identityBackground"
                marginRight="10px"
                sx={documentModelAddSectionButtonSx}
                handleSelect={(value) => value && handleAddSection(value)}
              />
            )}
          </SFlex>
        }
        startAdornment={<SearchIcon sx={{ fontSize: '22px', mt: 0 }} />}
        size="small"
        superSmall
        variant="outlined"
        placeholder={'Pesquisar...'}
        autoFocus
        fullWidth
      />
      <DocumentModelSectionPropagationAction
        companyId={props.data?.companyId}
        modelId={props.data?.id}
        isDirty={props.isDirty}
        saveBusy={props.saveBusy}
        linkedSaveEvent={props.linkedSaveEvent}
        onLinkedSaveSettled={props.onLinkedSaveSettled}
      />
    </Box>
  );
};
