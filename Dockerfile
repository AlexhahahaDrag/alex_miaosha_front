# nginx镜像
FROM nginx:latest

# 维护者信息（MAINTAINER 已废弃，改用 LABEL）
LABEL maintainer="majf <734663446@qq.com>"

# 移除 nginx 容器默认配置（使用 -f 避免文件不存在时构建失败）
RUN rm -f /etc/nginx/conf.d/default.conf /etc/nginx/nginx.conf

# 把主机的nginx.conf文件复制到nginx容器的/etc/nginx文件夹下
COPY ./nginx.conf /etc/nginx/

#COPY ./cert/server.crt /cert/server.crt
#COPY ./cert/server.key /cert/server.key

# 拷贝前端vue项目打包后生成的文件到nginx下运行
COPY ./pc/dist /usr/share/nginx/pc
COPY ./mobile/dist /usr/share/nginx/mobile

# 暴露 3000 端口（需与 nginx.conf 的 listen 端口一致）
EXPOSE 3000

# 注：
# - CMD 用于指定容器启动时执行的命令；RUN 用于镜像构建时执行命令
# - 如需避免构建缓存：docker build --no-cache

# 使用 daemon off 方式将 nginx 运行在前台，保证容器进程不退出
CMD ["nginx", "-g", "daemon off;"]