import { Control } from "./Control";
import { Window } from "./Window";
import chalk, { Chalk } from "chalk";
import stringWidth from "string-width";
import { KeyPressEvent } from "./types/KeyPressEvent";

export class Label extends Control {
  public readonly height = 1;
  public textColorFunc: Chalk = chalk.rgb(255, 255, 255);
  public text: string = "";

  constructor() {
    super();
  }

  setColor(color: number): this {
    this.textColorFunc = chalk.rgb(
      (color >> 16) & 255,
      (color >> 8) & 255,
      color & 255,
    );
    return this;
  }

  update(window: Window): this {
    // parse the characters
    const chars = this.text.match(/./ug)!;
    if (!chars || chars.length === 0) return this;

    // mutable variables
    let text: string = "";
    let length: number = 0;
    let width: number = 0;

    for (const char of chars) {
      width = stringWidth(char);
      if ((width + length) > this.width) {
        break;
      }
      text += char;
      length += width;
    }


    this.write(window.stdout, this.x, this.y, text, this.textColorFunc);
    return this;
  }

  quickUpdate(window: Window): this {
    return this.update(window);
  }

  keyPress(event: KeyPressEvent): this { return this; }
}