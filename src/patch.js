import { setAttr, render, Element } from './element'
let allPatches = {};
let Index = 0;
function patch(el, patches) {
  allPatches = patches;
  Index = 0;
  walk(el);
}
/* 按照索引的顺序遍历孩子 */
function walk(el) {
  let currentPatches = allPatches[Index++];
  let childNodes = el.childNodes;
  /* 深度优先遍历 */
  childNodes.forEach(child => walk(child));
  if (currentPatches) {
    doPatch(el, currentPatches);
  }
}
/* 将补丁应用到el上 */
function doPatch(el, patches) {
  patches.forEach(patch => {
    switch (patch.type) {/* {type:'TEXT',text:"aaa"} */
      case "TEXT":
        el.textContent = patch.text;
        break;
      case "ATTR":/* {type:'ATTRS',attrs:{class:'list2'}} */
        for (let key in patch.attrs) {
          let value = patch.attrs[key];
          /* 若值为undefine直接删除属性 */
          if (value) setAttr(el, key, value);
          else el.removeAttribute(key);
        }
        break;
      case "REPLACE":/* {type:'REPLACE',newNode:newNode} */
        /* 文本结点特殊处理 */
        let newNode = (patch.newNode instanceof Element) ?
          render(patch.newNode) : document.createTextNode(patch.newNode);
        el.parentNode.replaceChild(newNode, el);
        break;
      case "REMOVE":/* {type:'REMOVE',index:xxx} */
        el.parentNode.removeChild(el);
        break;
    }
  })
}
export default patch;