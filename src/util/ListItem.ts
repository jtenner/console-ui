import chalk, { Chalk } from "chalk";

export class ListItem<T> {
  colorFunc: Chalk | null = null;
  value: T | null = null;
  text: string = "";
  selected: boolean = false;

  constructor(value: T | null = null, text: string = "") {
    this.value = value;
    this.text = text;
  }
  public setColor(color: number): this {
    this.colorFunc = chalk.rgb(
      (color >> 16) & 255,
      (color >> 8) & 255,
      color & 255,
    );
    return this;
  }
}
