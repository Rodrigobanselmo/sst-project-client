import { InlineStyleTypeEnum } from 'project/enum/document-model.enum';

interface InlineStyle {
  offset: number;
  length: number;
  style: InlineStyleTypeEnum;
  value?: string;
}

interface InlineEntity {
  offset: number;
  length: number;
  data?: {
    type: string;
    mutability: string;
    data: {
      url: string;
      targetOption: string;
    };
  };
}

interface TextObject {
  text: string;
  inlineStyle: InlineStyle[];
  inlineEntity: InlineEntity[];
}

export function parseInlineStyleText(str: string) {
  const output: TextObject = {
    text: '',
    inlineStyle: [],
    inlineEntity: [],
  };
  const boldPattern = /\*\*(.*?)\*\*/g;
  const inlinePattern = /\^\^(.*?)\^\^/g;
  const linkPattern = /<link>(.*?)<link>/g;

  let lastIndex = 0;
  let match;

  let newStr = str.replaceAll('^^', '').replaceAll('<link>', '');
  while ((match = boldPattern.exec(newStr)) !== null) {
    output.text += newStr.slice(lastIndex, match.index);
    output.inlineStyle.push({
      offset: output.text.length,
      length: match[1].length,
      style: InlineStyleTypeEnum.BOLD,
    });
    output.text += match[1];
    lastIndex = match.index + match[0].length;
  }

  newStr = str.replaceAll('**', '').replaceAll('<link>', '');
  lastIndex = 0;
  match;
  output.text = '';
  while ((match = inlinePattern.exec(newStr)) !== null) {
    output.text += newStr.slice(lastIndex, match.index);
    output.inlineStyle.push({
      offset: output.text.length,
      length: match[1].length,
      style: InlineStyleTypeEnum.SUPERSCRIPT,
    });
    output.text += match[1];
    lastIndex = match.index + match[0].length;
  }

  newStr = str.replaceAll('**', '').replaceAll('^^', '');
  output.text = '';
  lastIndex = 0;
  match;
  while ((match = linkPattern.exec(newStr)) !== null) {
    const texts = match[1].split('|');
    output.text += newStr.slice(lastIndex, match.index);
    output.inlineEntity.push({
      offset: output.text.length,
      length: texts[1].length,
      data: {
        type: 'LINK',
        mutability: 'MUTABLE',
        data: {
          url: texts[0],
          targetOption: '_blank',
        },
      },
    });
    output.text += texts[1];
    lastIndex = match.index + match[0].length;
  }

  output.text += newStr.slice(lastIndex);

  return output;
}
