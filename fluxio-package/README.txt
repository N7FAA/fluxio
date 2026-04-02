Fluxio 资源包
=============

本包包含 Fluxio 前端与测试脚本，依赖同一项目中的 server.js（Express）及 /api/* 接口。

目录结构
--------
public/
  fluxio.html   页面入口
  fluxio.css    样式
  fluxio.js     逻辑（路由前缀 BASE=/fluxio）
test-fluxio.js  可选：端到端 HTTP 测试（需先 npm start）

部署说明
--------
1. 将 public/ 下三个文件放到你项目的静态资源目录（与 server 中 STATIC_DIR 一致）。
2. 服务端需为 /fluxio 及 /fluxio/tasks/... 返回 fluxio.html（SPA），并启用 /api/upload、/api/queue、/api/jobs 等接口。
3. 详见同目录 FLUXIO_SERVER_INTEGRATION.md。
