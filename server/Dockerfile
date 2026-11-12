FROM caddy:2-alpine

COPY Caddyfile.dev /etc/caddy/Caddyfile.dev
COPY Caddyfile.prod /etc/caddy/Caddyfile.prod

COPY Caddyfile.prod /etc/caddy/Caddyfile

EXPOSE 80
EXPOSE 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
