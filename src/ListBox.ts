import { Control } from "./Control";
import { Window } from "./Window";
import chalk from "chalk";
import readline from "readline";
import stringWidth from "string-width";
import { KeyPressEvent } from "./types/KeyPressEvent";
import { ListItem } from "./ListItem";

class Border {
  bottom: string = "─";
  bottomLeft: string = "└";
  bottomRight: string = "┘";
  color: number = 0xFFFFFF;
  top: string = "═";
  topLeft: string = "╒";
  topRight: string = "╕";
  left: string = "│";
  right: string = "│";
}

export class ListBox<T> extends Control {

  title: string = "";
  titleColor: number = 0xFFFFFF;

  border: Border = new Border();
  scrollIndex: number = 0;
  selectedIndex: number = 0;

  listItems: ListItem<T>[] = [];

  keyPress(event: KeyPressEvent): void {
    const { sequence, window } = event;

    if (sequence.name === "down") {
      this.select(this.selectedIndex + 1);
      return;
    }

    if (sequence.name === "up") {
      this.select(this.selectedIndex - 1);
      return;
    }
  }

  quickUpdate(window: Window): void {
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

        const listItemColor = item.color;
        const listItemColorFunction = chalk.rgb(
          (listItemColor >> 16) & 255,
          (listItemColor >> 8) & 255,
          listItemColor & 255,
        );

        // write the line
        this.write(
          stdout,
          this.x + leftWidth,
          this.y + 1 + i,
          effectiveText,
          item.selected ? listItemColorFunction.inverse : listItemColorFunction,
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

    this.setCursorPosition();
  }

  update(window: Window): void {
    // selected item
    for (let i = 0; i < this.listItems.length; i++) {
      this.listItems[i].selected = i === this.selectedIndex;
    }

    const borderColor = this.border.color;
    const borderColorFunction = chalk.rgb(
      (borderColor >> 16) & 255,
      (borderColor >> 8) & 255,
      borderColor & 255,
    );
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

    const titleColorFunction = chalk.rgb(
      (this.titleColor >> 16) & 255,
      (this.titleColor >> 8) & 255,
      (this.titleColor) & 255,
    );
    this.write(stdout, this.x + topLeftWidth, this.y, this.truncate(this.title, this.width - 2), titleColorFunction);

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

        // get the listItemColorFunction
        const listItemColor = item.color;
        const listItemColorFunction = chalk.rgb(
          (listItemColor >> 16) & 255,
          (listItemColor >> 8) & 255,
          listItemColor & 255,
        );

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
          item.selected ? listItemColorFunction.inverse : listItemColorFunction,
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

    this.setCursorPosition();
  }

  select(index: number): void {
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
  }

  scrollTo(index: number): void {
    const visibleItemCount = this.height - 2;
    const maxScrollIndex = Math.max(0, this.listItems.length - visibleItemCount);
    index = Math.min(index, maxScrollIndex);
    index = Math.max(0, index);
    this.scrollIndex = index;
  }

  setCursorPosition(): void {
    const visibleItemCount = this.height - 2;
    if (this.listItems.length < visibleItemCount) {
      this.cursorX = this.x + this.width - 1;
      this.cursorY = this.y + 1;
      return;
    }

    const maxScrollIndex = Math.max(0, this.listItems.length - visibleItemCount);
    const scrollRatio = this.scrollIndex / maxScrollIndex;
    this.cursorX = this.x + this.width - 1;
    this.cursorY = this.y + Math.floor(scrollRatio * (this.height - 3)) + 1;
  }
}