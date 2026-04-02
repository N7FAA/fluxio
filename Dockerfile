FROM node:20-slim

# 安装 FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p logs temp/previews temp/uploads data

# 暴露端口
EXPOSE 4000

# 启动应用
CMD ["node", "server.js"]


