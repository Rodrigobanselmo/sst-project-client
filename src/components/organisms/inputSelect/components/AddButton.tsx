import React from 'react';

import SText from 'components/atoms/SText';

export const AddButton = (props: { onAddExam: () => void }) => {
  return (
    <SText
      fontSize="14px"
      color={'common.white'}
      onClick={(e) => {
        e.stopPropagation();
        props?.onAddExam();
      }}
      sx={{
        position: 'absolute',
        textAlign: 'center',
        verticalAlign: 'middle',
        borderRadius: '50%',
        cursor: 'pointer',
        bottom: 10,
        right: 10,
        height: 20,
        width: 20,
        backgroundColor: 'success.main',
        '&:hover': {
          backgroundColor: 'success.dark',
        },
      }}
    >
      +
    </SText>
  );
};
