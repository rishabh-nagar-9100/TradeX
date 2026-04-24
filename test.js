import { generateHistoricalData } from './src/services/mockDataEngine.js';
const data = generateHistoricalData('AAPL', 200);
const times = data.map(d => d.time);
const duplicates = times.filter((item, index) => times.indexOf(item) !== index);
console.log("Duplicates: ", duplicates);
let unsorted = false;
for(let i=1; i<data.length; i++) {
   if (data[i].time <= data[i-1].time) {
      unsorted = true;
      console.log("Unsorted: ", data[i-1].time, data[i].time);
   }
}
console.log("Unsorted found: ", unsorted);
