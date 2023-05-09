import React from 'react';
import styled from '@emotion/styled';

export const SCheckBoxInputNormal = styled.input`
  &[type='checkbox'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
  &[type='checkbox']:checked {
    background-color: #f00; /* Change the color here */
  }
`;
