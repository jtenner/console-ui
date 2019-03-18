import { EventEmitter } from "events";
import { KeyPressEvent } from "./util/KeyPressEvent";

export class Control extends EventEmitter {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  width: number = 0;
  height: number = 0;

  lines: string[] = [];
  focused: boolean = false;

  debug: string[] = [];

  render(): string[] {
    return [""];
  }

  onKeyPress(event: KeyPressEvent): this {
    return this;
  }
}
