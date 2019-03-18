import chalk, { Chalk } from "chalk";

export class ListItem<T> {
  colorFunc: Chalk = chalk.rgb(255, 255, 255);
  value: T | null = null;
  text: string = "";
  selected: boolean = false;

  public setColor(color: number): this {
    this.colorFunc = chalk.rgb(
      (color >> 16) & 255,
      (color >> 8) & 255,
      color & 255,
    );
    return this;
  }
}
