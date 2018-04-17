import { h } from "../../lib/vdom/h.js";
import { bemClassProps } from "../../lib/utils.js";
import { ACTIVE_FILTER } from "../../reducers/filters.js";
import { setActiveFilterType } from "../../actions/index.js";

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
      {
        ...pClass("button", temperatureButtonMod),
        onClick: setActiveFilterType(ACTIVE_FILTER.TEMPERATURE)
      },
      "Температура"
    ),
    h(
      "div",
      {
        ...pClass("button", precipitationButtonMod),
        onClick: setActiveFilterType(ACTIVE_FILTER.PRECIPITATION)
      },
      "Осадки"
    )
  ]);
}
