import vuex, { Store, useStore as BaseUseStore } from "vuex";
import mutations from "./mutations";
import actions from "./actions";
import { InjectionKey } from "@vue/runtime-core";

export interface location {
  x: number;
  y: number;
}

export interface State {
  pos: location;
}

export default new vuex.Store({
  state: {
    pos: {
      x: 0,
      y: 0,
    },
  } as State,
  mutations,
  actions,
});

export const storeKey: InjectionKey<Store<State>> = Symbol();

export function useStore() {
  return BaseUseStore(storeKey);
}
