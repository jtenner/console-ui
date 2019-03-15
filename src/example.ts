import { Label } from "./Label";
import { Window } from "./Window";
import { ListBox } from "./ListBox";
import { ListItem } from "./ListItem";

const w = new Window();

const l = new Label();
l.text = "Hello world!";
l.textColor = 0xFF0000;
l.width = 12;
w.controls.push(l)


const lb = new ListBox();
lb.x = 10;
lb.y = 10;
lb.width = 12;
lb.height = 7;
lb.title = "Title";
lb.titleColor = 0x00FFFF;

for (let i = 1; i <= 3; i++) {
  const item = new ListItem();
  item.text = i.toString().repeat(i);
  lb.listItems.push(item)
}
lb.selectedIndex = 2;

w.controls.push(lb);
w.focus(lb);

w.update();
