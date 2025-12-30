FROM nginx:1.29.4@sha256:ca871a86d45a3ec6864dc45f014b11fe626145569ef0e74deaffc95a3b15b430
RUN rm /etc/nginx/conf.d/default.conf

COPY --chown=nginx:root ./nginx/ /etc/nginx/
COPY --chown=nginx:root dist/budget-dataetat/browser /usr/share/nginx/html/

#envsubst to perform the variable substitution on nginx startup
CMD ["/bin/sh",  "-c",  "exec nginx -g 'daemon off;'"]
