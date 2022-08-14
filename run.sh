redis-server /usr/local/etc/redis/redis.conf
pm2 start --name Server 'yarn run serve'