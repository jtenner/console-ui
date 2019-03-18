import { Window } from "./Window";
import { Progress } from "./Progress";

const w = new Window();
const p = new Progress(10, 10, 40);
w.add(p);
w.update(true);

setInterval(x => {
  p.value += 4;
  if (p.value > 100) {
    p.value -= 100;
  }
  const ratio = p.value / 100;

  const r = Math.floor((1 - ratio) * 255);
  const g = Math.floor(ratio * 255);
  p.setColor((r << 16) + (g << 8));
  w.update();
}, 1000);
