import { Canvas, Element } from "@/plugins/g";
import EventBus from "@/utils/EventBus";
import { defineComponent, ref } from "@vue/runtime-core";
import { onMounted } from "vue";
import "./canvas.less";

const addEle = (x: number, y: number, editor: Canvas, category: string) => {};

const init = () => {
  const editor = new Canvas({
    el: ".canvas-wrap",
  });
  let currnode: Element;
  EventBus.on("onMousemove", (e: MouseEvent, category: string) => {
    if (contains(editor.container, e.target as Node)) {
      if (!currnode) {
        currnode = editor.add(category, {});
      }
    }
    if (currnode) {
      const { x, y } = editor.getLogicalPoint(e);
      currnode.setCenterLocation(x, y);
    }
  });
  EventBus.on("onMouseup", (e: MouseEvent) => {
    if (currnode && !contains(editor.container, e.target as Node)) {
      editor.box.remove(currnode);
    }
    currnode = null;
  });
};

function contains(root: Node, n: Node) {
  let node = n;
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
}

export default defineComponent({
  setup() {
    onMounted(init);
    return () => <div class="canvas-wrap"></div>;
  },
});
