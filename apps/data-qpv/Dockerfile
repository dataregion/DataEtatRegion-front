FROM nginx:1.29.1@sha256:33e0bbc7ca9ecf108140af6288c7c9d1ecc77548cbfd3952fd8466a75edefe57
RUN rm /etc/nginx/conf.d/default.conf

COPY --chown=nginx:root ./nginx/ /etc/nginx/
COPY --chown=nginx:root dist/data-qpv/browser /usr/share/nginx/html/

#envsubst to perform the variable substitution on nginx startup
CMD ["/bin/sh",  "-c",  "exec nginx -g 'daemon off;'"]
