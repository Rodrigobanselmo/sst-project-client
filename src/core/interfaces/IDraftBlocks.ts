/* eslint-disable @typescript-eslint/no-namespace */
import { SVGAttributes } from 'react';

export enum DraftInlineStyleEnum {
  ITALIC = 'ITALIC',
  BOLD = 'BOLD',
  UNDERLINE = 'UNDERLINE',
}

export enum DraftTypeEnum {
  NUMBER_LIST = 'ordered-list-item',
  BULLET_LIST = 'UNORDERED',
  NORMAL = 'unstyled',
}

export enum DraftTextAlignEnum {
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
  LEFT = 'left',
}

export declare namespace IDraftTypes {
  export interface InlineStyleRange {
    offset: number;
    length: number;
    style: DraftInlineStyleEnum;
  }

  export interface Data {
    'text-align': DraftTextAlignEnum;
  }

  export interface Block {
    key: string;
    text: string;
    type: DraftTypeEnum;
    depth: number;
    inlineStyleRanges: InlineStyleRange[];
    entityRanges: any[];
    data: Data;
  }

  export interface EntityMap {}

  export interface RootObject {
    blocks: Block[];
    entityMap: EntityMap;
  }
}
