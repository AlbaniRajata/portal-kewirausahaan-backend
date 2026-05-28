const os = require('os');
const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}
const logFile = path.join(reportsDir, 'resource_utilization.log');

fs.writeFileSync(logFile, 'Timestamp, Free_RAM_MB, Total_RAM_MB, System_CPU_Load_%\n');
console.log(`[MONITOR] Pemantauan Resource dimulai...`);
console.log(`[MONITOR] Menyimpan log ke: ${logFile}`);
console.log(`[MONITOR] Tekan Ctrl+C untuk berhenti.\n`);
function getCpuLoad() {
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    for (let cpu of cpus) {
        user += cpu.times.user;
        nice += cpu.times.nice;
        sys += cpu.times.sys;
        idle += cpu.times.idle;
        irq += cpu.times.irq;
    }
    const total = user + nice + sys + idle + irq;
    return { idle, total };
}
let startMeasure = getCpuLoad();
setInterval(() => {
    const endMeasure = getCpuLoad();
    const idleDifference = endMeasure.idle - startMeasure.idle;
    const totalDifference = endMeasure.total - startMeasure.total;
    
    const percentageCPU = (100 - (100 * idleDifference / totalDifference)).toFixed(2);
    
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').split('.')[0]; 
    
    const logLine = `${timestamp}, ${freeMem}, ${totalMem}, ${percentageCPU}\n`;
    
    fs.appendFileSync(logFile, logLine);
    
    console.log(`[${timestamp}] CPU: ${percentageCPU}% | Free RAM: ${freeMem} MB`);
    
    startMeasure = endMeasure;
}, 5000);
