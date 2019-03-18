import { EventEmitter } from "events";
import { Control } from "./Control";
import decodeKeypress, { KeySequence } from "decode-keypress";
import { KeyPressEvent } from "./types/KeyPressEvent";
import readline from "readline";
import chalk from "chalk";

const { stdin, stdout } = process;

export class Window extends EventEmitter {
  public stdin = stdin;
  public stdout = stdout;

  constructor() {
    super();
    if (!stdout.isTTY) throw new Error("Cannot instantiate Window, if stdout is not TTY.");

    this.stdin.setEncoding("utf8")
      .setRawMode!(true);
    this.stdin.on("data", (data) => this.keyPress(data));
    this.stdin.on("resize", () => this.resize());
  }

  /**
   * A set of controls attached to the application.
   */
  controls: Control[] = [];

  /**
   * This event function is called when `stdin` emits a data event.
   *
   * @param {any} data - The output of the `"data"` event.
   */
  keyPress(data: any): this {
    // decode the keypress
    const result: KeySequence = decodeKeypress(data);

    // kill the process on sigint
    if (result.ctrl && result.name === "c") process.exit();

    // find the first focused control
    for (const control of this.controls) {
      if (control.focused) {
        const event: KeyPressEvent = {
          sequence: result,
          target: control,
          window: this,
        };

        // get the position of the control for future comparison
        const { x, y, width, height } = control;

        // emit a keypress event
        control.keyPress(event);

        if (x !== control.x || y !== control.y || width !== control.width || height !== control.height) {
          // if the control moved, render the whole screen
          this.update();
        } else {
          // only update the individual control
          control.quickUpdate(this);
        }

        readline.cursorTo(stdout, control.cursorX, control.cursorY);
        return this;
      }
    }
    return this;
  }

  /**
   * Clears the screen and redraws each control calling `update(this)` on each control.
   */
  update(): this {
    readline.cursorTo(stdout, 0, 0);
    readline.clearScreenDown(stdout);
    let cursorX: number = 0,
      cursorY: number = 0;
    for (const control of this.controls) {
      control.update(this);
      if (control.focused) {
        cursorX = control.cursorX;
        cursorY = control.cursorY;
      }
    }
    readline.cursorTo(this.stdout, cursorX, cursorY);
    return this;
  }

  /**
   * This method does a quick refresh on every control.
   */
  quickUpdate(): this {
    let cursorX: number = 0,
      cursorY: number = 0;
    for (const control of this.controls) {
      control.quickUpdate(this);
      if (control.focused) {
        cursorX = control.cursorX;
        cursorY = control.cursorY;
      }
    }
    readline.cursorTo(this.stdout, cursorX, cursorY);
    return this;
  }

  /**
   * Loops over the window's control and sets the focused property on each one.
   *
   * @param {Control} target - The target control to focus.
   * @returns {this}
   */
  focus(target: Control): this {
    for (const control of this.controls) {
      control.focused = target === control;
    }
    return this;
  }

  /**
   * This method is called when the window is resized.
   *
   * @returns {this}
   */
  resize(): this {
    return this.update();
  }

  /**
   * Draw a debug value to the console.
   *
   * @param {number} x - The x coordinate of the debug value.
   * @param {number} y - The y coordinate of the debug value.
   * @param {string} key - The string representing the key.
   * @param {string} value - The string representing the value.
   * @returns {this}
   */
  debug(x: number, y: number, key: string, value: string): this {
    readline.cursorTo(this.stdout, x, y);
    this.stdout.write(chalk.reset(key) + ": " + chalk.green(value) + chalk.reset(""));
    return this;
  }

  /**
   * Add a control to the window.
   *
   * @param control - The control to be added to the window.
   * @returns {this}
   */
  add(control: Control): this {
    this.controls.push(control);
    return this;
  }
}