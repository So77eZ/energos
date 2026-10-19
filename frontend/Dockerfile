FROM mirror.gcr.io/library/node:24-alpine
# FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* вшиваются в код при сборке
ARG NEXT_PUBLIC_ORIGIN
ENV NEXT_PUBLIC_ORIGIN=$NEXT_PUBLIC_ORIGIN

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
