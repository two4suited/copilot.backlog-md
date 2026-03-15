#!/bin/sh
set -e

# Aspire injects the API's internal URL as services__api__http__0.
# Fall back to the container-name default for non-Aspire deployments.
API_SERVICE_URL="${services__api__http__0:-http://api:8080}"
export API_SERVICE_URL

# Substitute only ${API_SERVICE_URL} to avoid corrupting nginx variables
# such as $host, $uri, $remote_addr, etc.
envsubst '${API_SERVICE_URL}' \
    < /etc/nginx/conf.d/default.conf.template \
    > /etc/nginx/conf.d/default.conf

exec "$@"
