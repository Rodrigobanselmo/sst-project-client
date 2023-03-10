interface InlineStyle {
  offset: number;
  length: number;
  style: string;
}

interface TextObject {
  text: string;
  inlineStyle: InlineStyle[];
}

export function parseInlineStyleText(str: string) {
  const output: TextObject = {
    text: '',
    inlineStyle: [],
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
      style: 'bold',
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
      style: 'superscript',
    });
    output.text += match[1];
    lastIndex = match.index + match[0].length;
  }

  newStr = str.replaceAll('**', '').replaceAll('^^', '');
  output.text = '';
  lastIndex = 0;
  match;
  while ((match = linkPattern.exec(newStr)) !== null) {
    output.text += newStr.slice(lastIndex, match.index);
    output.inlineStyle.push({
      offset: output.text.length,
      length: match[1].length,
      style: 'link',
    });
    output.text += match[1];
    lastIndex = match.index + match[0].length;
  }

  output.text += newStr.slice(lastIndex);

  return output;
}
