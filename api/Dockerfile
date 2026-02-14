# 1) Use an official Node runtime as a parent image
FROM node:20-alpine

# 2) Create and set the working directory inside the container
WORKDIR /app

# 3) Copy package files first (better caching)
COPY package*.json ./

# 4) Install dependencies (clean + reproducible)
RUN npm ci --omit=dev

# 5) Copy the rest of the source code
COPY . .

# The app listens on port 3000 inside the container
EXPOSE 3000

# Start the API
CMD ["npm", "start"]
