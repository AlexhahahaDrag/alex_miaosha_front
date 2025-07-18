<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form
          :model="searchInfo"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item
                :name="labelMap['roleCode'].name"
                :label="labelMap['roleCode'].label"
              >
                <a-input
                  v-model:value="searchInfo.roleCode"
                  :placeholder="'请选择' + labelMap['roleCode'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['roleName'].name"
                :label="labelMap['roleName'].label"
              >
                <a-input
                  v-model:value="searchInfo.roleName"
                  :placeholder="'请选择' + labelMap['roleName'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col style="text-align: right">
              <a-space>
                <a-button type="primary" @click="query"> 查找</a-button>
                <a-button type="primary" @click="cancelQuery">清空</a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
    <div class="button">
      <a-space>
        <a-button type="primary" @click="editRoleInfo('add')">新增</a-button>
        <a-button type="primary" danger @click="batchDelRoleInfo"
          >删除</a-button
        >
      </a-space>
    </div>
    <div class="content">
      <a-table
        :dataSource="dataSource"
        :columns="columns"
        :loading="loading"
        :row-key="(record: any) => record.id"
        :pagination="pagination"
        @change="handleTableChange"
        :scroll="{ y: 520 }"
        :row-selection="rowSelection"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button
                type="primary"
                size="small"
                @click="editRoleInfo('update', record.id)"
                >编辑</a-button
              >
              <a-button
                type="primary"
                size="small"
                @click="roleAuthorizationInfo(record.id)"
                >授权</a-button
              >
              <a-popconfirm
                title="确认删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delRoleInfo(record.id)"
                @cancel="cancel"
              >
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag
              :key="record.status"
              :color="record.status == '1' ? '#87d068' : 'grey'"
            >
              {{ record.status == '1' ? '有效' : '失效' }}
            </a-tag>
          </template>
        </template>
      </a-table>
      <RoleInfoDetail
        ref="editInfo"
        :open="visible"
        :modelInfo="modelInfo"
        @handleOk="handleOk"
        @handleCancel="handleCancel"
      ></RoleInfoDetail>
      <AuthorizationDetail
        ref="authorizationInfo"
        :open="authorizationModal.open"
        :data="authorizationModal"
        @handleOk="handleOk"
        @handleCancel="handleAuthorizationCancel"
      ></AuthorizationDetail>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  SearchInfo,
  pagination,
  columns,
  DataItem,
  ModelInfo,
  pageInfo,
} from './roleInfoListTs';
import {
  getRoleInfoPage,
  deleteRoleInfo,
} from '@/api/user/roleInfo/roleInfoTs';
import { message } from 'ant-design-vue';
import { getDictList } from '@/api/finance/dict/dictManager';
import { dictInfo } from '@/views/finance/dict/dict';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds = [] as any;

const rowSelection = ref({
  checkStrictly: false,
  onChange: (
    selectedRowKeys: (string | number)[],
    _selectedRows: DataItem[],
  ) => {
    rowIds = selectedRowKeys;
  },
  onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (
    selected: boolean,
    selectedRows: DataItem[],
    changeRows: DataItem[],
  ) => {
    console.log(selected, selectedRows, changeRows);
  },
});

const labelMap = ref<any>({
  orgId: { name: 'orgId', label: '公司角色id' },
  userId: { name: 'userId', label: '用户id' },
  roleCode: { name: 'roleCode', label: '角色编码' },
  roleName: { name: 'roleName', label: '角色名称' },
  summary: { name: 'summary', label: '描述' },
  status: { name: 'status', label: '状态' },
});

let searchInfo = ref<SearchInfo>({});

let statusList = ref<dictInfo[]>([]);

const getDictInfoList = () => {
  getDictList('is_valid').then((res) => {
    if (res.code == '200') {
      statusList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == 'is_valid',
      );
    } else {
      message.error((res && res.message) || '查询列表失败！');
    }
  });
};

function cancelQuery() {
  searchInfo.value = {};
}

function handleTableChange(pagination: any) {
  getRoleInfoListPage(searchInfo.value, pagination);
}

function delRoleInfo(ids: string) {
  deleteRoleInfo(ids).then((res) => {
    if (res.code == '200') {
      message.success((res && '删除' + res.message) || '删除成功！', 3);
      getRoleInfoListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || '删除失败！', 3);
    }
  });
}

function batchDelRoleInfo() {
  let ids = '';
  if (rowIds && rowIds.length > 0) {
    rowIds.forEach((item: string) => {
      ids += item + ',';
    });
    ids = ids.substring(0, ids.length - 1);
  } else {
    message.warning('请先选择数据！', 3);
    return;
  }
  delRoleInfo(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
};

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editRoleInfo(type: string, id?: number) {
  if (type == 'add') {
    modelInfo.value.title = '新增明细';
    modelInfo.value.id = undefined;
  } else if (type == 'update') {
    modelInfo.value.title = '修改明细';
    modelInfo.value.id = id;
  }
  modelInfo.value.confirmLoading = true;
  visible.value = true;
}

const handleOk = (v: boolean) => {
  visible.value = v;
  getRoleInfoListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};

const authorizationModal = ref<any>({ open: false });

const roleAuthorizationInfo = (id: number) => {
  authorizationModal.value.open = true;
  authorizationModal.value.id = id;
};

const handleAuthorizationCancel = () => {
  authorizationModal.value.open = false;
};

function getRoleInfoListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getRoleInfoPage(param, cur.current, cur.pageSize)
    .then((res) => {
      if (res.code == '200') {
        dataSource.value = res.data.records;
        pagination.value.current = res.data.current;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
      } else {
        message.error((res && res.message) || '查询列表失败！');
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function query() {
  getRoleInfoListPage(searchInfo.value, pagination.value);
}

function init() {
  authorizationModal.value = { open: false };
  getDictInfoList();
  //获取角色信息表页面数据
  getRoleInfoListPage(searchInfo.value, pagination.value);
}

init();
</script>
<style lang="scss" scoped></style>
