let allPatches;/* 补丁 */
let Index;/* 树的结点编号 */
/* 顶层 */
function diff(oldTree, newTree) {
    /* 初始化 */
    allPatches = {};
    Index = 0;
    /* 遍历结点 */
    walk(oldTree, newTree, Index);
    /* 返回补丁 */
    return allPatches;
}
/* 判断是否为文本 */
function isString(node) {
    return Object.prototype.toString.call(node) === "[object String]";
}
/* 比对两个结点 */
function walk(oldNode, newNode, currentIndex) {
    /* 当前补丁 */
    let currentPatches = [];
    /* 结点被删除 */
    if (!newNode) {
        currentPatches.push({ type: "REMOVE", index: currentIndex })
    }
    /* 文本结点 */
    else if (isString(oldNode) && isString(newNode)) {
        if (oldNode !== newNode)
            currentPatches.push({ type: "TEXT", text: newNode })
    }
    /* 属性改变 */
    else if (oldNode.type === newNode.type) {
        /* 找出差异属性 */
        let attrs = diffAttr(oldNode.props, newNode.props);
        if (Object.keys(attrs).length) {
            currentPatches.push({ type: "ATTR", attrs });
        }
        /* 遍历子元素 */
        diffChildren(oldNode.children, newNode.children);
    }
    /* 结点被替换 */
    else {
        currentPatches.push({ type: "REPLACE", newNode })
    }
    /* 将补丁合并到总补丁 */
    if (currentPatches.length)
        allPatches[currentIndex] = currentPatches;
}

/* 比对属性 */
function diffAttr(oldAttr, newAttr) {
    let attrs = {};
    /* 比对变化 */
    for (let key in oldAttr) {
        if (oldAttr[key] !== newAttr[key]) {
            attrs[key] = newAttr[key];
        }
    }
    /* 比对新增属性 */
    for (let key in newAttr) {
        if (!oldAttr.hasOwnProperty(key)) {
            attrs[key] = newAttr[key];
        }
    }
    return attrs;
}
/* 比对子元素 */
function diffChildren(oldChild, newChild) {
    oldChild.forEach((child, idx) => {
        /* 递归比对 Index是子元素的索引 */
        walk(child, newChild[idx], ++Index)
    })
}

export default diff;