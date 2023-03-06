import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

import { IUseViewDocumentModel } from '../../hooks/useViewDocumentModel';

export const SearchIndex = (props: IUseViewDocumentModel) => {
  return (
    <Box zIndex={100} position="sticky" top={0} p={5}>
      <SInput
        unstyled
        startAdornment={<SearchIcon sx={{ fontSize: '22px', mt: 0 }} />}
        size="small"
        superSmall
        variant="outlined"
        placeholder={'Pesquisar...'}
        autoFocus
        fullWidth
      />
    </Box>
  );
};
