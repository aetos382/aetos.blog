FROM mcr.microsoft.com/devcontainers/base:2-noble

ARG HUGO_VERSION=0.160.1
ARG DART_SASS_VERSION=1.99.0
ARG RUBY_VERSION=3.4.9
ARG GO_VERSION=1.26.2
ARG NODE_VERSION=24.15.0

ARG REPOSITORY_HASH=unspecified

WORKDIR /tmp

RUN mkdir /usr/local/hugo && \
    curl -qfsSL https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz | tar -C /usr/local/hugo -xz

RUN mkdir /usr/local/dart-sass && \
    curl -qfsSL https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz | tar -C /usr/local/dart-sass -xz --strip-components=1

RUN mkdir /usr/local/go && \
    curl -fqsLS https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz | tar -C /usr/local/go -xz --strip-components=1

RUN mkdir /usr/local/node && \
    curl -fqsLS https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz | tar -C /usr/local/node -xJ --strip-components=1

RUN mkdir /usr/local/ruby && \
    curl -fqsLS https://github.com/jdx/ruby/releases/download/${RUBY_VERSION}/ruby-${RUBY_VERSION}.x86_64_linux.tar.gz | tar -C /usr/local/ruby -xz --strip-components=1

ENV PATH=/usr/local/hugo:/usr/local/dart-sass:/usr/local/ruby/bin:/usr/local/go/bin:/usr/local/node/bin:$PATH
ENV GOTOOLCHAIN=local
ENV REPOSITORY_HASH=${REPOSITORY_HASH}

RUN hugo completion bash > /etc/bash_completion.d/hugo

USER vscode

RUN mkdir -p /home/vscode/.claude
