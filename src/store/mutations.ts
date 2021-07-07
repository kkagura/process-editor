import { location, State } from "./index";
import { MutationTree } from "vuex";

export default {
  setLocation(state, loc: location) {
    state.pos.x = loc.x;
    state.pos.y = loc.y;
  },
} as MutationTree<State>;
