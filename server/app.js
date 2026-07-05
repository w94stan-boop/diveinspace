require('dotenv').config();
const path = require('path');
const express = require('express');
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, '0.0.0.0', function() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';
  
  Object.values(interfaces).forEach(function(iface) {
    iface.forEach(function(ip) {
      if (ip.family === 'IPv4' && !ip.internal) {
        localIp = ip.address;
      }
    });
  });
  
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║     星轨共鸣 · 后端服务已启动        ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log('  ║  本地: http://localhost:' + PORT + '           ║');
  console.log('  ║  内网: http://' + localIp + ':' + PORT + '       ║');
  console.log('  ║  塔罗: http://localhost:' + PORT + '/tarot.html ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
