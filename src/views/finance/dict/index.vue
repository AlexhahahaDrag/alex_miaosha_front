<template>
  <div>
    <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="字典名称" prop="typeName">
            <el-input v-model="formData.typeName" placeholder="请输入字典名称" clearable :style="{width: '100%'}">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="类型" prop="field104">
            <el-select v-model="formData.field104" placeholder="请选择类型" clearable :style="{width: '100%'}">
              <el-option v-for="(item, index) in field104Options" :key="index" :label="item.label"
                         :value="item.value" :disabled="item.disabled"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="" prop="查询">
            <el-button type="primary" icon="el-icon-search" size="medium"> 主要按钮 </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="" prop="取消">
            <el-button type="primary" icon="el-icon-search" size="small"> 主要按钮 </el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" justify="start" align="top">
      </el-row>
      <el-form-item size="large">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  components: {},
  props: [],
  data() {
    return {
      formData: {
        typeName: undefined,
        field104: undefined,
        查询: undefined,
        取消: undefined,
      },
      rules: {
        typeName: [{
          required: true,
          message: '请输入字典名称',
          trigger: 'blur'
        }],
        field104: [{
          required: true,
          message: '请选择类型',
          trigger: 'change'
        }],
      },
      field104Options: [{
        "label": "选项一",
        "value": 1
      }, {
        "label": "选项二",
        "value": 2
      }],
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    submitForm() {
      this.$refs['elForm'].validate(valid => {
        if (!valid) return
        // TODO 提交表单
      })
    },
    resetForm() {
      this.$refs['elForm'].resetFields()
    },
  }
}

</script>
<style>
</style>
