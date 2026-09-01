/**
 * npx tsx src/components/organisms/tables/DocumentModelTable/document-model-presentation-theme.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  documentModelAddSectionButtonSx,
  documentModelClassicEditorInfoChipSx,
  documentModelClassicEditorPrimaryChipSx,
  documentModelClassicEditorSuccessChipSx,
  documentModelClassicSheetSx,
  documentModelDestructiveButtonSx,
  documentModelDirtyActionButtonSx,
  documentModelIdentityActionButtonSx,
  documentModelIdentityPillSx,
  documentModelNeutralChipSx,
  documentModelNeutralPillSx,
  documentModelScopePillBaseSx,
  documentModelSidebarActionButtonSx,
  documentModelV2ToolbarButtonSx,
  documentModelV2ToolbarIconButtonSx,
  documentModelWizardTabsSx,
  getDocumentModelSaveActionButtonSx,
} from './document-model-presentation-theme';

function readRel(rel: string) {
  return fs.readFileSync(path.join(__dirname, rel), 'utf8');
}

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

run('identity pills never use white text on yellow', () => {
  assert.equal(
    documentModelIdentityPillSx.backgroundColor,
    'primary.identityBackground',
  );
  assert.equal(documentModelIdentityPillSx.color, 'primary.identityOn');
  assert.notEqual(documentModelIdentityPillSx.color, 'common.white');
  assert.notEqual(documentModelIdentityPillSx.color, 'primary.contrastText');
});

run('neutral pills and chips use mode surfaces', () => {
  assert.equal(documentModelNeutralPillSx.backgroundColor, 'background.box');
  assert.equal(documentModelNeutralPillSx.color, 'text.primary');
  assert.equal(documentModelNeutralChipSx.backgroundColor, 'background.box');
});

run('wizard dark selected text is identity yellow', () => {
  const selected = documentModelWizardTabsSx['& .MuiTab-root']['&.Mui-selected'];
  assert.equal(selected.color({ palette: { mode: 'dark' } }), 'primary.main');
  assert.equal(selected.color({ palette: { mode: 'light' } }), 'text.primary');
  assert.equal(selected.fontWeight, 700);
});

run('classic sheet stays white', () => {
  assert.equal(documentModelClassicSheetSx.bgcolor, 'common.white');
});

run('LOCAL/SISTEMA pills are bold', () => {
  assert.equal(documentModelScopePillBaseSx.fontWeight, 700);
});

run('listing modal no longer forces grey.200', () => {
  const source = readRel(
    '../../modals/ModalViewDocumentModels/ModalViewDocumentModels.tsx',
  );
  assert.equal(source.includes("backgroundColor: 'grey.200'"), false);
  assert.equal(source.includes("backgroundColor: 'background.default'"), true);
});

run('status and classification filters use identityOn', () => {
  const status = readRel('./DocumentModelStatusFilters.tsx');
  const filters = readRel('./DocumentModelPgrClassificationFilters.tsx');
  const chips = readRel('./DocumentModelClassificationChips.tsx');
  assert.equal(status.includes('common.white'), false);
  assert.equal(filters.includes('common.white'), false);
  assert.equal(status.includes('getDocumentModelFilterPillSx'), true);
  assert.equal(filters.includes('getDocumentModelFilterPillSx'), true);
  assert.equal(chips.includes('documentModelNeutralChipSx'), true);
  assert.equal(chips.includes("backgroundColor: 'grey.300'"), false);
});

run('dados editor uses identity fill without changing toggle import', () => {
  const editor = readRel(
    '../../modals/ModalEditDocumentModel/components/1-data/components/DocumentModelClassificationEditor.tsx',
  );
  assert.equal(editor.includes('toggleDocumentModelClassification'), true);
  assert.equal(editor.includes('getExclusivePairsHintForDocumentType'), true);
  assert.equal(editor.includes('getDocumentModelFilterPillSx'), true);
  assert.equal(editor.includes("backgroundColor: 'grey.100'"), false);
});

run('variables LOCAL/SISTEMA stay local — SPageMenu default unchanged', () => {
  const variables = readRel(
    '../../modals/ModalEditDocumentModel/components/3-variables/VariablesStep.tsx',
  );
  const pageMenu = fs.readFileSync(
    path.join(__dirname, '../../../molecules/SPageMenu/index.tsx'),
    'utf8',
  );
  assert.equal(variables.includes('SPageMenu'), false);
  assert.equal(variables.includes('getDocumentModelFilterPillSx'), true);
  assert.equal(variables.includes('documentModelScopePillBaseSx'), true);
  assert.equal(pageMenu.includes('identityOn'), false);
  assert.equal(pageMenu.includes('STagButton'), true);
});

run('document chrome uses mode surfaces; V2 sheet stays #fff', () => {
  const stepStyles = readRel(
    '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/styles.ts',
  );
  const topButtons = readRel(
    '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
  );
  const tree = readRel('../../documentModel/DocumentModelTree/DocumentModelTree.tsx');
  const v2Page = readRel(
    '../../documentModel/editor-v2/integration/document-editor-v2-page-layout-sx.ts',
  );
  const content = readRel(
    '../../documentModel/DocumentModelContent/DocumentModelContent.tsx',
  );
  assert.equal(stepStyles.includes('grey[200]'), false);
  assert.equal(stepStyles.includes('background.paper'), true);
  assert.equal(topButtons.includes("backgroundColor: 'grey.50'"), false);
  assert.equal(topButtons.includes("backgroundColor: 'background.paper'"), true);
  assert.equal(tree.includes('ThemeProvider'), false);
  assert.equal(tree.includes('CssBaseline'), false);
  assert.equal(v2Page.includes("backgroundColor: '#fff'"), true);
  assert.equal(content.includes('document-model-classic-sheet'), true);
  assert.equal(content.includes('DocumentModelPrintTheme'), true);
  assert.equal(content.includes('TypeSectionItem'), true);
});

run('identity action buttons keep dark text on yellow', () => {
  assert.equal(
    documentModelIdentityActionButtonSx.backgroundColor,
    'primary.identityBackground',
  );
  assert.equal(documentModelIdentityActionButtonSx.color, 'primary.identityOn');
  assert.equal(documentModelSidebarActionButtonSx.width, '100%');
  assert.equal(documentModelSidebarActionButtonSx.minHeight, 52);
});

run('dirty paint is scale orange, delete is outlined error, state mapping unchanged', () => {
  assert.equal(
    documentModelDirtyActionButtonSx.backgroundColor,
    'scale.mediumHigh',
  );
  assert.notEqual(
    documentModelDirtyActionButtonSx.backgroundColor,
    documentModelIdentityActionButtonSx.backgroundColor,
  );
  assert.notEqual(documentModelDirtyActionButtonSx.backgroundColor, 'warning.main');
  assert.notEqual(documentModelDirtyActionButtonSx.backgroundColor, 'error.main');
  assert.equal(documentModelDirtyActionButtonSx.color, 'primary.identityOn');
  assert.equal(
    documentModelDirtyActionButtonSx['& .MuiIcon-root, & .MuiSvgIcon-root, & svg']
      .color,
    documentModelDirtyActionButtonSx.color,
  );
  assert.equal(documentModelDestructiveButtonSx.backgroundColor, 'transparent');
  assert.equal(documentModelDestructiveButtonSx.color, 'error.main');
  assert.equal(
    getDocumentModelSaveActionButtonSx('primary.main'),
    documentModelIdentityActionButtonSx,
  );
  assert.equal(
    getDocumentModelSaveActionButtonSx('error.main'),
    documentModelDirtyActionButtonSx,
  );
  assert.equal(
    getDocumentModelSaveActionButtonSx('error'),
    documentModelDirtyActionButtonSx,
  );
});

run('save dirty color is state-driven again; Baixar keeps identity', () => {
  const blank = readRel('../../modals/ModalBlank/ModalBlank.tsx');
  const globalModal = fs.readFileSync(
    path.join(__dirname, '../../../../layouts/default/modal/index.tsx'),
    'utf8',
  );
  const topButtons = readRel(
    '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
  );
  const dataStep = readRel(
    '../../modals/ModalEditDocumentModel/components/1-data/DataStep.tsx',
  );
  const sidebar = readRel(
    '../../documentModel/section-propagation/DocumentModelSectionPropagationAction.tsx',
  );
  const v2Page = readRel(
    '../../documentModel/editor-v2/integration/document-editor-v2-page-layout-sx.ts',
  );
  const v2View = readRel(
    '../../documentModel/editor-v2/integration/DocumentEditorV2SectionView.tsx',
  );
  assert.equal(blank.includes("backgroundColor: 'grey.200'"), false);
  assert.equal(blank.includes("backgroundColor: 'background.paper'"), true);
  assert.equal(globalModal.includes('color="text.primary"'), true);
  assert.equal(topButtons.includes('saveActionColor'), true);
  assert.equal(topButtons.includes('error.main'), true);
  assert.equal(topButtons.includes('isDirty'), true);
  assert.equal(topButtons.includes('v2Session.v2LocalDirty'), true);
  assert.equal(topButtons.includes('color={saveActionColor}'), true);
  assert.equal(
    topButtons.includes('getDocumentModelSaveActionButtonSx(saveActionColor)'),
    true,
  );
  assert.equal(topButtons.includes("iconColor=\"inherit\""), true);
  assert.equal(topButtons.includes('documentModelDestructiveButtonSx'), true);
  assert.equal(dataStep.includes("isDirty ? 'error'"), true);
  assert.equal(dataStep.includes('color: saveActionColor'), true);
  assert.equal(
    dataStep.includes('getDocumentModelSaveActionButtonSx(saveActionColor)'),
    true,
  );
  assert.equal(dataStep.includes('documentModelDestructiveButtonSx'), true);
  assert.equal(sidebar.includes('documentModelSidebarActionButtonSx'), true);
  assert.equal(v2Page.includes("backgroundColor: '#fff'"), true);
  assert.equal(v2View.includes('DocumentModelPrintTheme'), true);
  assert.equal(v2View.includes('requestSurface'), false);
});

run('v2 toolbar presets apply on the real controls, not only a wrapper', () => {
  assert.equal(documentModelV2ToolbarButtonSx['&&'].color, 'text.secondary');
  assert.equal(
    documentModelV2ToolbarButtonSx['&&'].backgroundColor,
    'background.paper',
  );
  assert.equal(
    documentModelV2ToolbarButtonSx['&&'].borderColor,
    'background.border',
  );
  assert.equal(
    documentModelV2ToolbarButtonSx['&&.MuiButton-contained'].backgroundColor,
    'primary.identityBackground',
  );
  assert.equal(
    documentModelV2ToolbarButtonSx['&&.MuiButton-contained'].color,
    'primary.identityOn',
  );
  assert.equal(
    documentModelV2ToolbarButtonSx['&&.MuiButton-contained'][
      '& .MuiIcon-root, & .MuiSvgIcon-root, & svg'
    ].color,
    documentModelV2ToolbarButtonSx['&&.MuiButton-contained'].color,
  );
  assert.equal(
    documentModelV2ToolbarButtonSx['&&.Mui-disabled'].color,
    'text.disabled',
  );
  assert.equal(documentModelV2ToolbarButtonSx['&&.Mui-disabled'].opacity, 1);
  assert.equal(documentModelV2ToolbarIconButtonSx['&&'].color, 'text.secondary');
  const toolbar = readRel(
    '../../documentModel/editor-v2/integration/DocumentEditorV2Toolbar.tsx',
  );
  const format = readRel(
    '../../documentModel/editor-v2/integration/DocumentEditorV2TextFormatControls.tsx',
  );
  assert.equal(toolbar.includes('documentModelV2ToolbarChromeSx'), false);
  assert.equal(toolbar.includes('documentModelV2ToolbarButtonSx'), true);
  assert.equal(toolbar.includes('documentModelV2ToolbarIconButtonSx'), true);
  assert.equal(toolbar.includes('documentModelV2ToolbarSelectSx'), true);
  assert.equal(toolbar.includes('documentModelV2ToolbarControlColor'), true);
  assert.equal(toolbar.includes('color={documentModelV2ToolbarControlColor}'), true);
  assert.equal(format.includes('documentModelV2ToolbarButtonSx'), true);
  assert.equal(format.includes('documentModelV2ToolbarIconButtonSx'), true);
  assert.equal(format.includes('documentModelV2ToolbarSelectSx'), true);
  assert.equal(format.includes('color={documentModelV2ToolbarControlColor}'), true);
  assert.equal(toolbar.includes('createBlockFormatTransaction'), true);
  assert.equal(toolbar.includes('toggleBold'), true);
  assert.equal(toolbar.includes('toggleItalic'), true);
  assert.equal(toolbar.includes('toggleUnderline'), true);
  assert.equal(toolbar.includes('promptExternalLink'), true);
  assert.equal(toolbar.includes("isActive('bold')"), true);
  assert.equal(format.includes('createInlineStyleTransaction'), true);
  assert.equal(format.includes('ui.superscript === true'), true);
  assert.equal(format.includes('ui.subscript === true'), true);
  assert.equal(format.includes('disabled={!ui.inlineEnabled}'), true);
  assert.equal(format.includes('disabled={!ui.blockEnabled}'), true);
});

run('classic paragraph bar reuses approved delete/save paint and unifies icon+text', () => {
  const item = readRel(
    '../../documentModel/DocumentModelContent/TypeSectionItem/ItemWrapper.tsx',
  );
  const remove = readRel(
    '../../documentModel/DocumentModelContent/TypeSectionItem/RemoveDoubleClickButton.tsx',
  );
  assert.equal(
    documentModelClassicEditorPrimaryChipSx.color,
    'primary.identityOn',
  );
  assert.equal(documentModelClassicEditorInfoChipSx.color, 'info.dark');
  assert.equal(documentModelClassicEditorSuccessChipSx.color, 'success.dark');
  assert.equal(
    documentModelClassicEditorPrimaryChipSx[
      '&& .text_main, && .icon_main, && .MuiIcon-root, && .MuiSvgIcon-root, && svg'
    ].color,
    documentModelClassicEditorPrimaryChipSx.color,
  );
  assert.equal(item.includes('documentModelDestructiveButtonSx'), true);
  assert.equal(item.includes('documentModelIdentityActionButtonSx'), true);
  assert.equal(item.includes('documentModelClassicEditorPrimaryChipSx'), true);
  assert.equal(item.includes('documentModelClassicEditorInfoChipSx'), true);
  assert.equal(item.includes('documentModelClassicEditorSuccessChipSx'), true);
  assert.equal(item.includes("color: 'primary.main'"), false);
  assert.equal(item.includes("color: 'success.main'"), false);
  assert.equal(item.includes('handleDuplicate'), true);
  assert.equal(item.includes('closeEditor'), true);
  assert.equal(item.includes('handleDelete(item)'), true);
  assert.equal(remove.includes("bg: 'error.dark'"), true);
  assert.equal(remove.includes('documentModelDestructiveButtonSx'), false);
});

run('editor add section button uses identity, not success green', () => {
  assert.equal(
    documentModelAddSectionButtonSx.backgroundColor,
    'primary.identityBackground',
  );
  assert.equal(
    documentModelAddSectionButtonSx['& .text_main'].color,
    'primary.identityOn',
  );
  const search = readRel(
    '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/SearchIndex/SearchIndex.tsx',
  );
  assert.equal(search.includes("bg=\"success.main\""), false);
  assert.equal(search.includes("bg=\"primary.identityBackground\""), true);
  assert.equal(search.includes('documentModelAddSectionButtonSx'), true);
  assert.equal(search.includes('setDocumentAddSection'), true);
});

run('shared defaults stay untouched', () => {
  const sTabs = fs.readFileSync(
    path.join(__dirname, '../../../molecules/STabs/index.tsx'),
    'utf8',
  );
  const sTable = fs.readFileSync(
    path.join(__dirname, '../../../atoms/STable/styles.ts'),
    'utf8',
  );
  const sModal = fs.readFileSync(
    path.join(
      __dirname,
      '../../../molecules/SModal/components/SModalPaper/styles.ts',
    ),
    'utf8',
  );
  const sTag = fs.readFileSync(
    path.join(__dirname, '../../../atoms/STagButton/styles.ts'),
    'utf8',
  );
  assert.equal(sTabs.includes('primary.onSoftBackground'), true);
  assert.equal(sTable.includes('background.paper'), true);
  assert.equal(sModal.includes('background.paper'), true);
  assert.equal(sTag.includes('primary.contrastText'), false);
  assert.equal(sTag.includes('primary.main'), true);
});

console.log('\ndocument-model-presentation-theme.spec.ts ok');
