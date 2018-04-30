import { buildText, getTextEnv } from "../interpreters/textInterpreter.js";
import { h } from "../h.js";
import { Component } from "../component.js";

function getTestDom() {
  function Comp1(props) {
    return h("div", [h("span", props.label), h("span", props.value)]);
  }

  class Comp2 extends Component {
    render() {
      return h("div", [
        h("span", this.props.description),
        h(Comp1, { label: "comp11", value: "11" }, []),
        h(Comp1, { label: "comp12", value: "12" }, []),
        h(
          "div",
          { onMount: node => console.log("Mount Comp2", node) },
          this.children
        )
      ]);
    }
  }

  class Root extends Component {
    render() {
      const { color, comp2Descr } = this.props;
      return [
        h(
          "span",
          {
            style: {
              "background-color": color
            },
            onMount: node => console.log("Root comp span mount", node)
          },
          "text 1"
        ),
        h(
          Comp2,
          { description: comp2Descr || "Comps" },
          h("span", "Wrapped child")
        ),
        h("span", "text 2")
      ];
    }
  }

  return {
    dom: h(Root, { color: "green", comp2Descr: "Comps4", markupId: 1 }),
    text: `<span style="background-color: green;">
  text 1
</span>
<div>
  <span>
    Comps4
  </span>
  <div>
    <span>
      comp11
    </span>
    <span>
      11
    </span>
  </div>
  <div>
    <span>
      comp12
    </span>
    <span>
      12
    </span>
  </div>
  <div>
    <span>
      Wrapped child
    </span>
  </div>
</div>
<span>
  text 2
</span>`
  };
}

describe("text interpreter for conversion vdom to text", () => {
  test("sample dom", () => {
    const sample = getTestDom();
    const text = buildText(sample.dom);
    expect(text).toBe(sample.text);
  });
});
