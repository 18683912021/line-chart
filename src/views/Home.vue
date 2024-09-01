<template>
  <div class="charts-container">
    <ChartComponent v-for="i in 12" :key="i" />
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { query_subcategory } from "@/service/api";
import ChartComponent from '../components/ChartComponent.vue';
onMounted(async () => {
  const result = query_subcategory({ category: "test" });
  console.log(result);
});
</script>

<style scoped>
.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
</style>
