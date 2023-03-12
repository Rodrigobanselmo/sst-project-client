export function rgbToHex(
  r: number | string,
  g: number | string,
  b: number | string,
) {
  // Convert each component to its hexadecimal equivalent
  const red = Number(r).toString(16).padStart(2, '0');
  const green = Number(g).toString(16).padStart(2, '0');
  const blue = Number(b).toString(16).padStart(2, '0');

  // Combine the three hexadecimal values in the order of red, green, and blue
  const hexCode = `#${red}${green}${blue}`;

  return hexCode;
}
