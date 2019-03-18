import { Control } from "./Control";
import { Window } from "./Window";
import chalk, { Chalk } from "chalk";
import stringWidth from "string-width";
import { KeyPressEvent } from "./types/KeyPressEvent";
import { ListItem } from "./ListItem";

class Border {
  bottom: string = "─";
  bottomLeft: string = "└";
  bottomRight: string = "┘";
  colorFunc: Chalk = chalk.rgb(255, 255, 255);
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

export class ListBox<T> extends Control {

  title: string = "";
  titleColorFunc: Chalk = chalk.rgb(255, 255, 255);

  border: Border = new Border();
  scrollIndex: number = 0;
  selectedIndex: number = 0;

  listItems: ListItem<T>[] = [];

  setTitleColor(color: number): this {
    this.titleColorFunc = chalk.rgb(
      (color >> 16) & 255,
      (color >> 8) & 255,
      color & 255,
    );
    return this;
  }

  keyPress(event: KeyPressEvent): this {
    const { sequence, window } = event;

    if (sequence.name === "down") {
      this.select(this.selectedIndex + 1);
      return this;
    }

    if (sequence.name === "up") {
      this.select(this.selectedIndex - 1);
      return this;
    }

    if (sequence.name === "pageup") {
      this.scrollTo(this.scrollIndex - this.height - 2);
      return this;
    }

    if (sequence.name === "pagedown") {
      this.scrollTo(this.scrollIndex + this.height - 2);
      return this;
    }

    return this;
  }

  quickUpdate(window: Window): this {
    const length = this.listItems.length;
    const { left, right } = this.border;
    const leftWidth = stringWidth(left);
    const rightWidth = stringWidth(right);
    const maxItemLength = this.width - leftWidth - rightWidth;
    const visibleItemCount = this.height - 2;
    const stdout = window.stdout;

    for (let i = 0; i < this.listItems.length; i++) {
      this.listItems[i].selected = i === this.selectedIndex;
    }

    // for each visible item
    for (let i = 0; i < visibleItemCount; i++) {
      const itemIndex = this.scrollIndex + i;

      if (itemIndex < length)  {
        // draw a list item
        const item = this.listItems[itemIndex];

        // get the item text width
        const itemLength = stringWidth(item.text);

        let effectiveText: string = this.truncate(item.text, maxItemLength);

        const spaces = this.width - leftWidth - rightWidth - itemLength;
        effectiveText = spaces > 0 ? item.text + " ".repeat(spaces) : effectiveText;

        // write the line
        this.write(
          stdout,
          this.x + leftWidth,
          this.y + 1 + i,
          effectiveText,
          item.selected ? item.colorFunc.inverse : item.colorFunc,
        )
      } else {
        this.write(
          stdout,
          this.x + leftWidth,
          this.y + 1 + i,
          " ".repeat(maxItemLength),
        );
      }
    }

    return this.setCursorPosition();
  }

  update(window: Window): this {
    // selected item
    for (let i = 0; i < this.listItems.length; i++) {
      this.listItems[i].selected = i === this.selectedIndex;
    }

    const borderColorFunction = this.border.colorFunc;
    const {
      bottom,
      bottomLeft,
      bottomRight,
      top,
      topLeft,
      topRight,
      left,
      right,
    } = this.border;

    const visibleItemCount = this.height - 2;
    const topLeftWidth = stringWidth(topLeft);
    const topRightWidth = stringWidth(topRight);
    const topWidth = stringWidth(top);

    const topMidLength = this.width - topLeftWidth - topRightWidth;
    const topCharCount = Math.floor(topMidLength / topWidth);
    const topSpaceCount = this.width - topLeftWidth - topRightWidth - (topCharCount * topWidth);

    const stdout = window.stdout;

    // write the top border
    this.write(stdout, this.x, this.y, topLeft + top.repeat(topCharCount) + " ".repeat(topSpaceCount) + topRight, borderColorFunction);

    this.write(stdout, this.x + topLeftWidth, this.y, this.truncate(this.title, this.width - 2), this.titleColorFunc);

    const length = this.listItems.length;
    const leftWidth = stringWidth(left);
    const rightWidth = stringWidth(right);

    const maxItemLength = this.width - leftWidth - rightWidth;

    // for each visible item
    for (let i = 0; i < visibleItemCount; i++) {
      const itemIndex = this.scrollIndex + i;

      if (itemIndex < length)  {
        // draw a list item
        const item = this.listItems[itemIndex];

        const itemLength = stringWidth(item.text);

        let effectiveText: string = "";
        if (itemLength <= maxItemLength) {
          // short path
          const spaces = this.width - leftWidth - rightWidth - itemLength;
          effectiveText = item.text + " ".repeat(spaces);
        } else {
          effectiveText = this.truncate(item.text, maxItemLength);
        }

        // draw the list item with the border in one go
        this.writeBordered(
          stdout,
          this.x,
          this.y + 1 + i,
          left,
          right,
          effectiveText,
          borderColorFunction,
          borderColorFunction,
          item.selected ? item.colorFunc.inverse : item.colorFunc,
        );
      } else {
        this.writeBordered(stdout, this.x, this.y + 1 + i, left, right, " ".repeat(maxItemLength), borderColorFunction, borderColorFunction);
      }
    }

    const bottomWidth = stringWidth(bottom);
    const bottomLeftWidth = stringWidth(bottomLeft);
    const bottomRightWidth = stringWidth(bottomRight);
    const bottomMidLength = this.width - bottomLeftWidth - bottomRightWidth;
    const bottomCharCount = Math.floor(bottomMidLength / bottomWidth);
    const bottomSpaceCount = this.width - bottomLeftWidth - bottomRightWidth - (bottomCharCount * topWidth);

    // draw the bottom border
    this.writeBordered(stdout,
      this.x,
      this.y + this.height - 1,
      bottomLeft,
      bottomRight,
      bottom.repeat(bottomCharCount) + " ".repeat(bottomSpaceCount),
      borderColorFunction,
      borderColorFunction,
      borderColorFunction,
    );

    return this.setCursorPosition();
  }

  select(index: number): this {
    const maxSelectableIndex = this.listItems.length - 1;
    const visibleItemCount = this.height - 2;
    const currentLastVisibleItemIndex = this.scrollIndex + visibleItemCount;

    // set selected index
    if (index < 0) {
      this.selectedIndex = 0;
    } else if (index > maxSelectableIndex) {
      this.selectedIndex = maxSelectableIndex;
    } else {
      this.selectedIndex = index;
    }

    // set selected item
    for (let i = 0; i < this.listItems.length; i++) {
      this.listItems[i].selected = i === this.selectedIndex;
    }

    // change scroll
    if (this.selectedIndex < this.scrollIndex) {
      this.scrollTo(this.selectedIndex);
    } else if (this.selectedIndex >= currentLastVisibleItemIndex) {
      this.scrollTo(this.selectedIndex - visibleItemCount + 1);
    }
    return this;
  }

  scrollTo(index: number): this {
    const visibleItemCount = this.height - 2;
    const maxScrollIndex = Math.max(0, this.listItems.length - visibleItemCount);
    index = Math.min(index, maxScrollIndex);
    index = Math.max(0, index);
    this.scrollIndex = index;
    return this;
  }

  setCursorPosition(): this {
    const visibleItemCount = this.height - 2;
    if (this.listItems.length < visibleItemCount) {
      this.cursorX = this.x + this.width - 1;
      this.cursorY = this.y + 1;
      return this;
    }

    const maxScrollIndex = Math.max(0, this.listItems.length - visibleItemCount);
    const scrollRatio = this.scrollIndex / maxScrollIndex;
    this.cursorX = this.x + this.width - 1;
    this.cursorY = this.y + Math.floor(scrollRatio * (this.height - 3)) + 1;
    return this;
  }

  add(listItem: ListItem<T>): this {
    this.listItems.push(listItem);
    return this;
  }

  remove(listItem: ListItem<T>): this {
    const index = this.listItems.indexOf(listItem);
    if (index !== -1) {
      this.listItems.splice(index, 1);
    }
    return this;
  }
}