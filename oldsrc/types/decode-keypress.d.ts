declare module "decode-keypress" {
  export interface KeySequence {
    name: string | void;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    sequence: string;
  }

  export default function decodeKeypress(rawSequence: any, encoding?: string): KeySequence;
}
