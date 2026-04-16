FROM mcr.microsoft.com/devcontainers/base:2-noble

RUN apt-get update && \
    apt-get install -y hugo && \
    rm -rf /var/lib/apt/lists/*

USER vscode

RUN mkdir -p /home/vscode/.claude
