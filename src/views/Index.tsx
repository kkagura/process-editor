import { defineComponent, ref } from "@vue/runtime-core";
import "./index.less";
export default defineComponent({
  setup() {
    return () => (
      <a-layout class="page">
        <a-layout-sider class="left-aside aside">
          <model-bar></model-bar>
        </a-layout-sider>
        <a-layout-content>
          <process-editor></process-editor>
        </a-layout-content>
        <a-layout-sider class="right-aside aside">Sider2</a-layout-sider>
      </a-layout>
    );
  },
});
