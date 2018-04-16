import { makeH } from "./lib/vdom/h.mjs";
import { Component } from "./lib/vdom/component.mjs";
import {
  buildText,
  getTextEnv
} from "./lib/vdom/interpreters/textInterpreter.mjs";

import {
  applyDiff,
  getDocumentEnv
} from "./lib/vdom/interpreters/documentInterpeter.mjs";

function getTestDoms(env) {
  const h = makeH(env);

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

  const rootCompMarkup = (color, comp2Descr) => [
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
    h(Comp2, { description: comp2Descr || "Comps" }, [
      h("span", "Wrapped child")
    ]),
    h("span", "text 2")
  ];

  const rootCompMarkup2 = (color, comp2Descr) => [
    h(Comp2, { description: comp2Descr || "Comps" }, [
      h("span", "Wrapped child")
    ]),
    h("span", "text 2"),
    h(
      "span",
      {
        style: {
          "background-color": color
        },
        onClick: node => {
          console.log("Gray div click");
        },
        onMount: node => {
          console.log("rootCompMarkup2 mount", node);
        }
      },
      "text 1"
    )
  ];

  class Comp01 extends Component {
    render() {
      return rootCompMarkup("gray");
    }
  }

  class Comp02 extends Component {
    render() {
      if (!this.props.markupId) {
        return rootCompMarkup(this.props.color, this.props.comp2Descr);
      } else {
        return rootCompMarkup2(this.props.color, this.props.comp2Descr);
      }
    }
  }

  const dom1 = h(Comp01, {}, []);
  const dom2 = h(Comp02, { color: "red" }, []);
  const dom3 = h(Comp02, { color: "green" }, []);
  const dom4 = h(Comp02, { color: "green", comp2Descr: "Comps4" }, []);
  const dom5 = h(
    Comp02,
    { color: "green", comp2Descr: "Comps4", markupId: 1 },
    []
  );

  return [dom1, dom2, dom3, dom4, dom5];
}

function textTest() {
  const doms = getTestDoms(getTextEnv());

  console.log(buildText(doms[0]));
}

function dispatch(action) {}

function domTest() {
  const doms = getTestDoms(getDocumentEnv());
  const rootElement = document.getElementById("root");
  let context;
  let rootContext = {
    element: rootElement,
    events: {}
  };
  console.log("====== initial create ======");
  ({ context, rootContext } = applyDiff(doms[0], null, rootContext, dispatch));
  console.log("context 0 is", context);

  console.log("====== replace at root ======");
  ({ context, rootContext } = applyDiff(
    doms[1],
    context,
    rootContext,
    dispatch
  ));
  console.log("context 1 is", context);

  console.log("====== patch 1 ======");
  ({ context, rootContext } = applyDiff(
    doms[2],
    context,
    rootContext,
    dispatch
  ));
  console.log("context 2 is", context);

  console.log("====== patch 2 ======");
  ({ context, rootContext } = applyDiff(
    doms[3],
    context,
    rootContext,
    dispatch
  ));
  console.log("context 3 is", context);

  console.log("====== patch 3 ======");
  ({ context, rootContext } = applyDiff(
    doms[4],
    context,
    rootContext,
    dispatch
  ));
  console.log("context 4 is", context);

  //console.log("====== unmount at root ======");
  //context = applyDiff(null, rootElement, context);
  //console.log("context 4 is", context);
  //console.log(rootElement);
}

domTest();
//textTest();
