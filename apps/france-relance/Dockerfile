FROM nginx:1.29.7@sha256:7150b3a39203cb5bee612ff4a9d18774f8c7caf6399d6e8985e97e28eb751c18
RUN rm /etc/nginx/conf.d/default.conf

COPY --chown=nginx:root ./nginx/ /etc/nginx/
COPY --chown=nginx:root dist/france-relance/browser /usr/share/nginx/html/

#envsubst to perform the variable substitution on nginx startup
CMD ["/bin/sh",  "-c",  "exec nginx -g 'daemon off;'"]
