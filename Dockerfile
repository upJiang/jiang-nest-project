# 使用官方 Node 镜像
FROM node:20

# 设置 NODE_ENV 环境变量为 production
ENV NODE_ENV=production

# 创建并设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN yarn install

# 复制源代码
COPY . .

# 构建 Nest 应用
RUN yarn build

# Docker 容器可能无法直接访问宿主机路径，声明挂载点将使宿主机的目录映射到容器中的目录
VOLUME ["/www/wwwroot/blog.junfeng530.xyz/uploads"]

# 绑定应用到 3000 端口
EXPOSE 3000

# 启动应用
CMD ["yarn", "start"]
