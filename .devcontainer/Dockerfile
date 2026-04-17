FROM mcr.microsoft.com/devcontainers/base:2-noble

ARG HUGO_VERSION=0.160.1
ARG DART_SASS_VERSION=1.99.0
ARG RUBY_VERSION=3.4.9
ARG GO_VERSION=1.26.2
ARG REPOSITORY_HASH=unspecified

WORKDIR /tmp

RUN mkdir /usr/local/hugo && \
    curl -qfsSL https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz -o hugo.tar.gz && \
    tar -C /usr/local/hugo -xzf hugo.tar.gz && \
    rm hugo.tar.gz

RUN mkdir /usr/local/dart-sass && \
    curl -qfsSL https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz -o dart-sass.tar.gz && \
    tar -C /usr/local/dart-sass -xzf dart-sass.tar.gz --strip-components=1 && \
    rm dart-sass.tar.gz

RUN mkdir /usr/local/ruby && \
    curl -fqsLS https://github.com/jdx/ruby/releases/download/${RUBY_VERSION}/ruby-${RUBY_VERSION}.x86_64_linux.tar.gz -o ruby.tar.gz && \
    tar -C /usr/local/ruby -xzf ruby.tar.gz --strip-components=1 ruby-${RUBY_VERSION}/bin ruby-${RUBY_VERSION}/lib && \
    rm ruby.tar.gz

RUN mkdir /usr/local/go && \
    curl -fqsLS https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz -o go.tar.gz && \
    tar -C /usr/local/go -xzf go.tar.gz --strip-components=1 && \
    rm go.tar.gz

COPY --chmod=+x [".devcontainer/ruby-gems.sh", "/etc/profile.d/"]

USER vscode

RUN mkdir -p /home/vscode/.claude
RUN mkdir -p /home/vscode/.gem

ENV PATH=/usr/local/hugo:/usr/local/dart-sass:/usr/local/ruby/bin:/usr/local/go/bin:$PATH
ENV GOTOOLCHAIN=local
ENV REPOSITORY_HASH=${REPOSITORY_HASH}
