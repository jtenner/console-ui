import { Control } from "./Control";
import { Border } from "./util/Border";
import { renderBorder } from "./util/renderBorder";
import { ListItem } from "./util/ListItem";
import chalk, { Chalk } from "chalk";
import { KeyPressEvent } from "./util/KeyPressEvent";

export class ListBox<T> extends Control {
  border: Border = new Border();
  selectedIndex: number = 0;
  scrollIndex: number = 0;
  listItems: ListItem<T>[] = [];
  colorFunc: Chalk = chalk.white;

  constructor(x: number, y: number, width: number, height: number) {
    super();

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  render(): string[] {
    const { bottomLeft, bottom, bottomRight, left, right, topLeft, topRight, top, colorFunc } = this.border;
    const result = [
      renderBorder(topLeft, top.repeat(this.width - 2), topRight, colorFunc, colorFunc, colorFunc, this.width),
    ];

    for (let i = 0; i < (this.height - 2); i++) {
      const index = i + this.scrollIndex;
      if (index < this.listItems.length) {
        const itemColorFunc = this.listItems[i].colorFunc || this.colorFunc;
        const isSelected = index === this.selectedIndex;
        const text = this.listItems[i].text;

        result.push(
          renderBorder(
            left,
            text,
            right,
            colorFunc,
            isSelected ? itemColorFunc.inverse : itemColorFunc,
            colorFunc,
            this.width,
          )
        );
      } else {
        result.push(
          renderBorder(left, " ".repeat(this.width), right, colorFunc, chalk.reset, colorFunc, this.width),
        );
      }
    }
    result.push(
      renderBorder(bottomLeft, bottom.repeat(this.width - 2), bottomRight, colorFunc, colorFunc, colorFunc, this.width),
    );

    return result;
  }

  onKeyPress(event: KeyPressEvent): this {
    if (event.sequence.name === "up") {
      return this.selectIndex(this.selectedIndex - 1);
    } else if (event.sequence.name === "down") {
      return this.selectIndex(this.selectedIndex + 1);
    }
    return this;
  }

  selectIndex(index: number): this {
    index = Math.min(this.listItems.length - 1, index);
    index = Math.max(0, index);
    this.selectedIndex = index;
    return this;
  }

  add(item: ListItem<T>): this {
    if (!this.listItems.includes(item)) this.listItems.push(item);
    return this;
  }
}
