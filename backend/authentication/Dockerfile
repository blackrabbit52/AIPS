# Build stage
FROM maven:3.8.4-openjdk-17 AS builder

# Set working directory
WORKDIR /build

# Copy only the POM file first
COPY pom.xml .

# Download dependencies (this layer will be cached)
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17-slim

# Set working directory
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Copy jar from builder
COPY --from=builder /build/target/authentication-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Set Java options
ENV JAVA_OPTS="-Xms512m -Xmx512m"

# Start the application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 