import { Control } from "./Control";
import chalk, { Chalk } from "chalk";

export class Progress extends Control {
  public value: number = 0;
  public colorFunc: Chalk = chalk.white;

  constructor(x: number, y: number, width: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 1;
  }

  setColor(color: number): this {
    this.colorFunc = chalk.rgb(
      (color >> 16) & 255,
      (color >> 8) & 255,
      color & 255,
    );
    return this;
  }

  render(): string[] {
    const ratio = this.value / 100;
    const count = Math.floor(ratio * this.width);
    return [
      this.colorFunc.inverse(" ".repeat(count)) + this.colorFunc(" ".repeat(this.width - count)),
    ];
  }
}