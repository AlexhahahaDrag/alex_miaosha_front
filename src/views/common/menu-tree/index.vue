<template>
  <a-tree
    v-model:expandedKeys="expandedKeys"
    v-model:checkedKeys="checkedKeys"
    checkable
    :tree-data="treeData"
    :field-names="fieldNames"
  >
  </a-tree>
</template>
<script lang="ts" setup>
import { Ref, ref, watch } from 'vue';
import type { TreeProps } from 'ant-design-vue';

interface Props {
  treeData: any[];
  selectedKeys: string[];
}
const props = withDefaults(defineProps<Props>(), {
  treeData: () => [],
  selectedKeys: () => [],
});

const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);

const fieldNames: TreeProps['fieldNames'] = {
  children: 'children',
  title: 'permissionName',
  key: 'id',
};

const treeData: Ref<TreeProps['treeData']> = ref([]);

watch(
  () => [props.treeData, props.selectedKeys],
  () => {
    treeData.value = props.treeData || [];
    checkedKeys.value = props.selectedKeys || [];
    console.log(`tree eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:`, treeData.value);
  },
  {
    deep: true,
    immediate: true,
  },
);
watch(expandedKeys, () => {
  console.log('expandedKeys', expandedKeys);
});

watch(checkedKeys, () => {
  console.log('checkedKeys', checkedKeys);
});
</script>
