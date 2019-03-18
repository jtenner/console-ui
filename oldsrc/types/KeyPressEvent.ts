import { Control } from "../Control";
import { KeySequence } from "decode-keypress";
import { Window } from "../Window";

export interface KeyPressEvent {
  target: Control;
  sequence: KeySequence;
  window: Window;
}
