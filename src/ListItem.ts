export class ListItem<T> {
  color: number = 0xFFFFFF;
  value: T | null = null;
  text: string = "";
  selected: boolean = false;
}
