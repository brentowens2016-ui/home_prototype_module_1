# Simple production Dockerfile for React dashboard
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN (chmod +x node_modules/.bin/* || true) && npm run build

# Serve with a lightweight static server
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
