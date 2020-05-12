# 浅学virtualDom和diff算法
---

## virtual Dom

#### 创建virtual Dom

```javascript
/* 实现 */
class Element {
    constructor(type, props, children) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}
function createElement(type, props, children) {
    return new Element(type, props, children)
}
let virtualDom = createElement("ul", { class: "list" }, [
  createElement("li", { class: "item" }, ["a"]),
  createElement("li", { class: "item" }, ["b"]),
  createElement("li", { class: "item" }, ["c"])
]);
```

![](https://gitee.com/aeipyuan/picture_bed/raw/master/images/20200512084102.png)

#### render函数

作用：将虚拟dom转化为真实Dom

```javascript
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
```
![](https://gitee.com/aeipyuan/picture_bed/raw/master/images/20200512084748.png)

#### renderDom

作用：将真实dom渲染到对应位置

```javascript
/* 将真实Dom放到target容器 */
function renderDom(el, target) {
    target.appendChild(el);
}
```

## diff算法

通过js层的计算，返回一个patch对象，解析patch重新渲染更改部分

![](https://gitee.com/aeipyuan/picture_bed/raw/master/images/20200511181547.png)

#### 差异计算(深度优先遍历)
- 用javascript模拟Dom
- 把虚拟Dom转成真实Dom插入页面
- 如果发生事件更改，比较两棵树变化，得到差异对象
- 把差异应用到真实Dom

![](https://gitee.com/aeipyuan/picture_bed/raw/master/images/20200511182015.png)

#### 比对规则
- 结点类型相同，比对属性，产生一个属性的补丁包`{type:'ATTRS',attrs:{class:'list2'}}`
- 结点不存在，补丁包增加`{type:'REMOVE',index:xxx}`
- 结点类型不同，直接替换`{type:'REPLACE',newNode:newNode}`
- 文本变化，`{type:'TEXT',text:"aaa"}`

#### 补丁生成代码实现

- diff函数初始化补丁和编号

```javascript
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
```
- walk比对新旧节点，将补丁合并到总补丁

```javascript
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
        currentPatches.push({ type: "REPLACE", node: newNode })
    }
    /* 将补丁合并到总补丁 */
    if (currentPatches.length)
        allPatches[currentIndex] = currentPatches;
}
```
- diffAttr比对结点属性差异

```javascript
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
```
- diffChildren比对子元素，设置索引并递归调用walk

```javascript
/* 比对子元素 */
function diffChildren(oldChild, newChild) {
    oldChild.forEach((child, idx) => {
        /* 递归比对 Index是子元素的索引 */
        walk(child, newChild[idx], ++Index)
    })
}
```

![](https://gitee.com/aeipyuan/picture_bed/raw/master/images/20200512093448.png)


#### 应用补丁到真实Dom

- patch为入口，将传入的补丁包放到全局并进入walk函数

```javascript
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
  /* 自下而上更新 */
  if (currentPatches) {
    doPatch(el, currentPatches);
  }
}
```

- doPatch针对不同类型更新结点

```javascript
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
```

