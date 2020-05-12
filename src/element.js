/* 元素类 */
class Element {
    constructor(type, props, children) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}
/* 创建虚拟元素 */
function createElement(type, props, children) {
    return new Element(type, props, children);
}
/* 将虚拟Dom属性应用到真实Dom */
function setAttr(node, key, value) {
    switch (key) {
        case "value":
            if (node.tagName.toUpperCase() === "INPUT" ||
                node.tagName.toUpperCase() === "TEXTAREA") {
                node.value = value;
            }
            break;
        case "style":
            node.style.cssText = value;
            break;
        default:
            node.setAttribute(key, value);
    }
}
/* 渲染虚拟dom成真实的dom */
function render(vDom) {/* "li", { class: "item" }, ["1"] */
    /* 创建结点 */
    let el = document.createElement(vDom.type);
    /* 增加属性 */
    for (let key in vDom.props) {
        setAttr(el, key, vDom.props[key]);
    }
    /* 插入子元素 */
    vDom.children.forEach(child => {
        /* 若是Element继续递归render */
        child = (child instanceof Element) ? render(child)
            : document.createTextNode(child);
        el.appendChild(child);
    });
    return el;
}
/* 将真实Dom放到target容器 */
function renderDom(el, target) {
    target.appendChild(el);
}
export { createElement, render, renderDom, setAttr, Element }