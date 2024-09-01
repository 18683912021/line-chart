<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-date-fns';
import { generateMockData } from '../mockData';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, streamingPlugin);

const chart = ref(null);
const dataSets = ref(generateMockData());

onMounted(() => {
  chart.value = new Chart(chart.value.getContext('2d'), {
    type: 'line',
    data: {
      datasets: dataSets.value.map((data, index) => ({
        label: `Chart ${index + 1}`,
        borderColor: `hsl(${index * 30}, 70%, 50%)`,
        data: data,
        fill: false,
        lineTension: 0.1,
      })),
    },
    options: {
      scales: {
        x: {
          type: 'realtime',
          realtime: {
            duration: 20000,
            refresh: 1000,
            delay: 2000,
            onRefresh: (chart) => {
              chart.data.datasets.forEach((dataset) => {
                dataset.data.push({
                  x: Date.now(),
                  y: Math.random() * 100, // 模拟数据
                });
              });
            },
          },
        },
        y: {
          min: 0,
          max: 100,
        },
      },
    },
  });
});
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}
</style>
