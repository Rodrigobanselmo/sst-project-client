export function rgbToHex(r: number, g: number, b: number) {
  // Convert each component to its hexadecimal equivalent
  const red = r.toString(16).padStart(2, '0');
  const green = g.toString(16).padStart(2, '0');
  const blue = b.toString(16).padStart(2, '0');

  // Combine the three hexadecimal values in the order of red, green, and blue
  const hexCode = `#${red}${green}${blue}`;

  return hexCode;
}
