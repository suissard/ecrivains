# Build stage
FROM node:24-alpine AS build

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies using clean install
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to the nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
