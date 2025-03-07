FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_RANDOM_PROBLEM_URL
ARG VITE_GENERATE_FEEDBACK_URL
ENV VITE_RANDOM_PROBLEM_URL=$VITE_RANDOM_PROBLEM_URL
ENV VITE_GENERATE_FEEDBACK_URL=$VITE_GENERATE_FEEDBACK_URL

RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
