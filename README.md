# vue3-big-list

## 说明

网址: https://github.com/mailhonor/vue3-big-list

超大列表优化显示组件(实际上只显示当前需要显示的条目).

支持多选, ctrl/shift等常见操作:
* 全选 ctrl+a
* 方向键, up, down, (自动滚动到可视区)
* shift+方向键(选中), shift+up, shift+down
* (选中), shift + 鼠标, ctrl + 鼠标

### 例子

https://github.com/mailhonor/vue3-big-list/blob/master/demo/app.vue

### 演示

http://linuxmail.cn/web/big-list-demo.html


## 用法


### 模板例子如下

```html
<vue3BigList ref="listRef"
 :itemHeight="itemHeight" <!-- 传入条目固定高度 -->
 @selectedItemChanged="selectedItemChanged"  <!-- 选中条目发生变化 -->
 @scrollTopChanged="scrollTopChanged">  <!-- 滚动条发生变化 -->
  <template #="{ item, selected }"> <!-- 默认槽, item: 传入的条目, selected: 是否选中状态 -->
      <div class="item" :class="{ 'item-selected': selected }">
        {{ item.data }}
      </div>
  </template>
</vue3BigList>
```

### ts 代码

```ts
import vue3BigList, { vue3BigListItem } from "vue3-big-list"
import { reset } from 'mousetrap';

// type vue3BigListItem = {
//   id: string, // id 不能重复
//   data: any,
// } 

const listRef = ref();
// 必须指定条目的高度
const itemHeight = ref(36);

const reStart = (count: number) => {
  let blist: vue3BigListItem[] = [];
  for (var i = 0; i < count; i++) {
    let o: vue3BigListItem = {
      id: "test_" + i,
      data: {
        label: "条目: " + i,
      }
    }
    blist.push(o);
  }
  listRef.value.clear();
  listRef.value.updateItemList(blist);
}

onMounted(() => {
   // 注册鼠标/键盘快捷键
  listRef.value.shortcutRegister(wrapRef.value)
  // 例子: 10000 条目
  reStart(10000);
});

const selectedItemChanged = () => {
  let items: vue3BigListItem[] = listRef.value.getSelectedItemList();
  console.log("选择条目数量:", items.length);
  // 一般来说, 选中 1 条的时候, 激活显示这个条目的相关信息,
}

const scrollTopChanged = (offset: number) => {
  console.log("滚动条滚动位置:", offset);
  // 可以考虑记住滚动条的位置, 下次登入后用 scrollTo 回到原来的位置
}
```

### 组件方法
```ts
// 弹出id为"test_123"的条目
listRef.value.popupItem("test_123");

// 弹出id为"test_123"的条目, 并放到列表中间位置
listRef.value.popupItemToMiddle("test_123");

// 设置选中id为"test_123"的条目
listRef.value.updateSelectedItemList(["test_123"]);

// 追加选中id为"test_123"的条目
listRef.value.appendSelectedItemList(["test_123"]);

// 取消选中id为"test_123"的条目
listRef.value.unSelectedItemList(["test_123"]);

// 选中上一条
listRef.value.gotoPrevItem();

// 选中下一条
listRef.value.gotoNextItem();

// 获取选中条目
let itemList = listRef.value.getSelectedItemList();

// 获取全部条目
let itemList = listRef.value.getItemList();

// 清除所有条目
  listRef.value.clear();

// 更新条目
listRef.value.updateItemList(itemList);

// 滚动到偏移 13456
listRef.value.scrollTo(123456);
```