<template>
  <div class="charts-container">
    <div class="parent-box" v-for="i in loopCount" :key="i">
      <el-checkbox-group
        class="checkbox-group"
        v-model="maxAndMin[i]"
        @change="submitMaxAndMin"
        style="text-align: left"
      >
        <el-checkbox value="max"> 最大值保持 </el-checkbox>
        <el-checkbox value="min"> 最小值保持 </el-checkbox>
      </el-checkbox-group>
      <ChartComponent
        :key="chartWidth + '-' + chartHeight + '-' + i"
        :result="currentYAxis[i]"
        @click="showModal(i)"
        :pageIndex="i"
        :width="chartWidth"
        :height="chartHeight"
      />
    </div>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1350"
    destroy-on-close
    @close="modalClose"
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
      :result="currentYAxis[currentPage]"
      :width="1000"
      :height="600"
      :isConfig="true"
      :pageIndex="currentPage"
    />
  </el-dialog>

  <el-checkbox-group
    v-model="selectedChannels"
    @change="channelChange"
    class="floatActionDialog"
  >
    <el-checkbox
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      >{{ item.label }}</el-checkbox
    >
  </el-checkbox-group>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { query_subcategory } from "@/service/api";
import ChartComponent from "@/components/ChartComponent.vue";

const dialogVisible = ref(false);
const currentPage = ref(1);
const dialogTitle = ref(`通道${currentPage}`);
const currentcurrentYAxis = ref(Array.from({ length: 12 }, () => []));
const loopCount = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const selectedChannels = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const chartWidth = ref(20);
const chartHeight = ref(29);

const options = ref([
  { label: "通道1", value: 1 },
  { label: "通道2", value: 2 },
  { label: "通道3", value: 3 },
  { label: "通道4", value: 4 },
  { label: "通道5", value: 5 },
  { label: "通道6", value: 6 },
  { label: "通道7", value: 7 },
  { label: "通道8", value: 8 },
  { label: "通道9", value: 9 },
  { label: "通道10", value: 10 },
  { label: "通道11", value: 11 },
  { label: "通道12", value: 12 },
]);
//最大值与最小值
const maxAndMin = ref(Array.from({ length: 12 }, () => ["max", "min"]));

let websocket = null;

const connectWebSocket = () => {
  try {
    websocket = new WebSocket("ws://127.0.0.1:8889/websocket");
    websocket.onopen = () => {
      console.log("WebSocket connection opened");
    };
    websocket.onmessage = (event) => {
      currentYAxis.value[currentPage.value] = event.data
        .split(" ")
        .filter((item) => item)
        .slice(0, 10000)
        .map((item, index) => {
          return { x: index, y: item };
        });
      console.log("Received:", event.data);
    };
    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  } catch (error) {
    console.error("Failed to create WebSocket:", error);
  }
};

const sortArray = (arr) => {
  return arr.sort((a, b) => Number(a) - Number(b));
};

const channelChange = (e) => {
  loopCount.value = sortArray(e);
  if (e?.length <= 4) {
    chartHeight.value = e.length == 1 ? 90 : 45;
    chartWidth.value = e.length <= 2 ? 90 : 45;
  } else {
    chartHeight.value = 29;
    chartWidth.value = 20;
  }
};

const showModal = (i) => {
  connectWebSocket()
  currentPage.value = i;
  dialogTitle.value = `通道${i}`;
  dialogVisible.value = true;
};

// 最大值与最小值保持提交
const submitMaxAndMin = (e) => {
  console.log(maxAndMin.value);
};

const onSubmit = (data) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(data));
  }
};

const modalClose = () => {
  websocket.close();
  websocket.onclose = null;
  websocket.onmessage = null;
  websocket.onerror = null;
  websocket.onopen = null;
};

const startMeasurement = () => {
  console.log("startMeasurement");
};
</script>

<style scoped lang="less">
.charts-container {
  display: flex;
  flex-wrap: wrap;
  .parent-box {
    position: relative;
    margin: 0 2vw;
    .checkbox-group {
      position: absolute;
      top: -3px;
      left: 80px;
    }
  }
}
.floatActionDialog {
  width: 80px;
  border-radius: 4px;
  background: white;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  padding-left: 10px;
  position: fixed;
  text-align: left;
  bottom: 20px;
  right: 20px;
}
</style>
