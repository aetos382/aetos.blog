FROM mcr.microsoft.com/devcontainers/base:2-noble

ARG GO_VERSION=1.26.2

WORKDIR /tmp

RUN curl -fqsLS https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz -O go.tar.gz && \
    tar -C /usr/local -xzf go.tar.gz && \
    rm go.tar.gz

ENV PATH=/usr/local/go/bin:$PATH
ENV GOTOOLCHAIN=local

USER vscode

RUN mkdir -p /home/vscode/.claude
