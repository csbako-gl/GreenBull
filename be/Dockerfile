FROM maven:3.9-eclipse-temurin-20-alpine AS build
COPY src /home/app/src
COPY pom.xml /home/app
RUN mvn -f /home/app/pom.xml clean package

FROM openjdk:20-slim
ARG GREENBULL_VERSION="unknown"
COPY --from=build /home/app/target/greenbull-0.0.1-SNAPSHOT.jar /usr/local/lib/greenbull.jar
ADD src/main/resources/Application.yaml /opt/conf/Application.yaml
EXPOSE 8080
ENV GREENBULL_VERSION "$GREENBULL_VERSION"
ENTRYPOINT ["sh","-c","java ${JAVA_OPTS} -jar /usr/local/lib/greenbull.jar --spring.config.location=file:/opt/conf/Application.yaml"]