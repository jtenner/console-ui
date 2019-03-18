import { Chalk } from "chalk";
import stringWidth from "string-width";
import { truncate } from "./truncate";

export function renderBorder(left: string, center: string, right: string, leftColor: Chalk, centerColor: Chalk, rightColor: Chalk, width: number): string {
  const leftWidth = stringWidth(left);
  const rightWidth = stringWidth(right);
  const centerLine = truncate(center, width - leftWidth - rightWidth);
  const centerLineWidth = stringWidth(centerLine);
  const spaceCount = width - leftWidth - rightWidth - centerLineWidth;
  return leftColor(left) + centerColor(centerLine + " ".repeat(spaceCount)) + rightColor(right);
}
