import chalk, { Chalk } from "chalk";
import { Control } from "./Control";
import stringWidth = require("string-width");

export class Label extends Control {
  public text: string = "";
  public colorFunc: Chalk = chalk.white;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.height = 1;
  }

  public setText(text: string): this {
    this.text = text;
    this.width = stringWidth(text);
    return this;
  }

  public setTextColor(color: number): this {
    this.colorFunc = chalk.rgb(
      (color >> 16) & 255,
      (color >> 8) & 255,
      color & 255,
    );
    return this;
  }

  public render(): string[] {
    return [this.colorFunc(this.text)];
  }
}
