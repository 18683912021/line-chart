<template>
  <div class="charts-container">
    <ChartComponent
      v-for="i in 12"
      :key="i"
      :result="slightlyReduced[i - 1]"
      @click="showModal(i)"
      :pageIndex="i"
    />
  </div>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="1350" destroy-on-close>
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
</template>
<script setup>
import { onMounted, ref } from "vue";
import { query_subcategory } from "@/service/api";
import ChartComponent from "@/components/ChartComponent.vue";
import { generateMockData, yAxis } from "@/mockData";

const dialogVisible = ref(false)
const currentPage = ref(1);
const dialogTitle = ref(`通道${currentPage}`);
const mockData = generateMockData();
const slightlyReduced = ref([[{ x: 0, y: 0 }]]);
// 模拟数据
const rawData = ref([{ x: 0, y: 0 }]);

onMounted(async () => {
  slightlyReduced.value = mockData.map((item) => {
    return item.filter((_, index) => index % 10 === 0);
  });
  // const result = await query_subcategory({ category: "test" });
});

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

const onSubmit = (data) => {
  console.log(data);
};

const startMeasurement = () => {
  console.log("startMeasurement");
};

</script>

<style scoped>
.charts-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
