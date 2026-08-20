import { ElementType } from 'react';

import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import CropLandscapeOutlinedIcon from '@mui/icons-material/CropLandscapeOutlined';
import CropPortraitOutlinedIcon from '@mui/icons-material/CropPortraitOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertPageBreakOutlinedIcon from '@mui/icons-material/InsertPageBreakOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SubjectOutlinedIcon from '@mui/icons-material/SubjectOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import { SvgIconComponent } from '@mui/icons-material';

import { DocModelPageOrientation } from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
} from 'project/enum/document-model.enum';

export type DocumentModelInsertVisualFamily = 'content' | 'structure';

export const DOCUMENT_MODEL_INSERT_VISUAL = {
  content: {
    borderActive: 'info' as const,
    buttonIcon: ArticleOutlinedIcon,
    menuFallbackIcon: TextFieldsOutlinedIcon,
    menuIconColor: 'info.dark',
  },
  structure: {
    borderActive: 'primary' as const,
    buttonIcon: AccountTreeOutlinedIcon,
    menuFallbackIcon: LayersOutlinedIcon,
    menuIconColor: 'primary.dark',
  },
} as const;

const HEADING_ICON = TitleOutlinedIcon;

const CONTENT_ELEMENT_ICON_MAP: Partial<
  Record<DocumentSectionChildrenTypeEnum, SvgIconComponent>
> = {
  [DocumentSectionChildrenTypeEnum.PARAGRAPH]: NotesOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.BULLET]: FormatListBulletedOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.BULLET_SPACE]: FormatListBulletedOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.TITLE]: TitleOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.H1]: HEADING_ICON,
  [DocumentSectionChildrenTypeEnum.H2]: HEADING_ICON,
  [DocumentSectionChildrenTypeEnum.H3]: HEADING_ICON,
  [DocumentSectionChildrenTypeEnum.H4]: HEADING_ICON,
  [DocumentSectionChildrenTypeEnum.H5]: HEADING_ICON,
  [DocumentSectionChildrenTypeEnum.H6]: HEADING_ICON,
  [DocumentSectionChildrenTypeEnum.BREAK]: InsertPageBreakOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.SECTION_BREAK]: CropPortraitOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.IMAGE]: ImageOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE]: SubjectOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE]: ImageOutlinedIcon,
  [DocumentSectionChildrenTypeEnum.LEGEND]: SubjectOutlinedIcon,
};

const STRUCTURAL_SECTION_ICON_MAP: Partial<
  Record<DocumentSectionTypeEnum, SvgIconComponent>
> = {
  [DocumentSectionTypeEnum.SECTION]: ViewAgendaOutlinedIcon,
  [DocumentSectionTypeEnum.CHAPTER]: AutoStoriesOutlinedIcon,
  [DocumentSectionTypeEnum.COVER]: ArticleOutlinedIcon,
  [DocumentSectionTypeEnum.TOC]: TocOutlinedIcon,
  [DocumentSectionTypeEnum.APR]: AssignmentOutlinedIcon,
  [DocumentSectionTypeEnum.ITERABLE_ENVIRONMENTS]: BusinessOutlinedIcon,
  [DocumentSectionTypeEnum.ITERABLE_CHARACTERIZATION]: EngineeringOutlinedIcon,
};

const STRUCTURAL_SECTION_ICON_MAP_BY_KEY: Record<string, SvgIconComponent> = {
  APR_GROUP: GroupWorkOutlinedIcon,
  ACTION_PLAN: ChecklistOutlinedIcon,
  PERICULOSIDADE_ACTIVITIES: AssignmentOutlinedIcon,
  INSALUBRIDADE_ACTIVITIES: AssignmentOutlinedIcon,
};

type ContentElementMeta = {
  isParagraph?: boolean;
  isBullet?: boolean;
  orientation?: DocModelPageOrientation;
};

type StructuralSectionMeta = {
  isSection?: boolean;
  isBreakSection?: boolean;
};

export function resolveContentElementInsertIcon(
  type: string,
  meta?: ContentElementMeta,
): SvgIconComponent {
  if (type === DocumentSectionChildrenTypeEnum.SECTION_BREAK) {
    return meta?.orientation === DocModelPageOrientation.LANDSCAPE
      ? CropLandscapeOutlinedIcon
      : CropPortraitOutlinedIcon;
  }

  const mapped =
    CONTENT_ELEMENT_ICON_MAP[type as DocumentSectionChildrenTypeEnum];
  if (mapped) return mapped;

  if (meta?.isBullet) return FormatListBulletedOutlinedIcon;
  if (meta?.isParagraph) return NotesOutlinedIcon;

  return DOCUMENT_MODEL_INSERT_VISUAL.content.menuFallbackIcon;
}

export function resolveStructuralSectionInsertIcon(
  type: string,
  meta?: StructuralSectionMeta,
): SvgIconComponent {
  const mappedByEnum =
    STRUCTURAL_SECTION_ICON_MAP[type as DocumentSectionTypeEnum];
  if (mappedByEnum) return mappedByEnum;

  const mappedByKey = STRUCTURAL_SECTION_ICON_MAP_BY_KEY[type];
  if (mappedByKey) return mappedByKey;

  if (meta?.isSection) return ViewAgendaOutlinedIcon;

  if (type === DocumentSectionTypeEnum.TOC) return ListAltOutlinedIcon;
  if (type === DocumentSectionTypeEnum.COVER) return ArticleOutlinedIcon;
  if (type === DocumentSectionTypeEnum.CHAPTER) return AutoStoriesOutlinedIcon;

  if (meta?.isBreakSection) return AutoStoriesOutlinedIcon;

  return DOCUMENT_MODEL_INSERT_VISUAL.structure.menuFallbackIcon;
}

export function withContentInsertOptionIcon<
  T extends { type: string; orientation?: DocModelPageOrientation },
>(option: T): T & { icon: ElementType<any> } {
  return {
    ...option,
    icon: resolveContentElementInsertIcon(option.type, option),
  };
}

export function withStructuralInsertOptionIcon<
  T extends {
    type: string;
    isSection?: boolean;
    isBreakSection?: boolean;
  },
>(option: T): T & { icon: ElementType<any> } {
  return {
    ...option,
    icon: resolveStructuralSectionInsertIcon(option.type, option),
  };
}
