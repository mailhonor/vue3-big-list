<template>
  <div>
    <div>打开控制台. 支持 ctrl+a, ctrl+鼠标, shift+鼠标/上下箭头, 上下箭头</div>
    <hr>
    <table ref="wrapRef" tabindex="-1">
      <tbody>
        <tr>
          <td>
            <div class="container">
              <vue3BigList ref="listRef" :itemHeight="itemHeight" @selectedItemChanged="selectedItemChanged"
                @scrollTopChanged="scrollTopChanged">
                <template #="{ item, selected }">
                  <div class="item" :class="{ 'item-selected': selected }">
                    {{ item.data.label }}
                  </div>
                </template>
              </vue3BigList>
            </div>
          </td>
          <td>
            <button @click="resetList">重置</button>
            <p></p>
            <button @click="goto123()">弹出id为test_123的条目</button>
            <p></p>
            <button @click="goto123_and_middle()">弹出id为test_123的条目,并上下居中</button>
            <p></p>
            <button @click="select123()">选中id为test_123的条目(独选)</button>
            <p></p>
            <button @click="append_select123()">选中id为test_123的条目(追加)</button>
            <p></p>
            <button @click="unselect123()">取消选中id为test_123的条目</button>
            <p></p>
            <button @click="gotoPrev()">goto 上一条</button>
            <p></p>
            <button @click="gotoNext()">goto 下一条</button>
            <p></p>
            <button @click="getSelectedItemList()">获取选中条目</button>
            <p></p>
            <button @click="getItemList()">获取全部条目</button>
            <p></p>
            <button @click="scrollTo123456()">滚动到位置123456</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import vue3BigList, { vue3BigListItem } from "../src/"
import { reset } from 'mousetrap';

const wrapRef = ref();
const listRef = ref();
const itemHeight = ref(36); // 必须指定条目的高度

const resetList = () => {
  reStart(10000);
}

const selectedItemChanged = () => {
  let items: vue3BigListItem[] = listRef.value.getSelectedItemList();
  console.log("选择条目数量:", items.length);
}

const scrollTopChanged = (offset: number) => {
  console.log("滚动条滚动位置:", offset);
}

const goto123 = () => {
  listRef.value.popupItem("test_123");
}

const goto123_and_middle = () => {
  listRef.value.popupItemToMiddle("test_123");
}

const select123 = () => {
  listRef.value.updateSelectedItemList(["test_123"]);
}

const append_select123 = () => {
  listRef.value.appendSelectedItemList(["test_123"]);
}

const unselect123 = () => {
  listRef.value.unSelectedItemList(["test_123"]);
}

const gotoPrev = () => {
  listRef.value.gotoPrevItem();
}

const gotoNext = () => {
  listRef.value.gotoNextItem();
}

const getSelectedItemList = () => {
  let itemList = listRef.value.getSelectedItemList();
  console.log(itemList)
}

const getItemList = () => {
  let itemList = listRef.value.getItemList();
  console.log(itemList)
}

const scrollTo123456 = () => {
  listRef.value.scrollTo(123456);
}

let sssnnn = 100;
const reStart = (count: number) => {
  sssnnn++;
  let blist: vue3BigListItem[] = [];
  for (var i = 0; i < count; i++) {
    let o: vue3BigListItem = {
      id: "test_" + i,
      data: {
        label: "条目(" + sssnnn + "): " + i,
      }
    }
    blist.push(o);
  }
  listRef.value.clear();
  listRef.value.updateItemList(blist);
}

onMounted(() => {
  listRef.value.shortcutRegister(wrapRef.value)
  reStart(10000);
});
</script>

<style scoped>
.container {
  position: relative;
  width: 200px;
  height: 500px;
  border: 1px solid grey;
  overflow-y: auto;
}

.item {
  height: 32px;
  border: 1px solid white;
  user-select: none;
}

.item-selected {
  border: 1px solid green;
}
</style>