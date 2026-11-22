# --- Compilación ---
FROM maven:3.9-eclipse-temurin-17 AS compilacion
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -Dmaven.test.skip=true package

# --- Ejecución ---
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=compilacion /app/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
