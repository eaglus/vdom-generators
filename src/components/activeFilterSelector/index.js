import { h } from "../../lib/vdom/h.js";
import { merge } from "../../lib/utils/index.js";
import { bemClassProps } from "../../lib/utils/vdom.js";
import { ACTIVE_FILTER } from "../../reducers/filters.js";
import { loadForFilterType } from "../../actions/index.js";

const pClass = bemClassProps("active-filter-selector");

export function ActiveFilterSelector(props) {
  const { activeFilterType } = props;
  const temperatureButtonMod =
    activeFilterType === ACTIVE_FILTER.TEMPERATURE ? "active" : "";

  const precipitationButtonMod =
    activeFilterType === ACTIVE_FILTER.PRECIPITATION ? "active" : "";

  return h("div", pClass("root"), [
    h(
      "div",
      merge(pClass("button", temperatureButtonMod), {
        onClick: () => loadForFilterType(ACTIVE_FILTER.TEMPERATURE)
      }),
      "Температура"
    ),
    h(
      "div",
      merge(pClass("button", precipitationButtonMod), {
        onClick: () => loadForFilterType(ACTIVE_FILTER.PRECIPITATION)
      }),
      "Осадки"
    )
  ]);
}
