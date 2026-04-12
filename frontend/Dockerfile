FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Windows/Git может положить в образ Index.html; в Linux нужен index.html
RUN if [ -f /app/Index.html ] && [ ! -f /app/index.html ]; then \
      mv /app/Index.html /app/index.html; \
    fi

CMD ["npm", "start"]