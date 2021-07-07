import { useStore } from "@/store";
import EventBus from "@/utils/EventBus";
import { defineComponent, ref } from "@vue/runtime-core";
import { reactive } from "vue";
import "./modelBar.less";
const pos = reactive({ x: 0, y: 0 });
const onMousedown = (e: MouseEvent, category: string) => {
  e.preventDefault();
  const move = (e: MouseEvent) => {
    pos.x = e.pageX;
    pos.y = e.pageY;
    EventBus.emit("onMousemove", e, category);
  };
  const up = (e: MouseEvent) => {
    EventBus.emit("onMouseup", e);
    window.removeEventListener("mouseup", up);
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseleave", up);
  };
  window.addEventListener("mouseup", up);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseleave", up);
};

export default defineComponent({
  setup() {
    return () => (
      <div class="model-bar-wrap">
        <ul>
          <li
            onMousedown={(e) => {
              onMousedown(e, "rect");
            }}
          >
            <img src="./images/rect.svg" alt="" />
          </li>
          <li
            onMousedown={(e) => {
              onMousedown(e, "ellipse");
            }}
          >
            <img src="./images/ellipse.svg" alt="" />
          </li>
          <li
            onMousedown={(e) => {
              onMousedown(e, "diamond");
            }}
          >
            <img src="./images/diamond.svg" alt="" />
          </li>
        </ul>
      </div>
    );
  },
});
