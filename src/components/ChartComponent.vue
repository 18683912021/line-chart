<template>
  <div class="content">
    <div class="chart-box">
      <div
        ref="chartRef"
        :style="{
          width: `${isConfig ? width + 'px' : width + 'vw'}`,
          height: `${isConfig?  height + 'px': height + 'vh'}`,
        }"
      ></div>
    </div>
    <div v-if="isConfig" class="config-box">
      <el-form
        :model="form"
        label-width="auto"
        style="max-width: 600px"
        ref="formRef"
      >
        <el-form-item label="通道IP">
          <el-input v-model="form.ip" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="通道端口">
          <el-input v-model="form.port" placeholder="请输入端口" />
        </el-form-item>
        <el-form-item label="通道选择">
          <el-select v-model="form.channel" placeholder="请选择">
            <el-option
              v-for="(item, index) in channelList"
              :label="item.label"
              :value="item.value"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="中心频率(MHz)">
          <el-input-number
            :controls="false"
            style="width: 100%"
            v-model="form.centerFrequency"
          />
        </el-form-item>
        <el-form-item label="扫宽(MHz)">
          <el-input-number
            :controls="false"
            style="width: 100%"
            v-model="form.scanWidth"
          />
        </el-form-item>
        <el-form-item label="参考电平(dBm)">
          <el-input-number
            :controls="false"
            style="width: 100%"
            v-model="form.referenceLevel"
          />
        </el-form-item>
        <el-form-item label="分辨率带宽(MHz)">
          <el-input-number
            :controls="false"
            style="width: 100%"
            v-model="form.resolutionBandWidth"
          />
        </el-form-item>
        <el-form-item label="扫描点数">
          <el-input-number
            :controls="false"
            style="width: 100%"
            v-model="form.scanPoints"
          />
        </el-form-item>
        <el-form-item style="text-align: center" class="button-group">
          <el-button type="primary" @click="onSubmit" :loading="loading"
            >发送</el-button
          >
          <el-button type="primary" @click="startMeasurement" :loading="loading"
            >开始测量</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, reactive, defineEmits } from "vue";
import * as echarts from "echarts";

const emit = defineEmits(["onSubmit", "startMeasurement"]);

// 获取图表容器的引用
const chartRef = ref(null);
const formRef = ref(null);
const loading = ref(false);
let myChart = null;
const channelList = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
];

const form = reactive({
  //通道IP
  ip: "127.0.0.1",
  //通道端口
  port: 5000,
  //通道
  channel: 1,
  //中心频率
  centerFrequency: 1,
  //扫宽
  scanWidth: 1,
  //参考电平
  referenceLevel: 1,
  //分辨率带宽
  resolutionBandWidth: 1,
  //扫描点数
  scanPoints: 1,
});

const props = defineProps({
  result: {
    type: Array,
    default: [{ x: 0, y: 0 }],
  },
  width: {
    type: Number,
    default: 20,
  },
  height: {
    type: Number,
    default: 30,
  },
  isConfig: {
    type: Boolean,
    default: false,
  },
  pageIndex: {
    type: Number,
    default: 1,
  },
});

watch(
  () => props.result,
  (newResult) => {
    if (myChart) {
      myChart.setOption({
        dataset: [
          {
            id: "dataset_raw",
            source: newResult,
          },
        ],
      });
    }
  },
  { immediate: true }
);

const onSubmit = () => {
  emit("onSubmit", form);
};

const startMeasurement = () => {
  emit("startMeasurement");
};

// 初始化图表
const initChart = () => {
  myChart = echarts.init(chartRef.value);

  // 定义图表的配置选项
  const option = {
    // 定义数据集，直接使用 rawData 作为数据源
    dataset: [
      {
        id: "dataset_raw",
        source: props.result,
      },
    ],
    // 定义图表标题
    title: {
      text: props?.isConfig ? "" : `通道${props.pageIndex}`,
    },
    // 定义提示框组件，触发类型为 'axis'，即鼠标悬停在坐标轴上时触发
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let result = `${params[0].data["x"]}(MHz)<br/>`;
        params.forEach((item) => {
          // 假设 y 值是 item.value 的第二个元素
          result += `${item.data["y"]}(dBm)<br/>`;
        });
        return result;
      },
    },
    // 定义 x 轴，类型为 'category'，表示使用类别数据
    xAxis: {
      type: "category",
      name: "MHz",
      nameLocation: "end",
      axisLabel: {
        interval: props.isConfig? 500 : 100, // 设置为1，每个数据点都显示。设置为2，显示每隔一个点
      },
    },
    // 定义 y 轴
    yAxis: {
      name: "dBm",
      min: -150,
      max: 20, // 根据数据范围调整
      nameLocation: "end",
      interval: 10, // 设置间距为 20
    },
    // 设置线条样式
    lineStyle: {
      width: 1, // 设置线条宽度为 1
    },
    // 定义系列列表，这里只有一个系列
    series: [
      {
        // 系列类型为 'line'，表示折线图
        type: "line",
        // 指定使用的数据集 ID 为 'dataset_raw'
        datasetId: "dataset_raw",
        // 设置不显示数据点的符号
        showSymbol: false,
        // 定义数据如何映射到图表的各个维度
        encode: {
          x: "x",
          y: "y",
          // 图例名称映射到 'Year' 维度
          itemName: "dBm",
          // 提示框中显示的信息，这里显示
          // tooltip: ["x","y"],
        },
      },
    ],
    dataZoom: [
      {
        type: "inside", // 内部缩放
        start: 0,
        end: 100,
      },
    ],
  };
  if (props.isConfig) {
    option.dataZoom.push({
      type: "slider", // 滑动条缩放
      start: 0, // 默认起始位置
      end: 100, // 默认结束位置
    });
  }
  // 使用配置选项初始化图表
  myChart.setOption(option);
};
// 在组件挂载后初始化图表
onMounted(() => {
  initChart();
});
</script>

<style scoped lang="less">
.content {
  // width: 100%;
  display: flex;
  .config-box {
    width: 300px;
    margin-top: 55px;
    ::v-deep .el-input-number {
      .el-input__inner {
        text-align: left;
      }
    }
    .button-group {
      ::v-deep .el-form-item__content {
        justify-content: center;
        display: flex;
        gap: 10px;
      }
    }
  }
  .chart-box {
    margin-bottom: 20px;
    display: flex;
    flex-direction: row;
  }
}
</style>
