import { createApp } from "vue";
import App from "./App.vue";

import { routers } from "./router";

import ModelBar from "./components/ModelBar";
import Canvas from "./components/Canvas";

const app = createApp(App);

app.use(routers);

app.component("model-bar", ModelBar);
app.component("process-editor", Canvas);

export default app;
