import { EventEmitter } from "events";
import { KeyPressEvent } from "./types/KeyPressEvent";
import { Window } from "./Window";
import stringWidth from "string-width";
import readline from "readline";
import chalk, { Chalk } from "chalk";

const join = (...args: string[]) => args.join('');

export abstract class Control extends EventEmitter {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  focused: boolean = false;
  cursorX: number = 0;
  cursorY: number = 0;

  constructor() {
    super();
  }

  public abstract keyPress(event: KeyPressEvent): this;
  public abstract update(window: Window): this;
  public abstract quickUpdate(window: Window): this;

  public write(stdout: NodeJS.WriteStream, x: number, y: number, text: string, colorFunc: Chalk = chalk.rgb(255, 255, 255)): this {
    if (text.length === 0) return this;
    readline.cursorTo(stdout, x, y);
    stdout.write(colorFunc(text));
    return this;
  }

  public writeBordered(
    stdout: NodeJS.WriteStream,
    x: number,
    y: number,
    left: string,
    right: string,
    text: string,
    leftColorFunc: Chalk = chalk.rgb(255, 255, 255),
    rightColorFunc: Chalk = chalk.rgb(255, 255, 255),
    textColorFunc: Chalk = chalk.rgb(255, 255, 255),
  ): this {
    readline.cursorTo(stdout, x, y);
    stdout.write(
      leftColorFunc(left)
      + textColorFunc(text)
      + rightColorFunc(right)
    );
    return this;
  }

  truncate(input: string, maxWidth: number): string {
    const chars = input.match(/./ug)!;
    let effectiveString = "";
    let width = 0;
    for (let i = 0; i < chars.length; i++) {
      width = stringWidth(effectiveString + chars[i]);
      if (width > maxWidth) break;
      effectiveString += chars[i];
    }
    return effectiveString;
  }
}
