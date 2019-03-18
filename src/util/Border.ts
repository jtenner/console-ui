import chalk, { Chalk } from "chalk";

export class Border {
  bottom: string = "─";
  bottomLeft: string = "└";
  bottomRight: string = "┘";
  colorFunc: Chalk = chalk.white;
  top: string = "═";
  topLeft: string = "╒";
  topRight: string = "╕";
  left: string = "│";
  right: string = "│";

  setColor(color: number): this {
    this.colorFunc = chalk.rgb(
      (color >> 16) & 255,
      (color >> 8) & 255,
      color & 255,
    );
    return this;
  }
}