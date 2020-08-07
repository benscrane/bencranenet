FROM alpine:3.12.0

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_ID

ARG INSTALL_ZSH="true"
ARG INSTALL_SCRIPT_SOURCE="https://gist.githubusercontent.com/benscrane/ad20ab32a254c1f36f76a5e08388fc9a/raw/alpine_install.sh"
ARG INSTALL_SCRIPT_SHA="dev-mode"

RUN apk update\
    && apk add --no-cache curl ca-certificates \
    && curl -sSL ${INSTALL_SCRIPT_SOURCE} -o /tmp/install.sh \
    && if [ "$INSTALL_SCRIPT_SHA" != "dev-mode" ]; then echo "$INSTALL_SCRIPT_SHA" */tmp/install.sh | sha256sum-c -; fi \
    && /bin/ash tmp/install.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" \
    && apk add yarn \
    && yarn install \
    && apk add ruby ruby-bigdecimal ruby-irb less libressl \
    && apk add build-base ruby-dev libressl-dev \
    && gem install bundler:1.17.3 \
    && bundle config build.nokogiri --use-system-libraries \
    && gem install json \
    && gem cleanup