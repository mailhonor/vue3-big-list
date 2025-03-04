<template>
  <div ref="wrapRef" class="big-table">
    <div ref="scrollDivRef" class="scroll">
      <div :style="{ height: expandingHeight }">
        <div class="moving-box" :style="{ top: movingBoxTop }">
          <div v-for="item in itemListToDraw" :key="item.id" @mousedown.left.stop="itemMouseDownLeft(item, $event)"
            @click="itemClick(item, $event)" @contextmenu="contextmenuItemClick(item)"
            :style="{ height: itemHeight + 'px' }">
            <slot :item="item" :selected="selectedItems[item.id] ? true : false"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, onUnmounted } from "vue"
import mousetrap from "mousetrap"

export type vue3BigListItem = {
  id: string,
  data: any,
}

type ItemInfo = {
  SN: number,
} & vue3BigListItem

const props = defineProps({
  itemHeight: {
    type: Number,
    default: 36
  },
  topPadding: {
    type: Number,
    default: 0
  },
  bottomPadding: {
    type: Number,
    default: 0
  },
})

const emit = defineEmits(['scrollTopChanged', 'selectedItemChanged'])

let clearMode = false
const wrapRef = ref()
const scrollDivRef = ref()
let scrollDom: HTMLElement
const expandingHeight = ref("36px")
const movingBoxTop = ref("0px")
let allItemList: ItemInfo[] = []
let allItems: { [key: string]: ItemInfo; } = {}
const itemListToDraw = ref<ItemInfo[]>([])
const selectedItems = ref({} as any)

let lastSelectedItem: any = null
let firstSelectedItem: any = null

selectedItems.value = {}

function getItemByIdInner(id: string | undefined | null) {
  if (!id) {
    return null
  }
  let r = allItems[id] || null
  if (r) {
    r = { ...r }
  }
  return r
}

const getItem = (id: string | undefined | null): vue3BigListItem | null => {
  if (!id) {
    return null
  }
  let r = allItems[id] || null
  if (r) {
    r = { ...r }
  }
  return r
}

function clearSelectecItems() {
  selectedItems.value = {}
}

function delSelectedItems(item: ItemInfo) {
  if (selectedItems.value[item.id]) {
    delete selectedItems.value[item.id]
  }
}

function switchSelectedItems(item: ItemInfo) {
  if (selectedItems.value[item.id]) {
    delete selectedItems.value[item.id]
  }
  else {
    selectedItems.value[item.id] = item
  }
}

function selectedItemChanged(attrs?: any) {
  let items = getSelectedItemList()
  if (items.length == 1) {
    firstSelectedItem = { ...items[0] }
  }
  emit('selectedItemChanged')
}

const getSelectedItemList = (): vue3BigListItem[] => {
  let rs: vue3BigListItem[] = []
  let ms = selectedItems.value
  let keys = Object.keys(ms)
  let i = 0, length = keys.length
  for (i = 0; i < length; i++) {
    let o = ms[keys[i]]
    if (o.id in allItems) {
    } else {
      continue
    }
    o = { ...o }
    rs.push(o)
  }
  return rs
}

const getSelectedItems = (): { [key: string]: vue3BigListItem } => {
  let r: any = {}
  let ms = selectedItems.value
  let keys = Object.keys(ms)
  let i = 0, length = keys.length
  for (i = 0; i < length; i++) {
    let o = ms[keys[i]]
    if (o.id in allItems) {
    } else {
      continue
    }
    o = { ...o }
    r[o.id] = o
  }
  return r
}

const getItemList = (): vue3BigListItem[] => {
  let r = [...allItemList]
  let i = 0, length = r.length
  for (i = 0; i < length; i++) {
    let o = r[i]
    r[i] = { ...o }
  }
  return r
}

const getItems = (): { [key: string]: vue3BigListItem; } => {
  let r: any = {}
  let ml = allItemList
  let i = 0, length = ml.length
  for (i = 0; i < length; i++) {
    let o = ml[i]
    r[o.id] = { ...o }
  }
  return r
}

function addSelectedItems_by_span(item1: ItemInfo, item2: ItemInfo) {
  let sn1 = item1.SN
  let sn2 = item2.SN
  if (sn2 < sn1) {
    sn2 = item1.SN
    sn1 = item2.SN
  }
  let ml = allItemList
  if (sn2 >= ml.length) {
    sn2 = ml.length - 1
  }
  sn2++
  for (; sn1 < sn2; sn1++) {
    selectedItems.value[ml[sn1].id] = ml[sn1]
  }
  selectedItemChanged()
}

function trueItemClick(item: ItemInfo, ev: Event) {
  let ctrl = false
  let shift = false
  try {
    var event = (window as any).event
    if (event.ctrlKey) {
      ctrl = true
    }
    if (event.shiftKey) {
      shift = true
    }
  } catch {
  }

  lastSelectedItem = item
  if (!firstSelectedItem) {
    firstSelectedItem = item
  }
  if (!shift) {
    firstSelectedItem = item
  }
  if (shift) {
    clearSelectecItems()
    addSelectedItems_by_span(item, firstSelectedItem)
    selectedItemChanged()
    return
  }
  if (ctrl) {
    switchSelectedItems(item)
    let k: string
    let exists = false
    for (k in selectedItems.value) {
      exists = true
      break
    }
    if (!exists) {
      selectedItems.value[item.id] = item
    }
    selectedItemChanged()
    return
  }
  clearSelectecItems()
  selectedItems.value[item.id] = item
  selectedItemChanged()
}

function itemMouseDownLeft(item: any, ev: Event) {
  ev.stopPropagation()
  let obj: any = ev.target as any
  if (item.id in selectedItems.value) {
    obj.___bigtable_20240703 = false
    return
  } else {
    obj.___bigtable_20240703 = true
    trueItemClick(item, ev)
  }
}
function itemClick(item: ItemInfo, ev: Event) {
  let obj: any = ev.target as any
  if (obj.___bigtable_20240703) {
    obj.___bigtable_20240703 = false
    return
  }
  trueItemClick(item, ev)
}

function contextmenuItemClick(item: ItemInfo) {
  if (!selectedItems.value[item.id]) {
    clearSelectecItems()
    selectedItems.value[item.id] = item
    selectedItemChanged({ clickMode: true })
  }
}

function updateItemListToDraw_nextTick(attrs: any = {}): void {
  let itemList = allItemList
  let windowHeight = document.documentElement.clientHeight
  let itemInsertCount = Math.trunc(windowHeight / props.itemHeight) + 20

  let scrolled = false
  if (attrs.scrollTop != undefined) {
    scrollDom.scrollTo({ top: attrs.scrollTop })
    scrolled = true
  }
  if (attrs.scrollStep) {
    scrollDom.scrollTo({ top: (scrollDom.scrollTop + attrs.scrollStep) })
    scrolled = true
  }
  if (scrolled || attrs.scrolled) {
    if (!clearMode) {
      emit('scrollTopChanged', scrollDom.scrollTop)
    }
  }
  let startIdx = Math.trunc(scrollDom.scrollTop / props.itemHeight) - 10
  if (startIdx < 0) {
    startIdx = 0
  }
  let endIdx = startIdx + itemInsertCount
  if (endIdx > itemList.length + 1) {
    endIdx = itemList.length + 1
  }
  let itemListSlice = itemList.slice(startIdx, endIdx)
  movingBoxTop.value = startIdx * props.itemHeight + props.topPadding + "px"
  function test_changed() {
    if (itemListSlice.length != itemListToDraw.value.length) {
      return true
    }
    let i = 0
    for (i = 0; i < itemListSlice.length; i++) {
      let old_item = itemListToDraw.value[i]
      let new_item = itemListSlice[i]
      if (old_item.id != new_item.id) {
        return true
      }
    }
    return false
  }
  if (test_changed()) {
    itemListToDraw.value = itemListSlice
  } else {
  }
}
function updateItemListToDraw(attrs: any = {}): void {
  let itemList = allItemList
  expandingHeight.value = props.itemHeight * itemList.length + props.topPadding + props.bottomPadding + "px"
  nextTick(() => {
    updateItemListToDraw_nextTick(attrs)
    clearMode = false
  })
}

// 在显式区之外的item滚动到显示区
function ___popupItem(item: ItemInfo | undefined | null) {
  if (!item) {
    return
  }
  let i = item.SN
  let step = 0
  let logicTop = props.topPadding + i * props.itemHeight

  if (logicTop < scrollDom.scrollTop) {
    step = logicTop - scrollDom.scrollTop - 3
  } else if (scrollDom.scrollTop + scrollDom.clientHeight < logicTop + props.itemHeight + 3) {
    step = logicTop - (scrollDom.scrollTop + scrollDom.clientHeight) + props.itemHeight + 3
  } else {
    return
  }
  updateItemListToDraw({ scrollStep: step })
}

const popupItem = (id: string | undefined | null) => {
  ___popupItem(getItemByIdInner(id))
}

// 移动条目到上下中间的位置, 一般用于重排条目后, 之前被选中的条目的显示
function popupItemToMiddle(id: string | undefined | null) {
  let item = allItems[id || ""]
  if (!item) {
    return
  }
  if (!item) {
    return
  }
  let i = item.SN
  let step = 0
  let logicTop = props.topPadding + i * props.itemHeight
  if (!wrapRef.value) {
    return
  }

  logicTop -= wrapRef.value.clientHeight / 2 - props.itemHeight
  if (logicTop < 0) {
    logicTop = 0
  }
  updateItemListToDraw({ scrollTop: logicTop })
}

const getPrevNextItem = (lastItem: ItemInfo, prevORnext: boolean) => {
  let item: any = null
  let ml = allItemList
  let sn = lastItem.SN - (prevORnext ? 1 : -1)
  if (sn >= ml.length) {
    sn = ml.length - 1
  }
  if (sn < 0) {
    return null
  }
  return ml[sn]
}

function gotoPrevNextItem(prevORnext: boolean, event?: any) {
  if (lastSelectedItem) {
    if (!allItems[lastSelectedItem.id]) {
      lastSelectedItem = null
    }
  }
  if (lastSelectedItem == null) {
    let k: string
    for (k in selectedItems.value) {
      lastSelectedItem = selectedItems.value[k]
      break
    }
    if (lastSelectedItem == null) {
      if (prevORnext) {
        if (allItemList.length > 1) {
          lastSelectedItem = allItemList[1]
        }
      } else {
        if (allItemList.length > 0) {
          lastSelectedItem = allItemList[0]
        }
      }
    }
    if (lastSelectedItem == null) {
      return
    }
  }
  if (event && event.ctrlKey) {
    return true
  }
  let lastSelectedItem_bak = lastSelectedItem
  let item: any = getPrevNextItem(lastSelectedItem, prevORnext)
  if (!item) {
    return
  }
  lastSelectedItem = item

  ___popupItem(item)
  if (event && event.shiftKey) {
    delSelectedItems(lastSelectedItem_bak)
    if (firstSelectedItem) {
      if (!allItems[firstSelectedItem.id]) {
        firstSelectedItem = null
      }
    }
    if (!firstSelectedItem) {
      firstSelectedItem = lastSelectedItem
    }
    if (lastSelectedItem.id != firstSelectedItem.id) {
      addSelectedItems_by_span(lastSelectedItem, firstSelectedItem)
    }
    selectedItemChanged()
    return
  }

  firstSelectedItem = item
  clearSelectecItems()
  selectedItems.value[item.id] = item
  selectedItemChanged()
  return false
}

function gotoPrevItem() {
  return gotoPrevNextItem(true)
}

function gotoNextItem() {
  return gotoPrevNextItem(false)
}

function keyUpItem(event: any) {
  return gotoPrevNextItem(true, event)
}

function keyDownItem(event: any) {
  return gotoPrevNextItem(false, event)
}

const scrollUpDownItem = (upORdown: boolean, event: any) => {
  let ctrl = false
  let shift = false
  if (event && event.ctrlKey) {
    ctrl = true
  }
  if (event && event.shiftKey) {
    shift = true
  }
  updateItemListToDraw({ scrollStep: (ctrl || shift ? 1 : 0.1) * (upORdown ? 1 : -1) * props.itemHeight })
  return true
}

const scrollUpItem = (event: any) => {
  return scrollUpDownItem(true, event)
}

const scrollDownItem = (event: any) => {
  return scrollUpDownItem(false, event)
}

const scrollTo = (scrollTop: number) => {
  updateItemListToDraw({ scrollTop })
}

const selectAllItems = () => {
  let list = allItemList
  let i, length = list.length
  for (i = 0; i < length; i++) {
    selectedItems.value[list[i].id] = list[i]
  }
  selectedItemChanged()
  return false
}


function updateItemList(list: vue3BigListItem[]) {
  if (!list) {
    return
  }
  list = [...list]
  let items: any = {}
  let idx = 0, length = list.length
  for (idx = 0; idx < length; idx++) {
    let tmp_item = list[idx]
    let item: ItemInfo = { ...tmp_item, SN: -1 }
    item = { ...item }
    item.SN = idx
    items[item.id] = item
    list[idx] = item
  }
  allItemList = list as any
  allItems = items
  updateItemListToDraw()
}

const deleteItemList = (ids: string[]) => {
  if (ids.length < 1) {
    return
  }
  let ks: any = {}
  ids.forEach(id => {
    ks[id] = true
  })

  let i
  let length = allItemList.length
  let ml: any[] = []
  let items: any = {}
  for (i = 0; i < length; i++) {
    if (allItemList[i].id in ks) {
      continue
    }
    ml.push(allItemList[i])
  }

  length = ml.length
  for (i = 0; i < length; i++) {
    let item = ml[i]
    item.SN = i
    items[item.id] = item
  }
  allItemList = ml
  allItems = items

  let selectedChanged = false
  let ss = Object.keys(selectedItems.value)
  length = ss.length
  for (i = 0; i < length; i++) {
    if (allItems[ss[i]]) {
      continue
    }
    selectedChanged = true
    delete selectedItems.value[ss[i]]
  }
  if (selectedChanged) {
    selectedItemChanged()
  }
  updateItemListToDraw()
}

function updateSelectedItemList(ids: string[]) {
  clearSelectecItems()
  let ks: any = {}
  let i, length = ids.length
  for (i = 0; i < length; i++) {
    ks[ids[i]] = true
  }
  length = allItemList.length
  for (i = 0; i < length; i++) {
    if (allItemList[i].id in ks) {
      selectedItems.value[allItemList[i].id] = allItemList[i]
    }
  }
  selectedItemChanged()
}

function appendSelectedItemList(ids: string[]) {
  let ks: any = {}
  let i, length = ids.length
  for (i = 0; i < length; i++) {
    ks[ids[i]] = true
  }
  length = allItemList.length
  for (i = 0; i < length; i++) {
    if (allItemList[i].id in ks) {
      selectedItems.value[allItemList[i].id] = allItemList[i]
    }
  }
  selectedItemChanged()
}

function unSelectedItemList(ids: string[]) {

  let ks: any = {}
  let i, length = ids.length
  for (i = 0; i < length; i++) {
    ks[ids[i]] = true
  }
  length = allItemList.length
  for (i = 0; i < length; i++) {
    if (allItemList[i].id in ks) {
      delete selectedItems.value[allItemList[i].id]
    }
  }
  selectedItemChanged()
}

const clear = () => {
  clearMode = true
  lastSelectedItem = null
  firstSelectedItem = null
  itemListToDraw.value = []
  allItemList = []
  allItems = {}
  selectedItems.value = {}
  updateItemListToDraw()
}


function monitorScroll() {
  scrollDom = scrollDivRef.value
  scrollDom.addEventListener("scroll", function () {
    updateItemListToDraw({ scrolled: true })
  })
}

let monitorHeight_last = 0
let monitorHeight_timer: any
function monitorHeight() {
  if (scrollDom.offsetHeight != monitorHeight_last) {
    monitorHeight_last = scrollDom.offsetHeight
    updateItemListToDraw()
  }
  // FIXME
  monitorHeight_timer = setTimeout(monitorHeight, 100)
}

function shortcutRegister(shortcutRangeDom?: HTMLElement) {
  let trap = mousetrap(shortcutRangeDom)
  trap.bind(["up", "shift+up"], keyUpItem)
  trap.bind(["down", "shift+down"], keyDownItem)
  trap.bind("ctrl+a", selectAllItems)
  let range = shortcutRangeDom
  if (!range) {
    range = document as any
  }
  if (range) {
    range.addEventListener('wheel', function (event: any) {
      if (event.deltaY < 0) {
        scrollDownItem(event)
      } else if (event.deltaY > 0) {
        scrollUpItem(event)
      }
    })
  }
}

function shortcutUnRegister() {
}

onMounted(() => {
  monitorScroll()
  monitorHeight()
})

onUnmounted(() => {
  clearTimeout(monitorHeight_timer)
  shortcutUnRegister()
})

defineExpose({
  shortcutRegister,
  clear,
  updateItemList,
  deleteItemList,
  updateSelectedItemList,
  appendSelectedItemList,
  unSelectedItemList,
  getItem,
  getItemList,
  getItems,
  getSelectedItemList,
  getSelectedItems,
  popupItemToMiddle,
  popupItem,
  gotoPrevItem,
  gotoNextItem,
  scrollTo,
})

</script>

<style scoped>
.big-table {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  overflow: hidden;
}

.scroll {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: scroll;
}

.moving-box {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
}
</style>
