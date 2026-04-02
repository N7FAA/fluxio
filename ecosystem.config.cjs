/**
 * PM2 进程管理配置
 * 使用: pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: 'fluxio',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        FFMPEG_ROOT: process.env.FFMPEG_ROOT || '/var/fluxio/app',
        MAX_FILE_SIZE: 209715200,
      },
      max_memory_restart: '1G',
    },
  ],
};
