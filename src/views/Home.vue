<template>
  <div class="charts-container">
    <div class="parent-box" v-for="i in loopCount" :key="i">
      <el-checkbox-group
        class="checkbox-group"
        v-model="maxAndMin[i - 1]"
        style="text-align: left"
      >
        <el-checkbox value="max"> 最大值保持 </el-checkbox>
        <el-checkbox value="min"> 最小值保持 </el-checkbox>
      </el-checkbox-group>
      <ChartComponent
        :key="chartWidth + '-' + chartHeight + '-' + i"
        :result="currentCoordinate[i - 1]"
        @click="showModal(i)"
        :pageIndex="i"
        :width="chartWidth"
        :height="chartHeight"
        :maxAndMin="maxAndMin[i - 1]"
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
    <el-checkbox-group class="checkbox-group" v-model="maxAndMin[currentPage]">
      <el-checkbox value="max"> 最大值保持 </el-checkbox>
      <el-checkbox value="min"> 最小值保持 </el-checkbox>
    </el-checkbox-group>
    <ChartComponent
      @onSubmit="onSubmit"
      @startMeasurement="startMeasurement"
      :result="currentCoordinate[currentPage]"
      :width="1000"
      :height="600"
      :isConfig="true"
      :pageIndex="currentPage"
      :maxAndMin="maxAndMin[currentPage]"
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
const currentCoordinate = ref(Array.from({ length: 12 }, () => []));
const lastCoordinate = ref(Array.from({ length: 12 }, () => []));
const loopCount = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const selectedChannels = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const chartWidth = ref(20);
const chartHeight = ref(29);
const websockets = ref(Array.from({ length: 12 }, () => null)); // 存储每个通道的 WebSocket 连接
const clickedChannels = ref([]);

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
const maxAndMin = ref(Array.from({ length: 12 }, () => []));

let websocket = null;

const connectWebSocket = (index) => {
  try {
    websocket = new WebSocket("ws://127.0.0.1:8889/websocket");
    websocket.onopen = () => {
      console.log("WebSocket connection opened");
    };
    websocket.onmessage = (event) => {
      //如果已经点过的里面找不到当前就不执行后面
      if (!clickedChannels.value.includes(currentPage.value)) {
        return;
      }
      const data = event.data
        .split(" ")
        .map(Number)
        .filter((item) => !isNaN(item))
        .slice(0, 10000); // 转换为数字并过滤掉非数字

      const currentPageData = currentCoordinate.value[currentPage.value];

      // 如果当前页面的数据为空，初始化点数据
      if (currentPageData.length === 0) {
        currentCoordinate.value[currentPage.value] = data.map(
          (item, index) => ({
            x: index,
            y: item,
            max: item,
            min: item,
          })
        );
      } else {
        // 更新已有点数据
        currentCoordinate.value[currentPage.value] = currentPageData.map(
          (point, index) => {
            if (index < data.length) {
              const newY = data[index];
              return {
                x: point.x,
                y: newY,
                max: Math.max(point.max, newY),
                min: Math.min(point.min, newY),
              };
            } else {
              // 如果新数据长度比现有数据短，清空当前值但保留最大最小值
              return {
                x: point.x,
                y: null, // 清空当前值
                max: point.max,
                min: point.min,
              };
            }
          }
        );

        // 补充新的点数据（如果新数据长度超过已有长度）
        if (data.length > currentPageData.length) {
          const newPoints = data
            .slice(currentPageData.length)
            .map((item, index) => ({
              x: currentPageData.length + index,
              y: item,
              max: item,
              min: item,
            }));
          currentCoordinate.value[currentPage.value].push(...newPoints);
        }
      }
    };
    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    websockets.value[index] = websocket;
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
  const channelIndex = i - 1;
  if (!websockets.value[channelIndex]) {
    connectWebSocket(channelIndex);
  }
  currentPage.value = channelIndex;
  dialogTitle.value = `通道${i}`;
  dialogVisible.value = true;
};

const onSubmit = (data) => {
  if (websockets.value[currentPage.value]) {
    websocket.send(JSON.stringify(data));
    clickedChannels.value.push(currentPage.value);
  }
};

const modalClose = () => {
  // websocket.close();
  // websocket.onclose = null;
  // websocket.onmessage = null;
  // websocket.onerror = null;
  // websocket.onopen = null;
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
