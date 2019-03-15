import { Control } from "./Control";
import { Window } from "./Window";
import chalk from "chalk";
import readline from "readline";
import stringWidth from "string-width";
import { KeyPressEvent } from "./types/KeyPressEvent";

export class Label extends Control {
  public readonly height = 1;
  public textColor: number = 0xFFFFFF;
  public text: string = "";

  constructor() {
    super();
  }

  update(window: Window): void {
    // parse the characters
    const chars = this.text.match(/./ug)!;
    if (!chars || chars.length === 0) return;

    // get the chalk color func
    const colorFunc = chalk.rgb(
      (this.textColor >> 16) & 255,
      (this.textColor >> 8) & 255,
      this.textColor & 255,
    );

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

    // write to stdout
    const stdout = window.stdout;
    readline.cursorTo(stdout, this.x, this.y);
    stdout.write(colorFunc(text) + chalk.reset(""));
  }

  quickUpdate(window: Window): void {
    this.update(window);
  }

  keyPress(event: KeyPressEvent): void {}
}