import { useRef, useState } from 'react';

import { Icon } from '@mui/material';
import { RiCloseCircleLine } from '@react-icons/all-files/ri/RiCloseCircleLine';
import { RiSearchLine } from '@react-icons/all-files/ri/RiSearchLine';

import { SInput } from '../../../../components/atoms/SInput';
import { useSidebarDrawer } from '../../../../core/contexts/SidebarContext';

// import { IconButtonStyle, InputStyle } from "./styles";
export function SearchBox(): JSX.Element {
  const { isOpen, open, setIsSearching } = useSidebarDrawer();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');

  function onClean() {
    setText('');
  }
  function onSearchButton() {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    open();
  }

  return (
    <SInput
      placeholder="Pesquisar..."
      onChange={(e) => setText(e.target.value)}
      inputRef={searchInputRef}
      secondary
      sx={{
        fontSize: 10,
        '& .MuiOutlinedInput-root': {
          fontSize: '0.9rem',
        },
      }}
      size="small"
      onFocus={() => setIsSearching(true)}
      onBlur={() => setIsSearching(false)}
      value={text}
      startAdornment={
        <Icon
          onClick={onSearchButton}
          component={RiSearchLine}
          sx={{
            transition: 'margin 0.8s ease',
            alignSelf: 'center',
            fontSize: '15px',
            color: 'gray.500',
            ml: isOpen ? 0 : '-5px',
          }}
        />
      }
      endAdornment={
        isOpen && text ? (
          <Icon
            onClick={onClean}
            component={RiCloseCircleLine}
            sx={{
              alignSelf: 'center',
              fontSize: '20px',
              color: 'gray.500',
              ml: -2,
              cursor: 'pointer',
            }}
          />
        ) : null
      }
    />
  );
}
