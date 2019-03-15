import { EventEmitter } from "events";
import { KeyPressEvent } from "./types/KeyPressEvent";
import { Window } from "./Window";
import stringWidth from "string-width";
import readline from "readline";

const join = (...args: string[]) => args.join('');
type ColorFunc = (...args: string[]) => string;


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

  public abstract keyPress(event: KeyPressEvent): void;
  public abstract update(window: Window): void;
  public abstract quickUpdate(window: Window): void;

  public write(stdout: NodeJS.WriteStream, x: number, y: number, text: string, colorFunc: ColorFunc = join): void {
    if (text.length === 0) return;
    readline.cursorTo(stdout, x, y);
    stdout.write(colorFunc(text));
  }

  public writeBordered(
    stdout: NodeJS.WriteStream,
    x: number,
    y: number,
    left: string,
    right: string,
    text: string,
    leftColorFunc: ColorFunc = join,
    rightColorFunc: ColorFunc = join,
    textColorFunc: ColorFunc = join,
  ): void {
    readline.cursorTo(stdout, x, y);
    stdout.write(
      leftColorFunc(left)
      + textColorFunc(text)
      + rightColorFunc(right)
    );
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
