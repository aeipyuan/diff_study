import { createElement, render, renderDom } from './element.js'
import diff from './diff'
import patch from './patch'
let virtualDom = createElement("ul", { class: "list" }, [
  createElement("li", { class: "item" }, ["a"]),
  createElement("li", { class: "item" }, ["b"]),
  createElement("li", { class: "item" }, ["c"])
]);
let virtualDom2 = createElement("ul", { class: "list" }, [
  createElement("li", { class: "item" }, ["3"]),
  createElement("li", { class: "item" }, ["b"]),
  createElement("button", { class: "item" }, ["3"])
]);

let el = render(virtualDom);
renderDom(el, window.root);

// /* 比对获得补丁 */
let patches = diff(virtualDom, virtualDom2);
console.log(patches)

// /* 打补丁更新视图 */
patch(el, patches);

