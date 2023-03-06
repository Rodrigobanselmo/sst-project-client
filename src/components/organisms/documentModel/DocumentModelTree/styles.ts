import { Box, styled } from '@mui/material';

export const STStructContainer = styled(Box)`
  .nodeWrapper {
    align-items: center;
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    height: 32px;
    padding-inline-end: 8px;
    padding-inline-start: 8px;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    position: relative;
    z-index: 3;
  }

  .nodeWrapper:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  .nodeWrapperSection {
  }

  .nodeWrapperChildren {
  }

  .nodeWrapper .expandIconWrapper {
    align-items: center;
    font-size: 0;
    cursor: pointer;
    display: flex;
    height: 24px;
    justify-content: center;
    width: 24px;
    transform: rotate(0deg);
  }

  .nodeWrapper .expandIconWrapper.isOpen {
    transform: rotate(180deg);
  }

  .nodeWrapper .expandIconWrapper.isOpen svg path {
    fill: #4f5272;
  }

  .nodeWrapperSelected {
    color: blue;
  }

  .nodeWrapper .labelGridItem {
    padding-inline-start: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
  }

  .nodeWrapperSection .labelGridItem {
    font-weight: 600;
  }

  .nodeWrapperChildren .labelGridItem {
    background-color: #e7e7e7;
    padding-inline-start: 8px;
    margin-left: 8px;
    border-radius: 8px;
    font-size: 10px;
  }

  .pipeY {
    position: absolute;
    border-left: 2px solid #e7e7e7;
    left: -7px;
    top: -7px;
  }

  .pipeX {
    position: absolute;
    left: -7px;
    top: 15px;
    height: 2px;
    background-color: #e7e7e7;
    z-index: -1;
  }

  .wrapper {
    font-family: sans-serif;
  }

  .treeRoot {
    list-style-type: none;
    padding-inline-start: 0px;
    position: relative;
  }

  .treeRoot ul {
    list-style-type: none;
    padding-inline-start: 0px;
    position: relative;
    padding-bottom: 5px;
  }

  .treeRoot > li:after {
    display: none;
  }

  .wrapper .draggingSource {
    opacity: 0.3;
  }

  .wrapper .placeholder {
    position: relative;
  }

  .wrapper > ul > li > .nodeWrapper > div.pipeY {
    display: none;
  }

  .wrapper li:has(> .dropTarget) {
    outline: 3px solid #e8f0fe;
    border-radius: 4px;
  }
`;
