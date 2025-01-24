docker build  -t alex_miaosha_front:latest .
docker rm -f alex_front
docker run -p 80:3000 -p 443:443 -p 4000:4000 --network=alex_miaosha_net --memory=256m --name=alex_front -d alex_miaosha_front:latest
