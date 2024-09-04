<template>
  <div class="charts-container">
    <div class="chart-box" v-for="i in loopCount" :key="i">
      <el-checkbox-group
        class="checkbox-group"
        v-model="maxAndMin[i]"
        @change="submitMaxAndMin"
      >
        <el-checkbox value="max"> 最大值保持 </el-checkbox>
        <el-checkbox value="min"> 最小值保持 </el-checkbox>
      </el-checkbox-group>
      <ChartComponent
        :result="slightlyReduced[i - 1]"
        @click="showModal(i)"
        :pageIndex="i"
      />
    </div>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1350"
    destroy-on-close
  >
    <el-checkbox-group
      class="checkbox-group"
      v-model="maxAndMin[currentPage]"
      @change="submitMaxAndMin"
    >
      <el-checkbox value="max"> 最大值保持 </el-checkbox>
      <el-checkbox value="min"> 最小值保持 </el-checkbox>
    </el-checkbox-group>
    <ChartComponent
      @onSubmit="onSubmit"
      @startMeasurement="startMeasurement"
      :result="rawData"
      :width="1000"
      :height="600"
      :isConfig="true"
      :pageIndex="currentPage"
    />
  </el-dialog>
  <el-select
    v-model="defaultValue"
    placeholder="请选择"
    size="large"
    class="floatActionDialog"
    @change="selectChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { query_subcategory } from "@/service/api";
import ChartComponent from "@/components/ChartComponent.vue";
import { generateMockData, yAxis } from "@/mockData";

const dialogVisible = ref(false);
const currentPage = ref(1);
const dialogTitle = ref(`通道${currentPage}`);
const mockData = generateMockData();
const slightlyReduced = ref([[{ x: 0, y: 0 }]]);
const loopCount = ref(12);
//下拉框默认值
const defaultValue = ref("12");
//1-12
const options = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
];
//最大值与最小值
const maxAndMin = ref(Array.from({ length: 12 }, () => ["max", "min"]));
// 模拟数据
const rawData = ref([{ x: 0, y: 0 }]);

let websocket = null;

onMounted(async () => {
  slightlyReduced.value = mockData.map((item) => {
    return item.filter((_, index) => index % 10 === 0);
  });
  connectWebSocket();
  // const result = await query_subcategory({ category: "test" });
});

const connectWebSocket = () => {
  // 创建 WebSocket 连接
  websocket = new WebSocket("ws://192.168.7.149:5050");

  // 监听消息
  websocket.onmessage = (event) => {
    const message = event.data;
    console.log(message);
    let data = JSON.parse(message);
    if (data.message) console.log(JSON.parse(data.message));
  };

  // 监听连接关闭
  websocket.onclose = () => {
    console.log("WebSocket closed");
  };

  // 监听错误
  websocket.onerror = (error) => {
    console.error("WebSocket error", error);
  };
};

const selectChange = (e) => {
  //下拉框选了几就循环几次
  loopCount.value = parseInt(e);
};

const showModal = (i) => {
  // rawData.value = mockData[i];
  currentPage.value = i;
  dialogTitle.value = `通道${i}`;
  rawData.value = yAxis
    .split(" ")
    .filter((item) => item)
    .slice(0, 10000)
    .map((item, index) => {
      return { x: index, y: item };
    });
  dialogVisible.value = true;
};

// 最大值与最小值保持提交
const submitMaxAndMin = (e) => {
  console.log(maxAndMin.value);
};

const onSubmit = (data) => {
  console.log(data);
};

const startMeasurement = () => {
  console.log("startMeasurement");
};
</script>

<style scoped lang="less">
.charts-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .chart-box {
    position: relative;
    .checkbox-group {
      position: absolute;
      top: -3px;
      left: 80px;
    }
  }
}
.floatActionDialog {
  width: 100px;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  position: fixed;
  bottom: 30px;
  right: 30px;
}
</style>
