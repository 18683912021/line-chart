// src/mockData.js
export function generateMockData() {
    return Array.from({ length: 12 }, () => 
      Array.from({ length: 10000 }, (_, index) => ({ x: index, y: Math.random() * 100 }))
    );
  }
  