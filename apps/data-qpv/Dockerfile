FROM nginx:1.29.0@sha256:93230cd54060f497430c7a120e2347894846a81b6a5dd2110f7362c5423b4abc
RUN rm /etc/nginx/conf.d/default.conf

COPY --chown=nginx:root ./nginx/ /etc/nginx/
COPY --chown=nginx:root dist/data-qpv/browser /usr/share/nginx/html/

#envsubst to perform the variable substitution on nginx startup
CMD ["/bin/sh",  "-c",  "exec nginx -g 'daemon off;'"]
