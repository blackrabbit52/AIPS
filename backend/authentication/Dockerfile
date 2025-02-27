# Build stage
FROM eclipse-temurin:11-jdk-alpine as build

# Maven cache configuration
ENV MAVEN_OPTS="-Dmaven.repo.local=/root/.m2/repository"

# Install required dependencies
RUN apk add --no-cache curl

WORKDIR /build

# Copy only pom.xml for dependency caching
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies (will be cached)
RUN --mount=type=cache,target=/root/.m2/repository \
    ./mvnw dependency:go-offline

# Copy the rest of the source code
COPY src src

# Build with detailed logs
RUN --mount=type=cache,target=/root/.m2/repository \
    ./mvnw clean package -DskipTests -X

# Verify contents
RUN ls -la target/

# Runtime stage
FROM eclipse-temurin:11-jre-alpine

WORKDIR /app

# Copy JAR with explicit name
COPY --from=build /build/target/authentication-1.0.0.jar /app/app.jar

# Install curl for healthcheck
RUN apk add --no-cache curl

EXPOSE 8080

# Health check with correct endpoint path
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Add Java environment variables for logging
ENV JAVA_OPTS="-Dlogging.level.root=INFO -Dlogging.level.com.aips=DEBUG"

# Start with detailed logs
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 