import stringWidth from "string-width";

export function truncate(line: string, count: number): string {
  // if there's no string to render, return empty string
  if (!line || count === 0)
    return "";
  // if the string is already <= count, return the line
  if (stringWidth(line) <= count)
    return line;
  // otherwise, add characters until it's too long
  let result: string = "";
  for (let i = 0; i < line.length; i++) {
    if (stringWidth(result + line[i]) <= count) {
      result += line[i];
    }
  }
  return result;
}
