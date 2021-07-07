import { createRouter, createWebHashHistory } from "vue-router";
import Index from "../views/Index";

export const routers = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "Index",
      component: Index,
    },
  ],
});
