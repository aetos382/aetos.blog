FROM mcr.microsoft.com/devcontainers/base:2-noble

ARG RUBY_VERSION=4.0.2
ARG GO_VERSION=1.26.2

WORKDIR /tmp

RUN mkdir /usr/local/ruby && \
    curl -fqsLS https://github.com/jdx/ruby/releases/download/${RUBY_VERSION}/ruby-${RUBY_VERSION}.x86_64_linux.tar.gz -O ruby.tar.gz &&
    tar -C /usr/local/ruby -xzf ruby.tar.gz --strip-components=1 ruby-${RUBY_VERSION}/bin && \
    rm ruby.tar.gz

RUN curl -fqsLS https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz -O go.tar.gz && \
    tar -C /usr/local -xzf go.tar.gz && \
    rm go.tar.gz

ENV PATH=/usr/local/ruby/bin:/usr/local/go/bin:$PATH
ENV GOTOOLCHAIN=local

USER vscode

RUN mkdir -p /home/vscode/.claude
