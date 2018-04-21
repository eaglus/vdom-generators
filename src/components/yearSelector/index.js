import { h } from "../../lib/vdom/h.js";
import { bemClassProps } from "../../lib/utils/vdom.js";
import { Component } from "../../lib/vdom/component.js";

const pClass = bemClassProps("year-selector");

const pageSize = 10;

export class YearSelector extends Component {
  constructor(props) {
    super();
    this.state = {
      open: false,
      pageStart: this.getPageStart(props)
    };

    this.escapeHandler = this.escapeHandler.bind(this);
    this.clickOutsideHandler = this.clickOutsideHandler.bind(this);
  }

  getPageStart(props) {
    const { min, value } = props;
    const minAligned = this.getAligned(min);
    const page = Math.floor((value - minAligned) / pageSize);
    return minAligned + page * pageSize;
  }

  getAligned(value) {
    return Math.floor(value / pageSize) * pageSize;
  }

  componentDidUpdate() {
    const pageStart = this.getPageStart(this.props);
    if (pageStart !== this.state.pageStart) {
      this.setState({
        pageStart
      });
    }
  }

  addDocumentListeners() {
    document.addEventListener("keydown", this.escapeHandler, true);
    document.addEventListener("click", this.clickOutsideHandler, true);
  }

  removeDocumentListeners() {
    document.removeEventListener("keydown", this.escapeHandler, true);
    document.removeEventListener("click", this.clickOutsideHandler, true);
  }

  onToggle(open) {
    if (open === undefined) {
      open = !this.state.open;
    }

    if (open !== this.state.open) {
      if (open) {
        this.addDocumentListeners();
      } else {
        this.removeDocumentListeners();
      }

      this.setState({ open });
    }
  }

  componentWillUmount() {
    this.removeDocumentListeners();
  }

  clickOutsideHandler(event) {
    if (this.rootElement) {
      let target = event.target;
      while (target && target !== this.rootElement) {
        target = target.parentElement;
      }
      if (target !== this.rootElement) {
        event.preventDefault();
        this.onToggle(false);
      }
    }
  }

  escapeHandler(event) {
    if (event.keyCode === 27) {
      this.onToggle(false);
    }
  }

  updateRootElement(rootElement) {
    this.rootElement = rootElement;
  }

  renderRow(range, isFirst, isLast) {
    const cells = [];
    const { min, max, value, onSelect } = this.props;
    for (let year = range[0]; year !== range[1]; year++) {
      let mods = [];
      let events;
      const valid = year >= min && year <= max;
      const pageBack = isFirst && year === range[0];
      const pageForward = isLast && year === range[1] - 1;

      if (valid) {
        events = {
          onMouseDown: event => {
            event.stopPropagation();
            event.preventDefault();
            if (!pageBack && !pageForward) {
              this.onToggle(false);
            }
            return onSelect(year);
          }
        };

        if (year === value) {
          mods.push("selected");
        }
      } else {
        events = {
          onMouseDown: event => {
            event.stopPropagation();
            event.preventDefault();
          }
        };

        mods.push("invalid");
      }

      if (pageBack) {
        mods.push("back");
      }

      if (pageForward) {
        mods.push("forward");
      }

      cells.push(
        h(
          "div",
          {
            ...events,
            ...pClass("cell", mods)
          },
          year
        )
      );
    }
    return h("div", pClass("row"), cells);
  }

  renderRows() {
    const { pageStart } = this.state;
    const rowStart = row => pageStart - 1 + row * 4;
    const ranges = [
      [pageStart - 1, rowStart(1)],
      [rowStart(1), rowStart(2)],
      [rowStart(2), rowStart(3)]
    ];
    return ranges.map((range, index) =>
      this.renderRow(range, index === 0, index === ranges.length - 1)
    );
  }

  renderTopRow() {
    const { min, max, value, onSelect } = this.props;
    const { pageStart } = this.state;
    const minAligned = this.getAligned(min);
    const maxAligned = this.getAligned(max) + pageSize;
    const backEnabled = pageStart - pageSize >= minAligned;
    const forwardEnabled = pageStart + pageSize < maxAligned;
    const backMods = backEnabled ? [] : ["invalid"];
    const forwardMods = forwardEnabled ? [] : ["invalid"];
    const backClick = backEnabled
      ? {
          onMouseDown: event => {
            return onSelect(Math.max(value - pageSize, min));
          }
        }
      : {};

    const forwardClick = forwardEnabled
      ? {
          onMouseDown: () => {
            return onSelect(Math.min(value + pageSize, max));
          }
        }
      : {};

    return h("div", pClass("top-row"), [
      h(
        "div",
        {
          ...pClass("top-row-back", backMods),
          ...backClick
        },
        "«"
      ),
      h(
        "div",
        pClass("top-row-middle"),
        pageStart + "-" + (pageStart + pageSize)
      ),
      h(
        "div",
        {
          ...pClass("top-row-forward", forwardMods),
          ...forwardClick
        },
        "»"
      )
    ]);
  }

  render() {
    const { value } = this.props;
    const isOpened = this.state.open;
    const openMod = isOpened ? "open" : "";
    return h(
      "div",
      {
        ...pClass("root"),
        onMount: element => this.updateRootElement(element),
        onUnmount: () => this.updateRootElement(null)
      },
      [
        h(
          "div",
          {
            ...pClass("opener", openMod),
            onMouseDown: event => {
              event.preventDefault();
              event.stopPropagation();
              this.onToggle();
            }
          },
          value
        ),
        isOpened &&
          h("div", pClass("popup", openMod), [
            this.renderTopRow(),
            ...this.renderRows()
          ])
      ]
    );
  }
}
