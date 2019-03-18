import { EventEmitter } from "events";
import chalk, { Chalk } from "chalk";
import readline from "readline";
import { Control } from "./Control";
import { truncate } from "./util/truncate";
import keypress from "decode-keypress";
import { KeyPressEvent } from "./util/KeyPressEvent";

const zIndex = (left: Control, right: Control) => left.z - right.z;

export class Window extends EventEmitter {
  public controls: Control[] = [];

  constructor() {
    super();
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    if (process.stdout.isTTY) {
      process.stdin.setEncoding('utf8');
      // @ts-ignore
      process.stdin.setRawMode(true);

      process.stdin.on("data", data => this.onData(data));
    }
  }

  onData(data: any): this {
    const key = keypress(data);

    // sigint
    if (key.name === "c" && key.ctrl) {
      process.exit();
    }

    for (const control of this.controls) {
      if (control.focused) {
        const event: KeyPressEvent = {
          sequence: key,
          window: this,
          target: control,
        };
        control.onKeyPress(event);
        control.emit("keypress", event);
        this.update();
        return this;
      }
    }

    return this;
  }

  update(hard: boolean = false): this {
    if (hard) {
      this.controls.sort(zIndex);
      readline.cursorTo(process.stdout, 0, 0);
      readline.clearScreenDown(process.stdout);
    }

    for (const control of this.controls) {
      const { x, y, width, height } = control;

      let i: number = 0;
      const result = control.render()
        .map(line => truncate(line, width));

      /**
       * For debugging purposes, we draw the rendered state to the top left corner.
       */
      for (let j = 0; j < control.debug.length; j++) {
        readline.cursorTo(process.stdout, 0, j);
        process.stdout.write(control.debug[j]);
      }
      control.debug = [];


      /**
       * Loop over each line, and compare it to the previous lines, and render them if they are different.
       */
      for (; i < control.lines.length && i < result.length && i < height; i++) {
        const line = result[i];
        if (control.lines[i] !== line) {
          readline.cursorTo(process.stdout, x, y + i);
          process.stdout.write(line);
        }
      }

      /**
       * Loop over new lines added to the end, and render them.
       */
      for(; i < result.length && i < height; i++) {
        const line = result[i];
        readline.cursorTo(process.stdout, x, y + i);
        process.stdout.write(line);
      }

      control.lines = result;
    }

    return this;
  }

  add(control: Control): this {
    if (!this.controls.includes(control)) this.controls.push(control);
    return this;
  }

  focus(target: Control): this {
    for (const control of this.controls) {
      control.focused = target === control;
    }
    return this;
  }
}