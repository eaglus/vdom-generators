import { h } from "../../lib/vdom/h.js";
import { bemClassProps } from "../../lib/utils/vdom.js";

const pClass = bemClassProps("loader");

export function Loader() {
  return h("div", pClass("root"), [h("div", pClass("inner"))]);
}
