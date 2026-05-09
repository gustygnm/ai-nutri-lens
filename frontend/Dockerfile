# Use a lightweight Nginx image to serve the static SPA
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the application files to the Nginx html directory
COPY . /usr/share/nginx/html

# Expose port 8080 as required by Cloud Run default
EXPOSE 8080

# Inject the API_KEY environment variable into a runtime config file before starting Nginx
# SECURITY NOTE: We use Base64 encoding here as a basic OBFUSCATION technique. 
# This hides the key from simple automated scrapers, but IT IS NOT TRUE ENCRYPTION.
# A determined user can still decode this from the browser console.
CMD ["/bin/sh", "-c", "ENCODED_KEY=$(echo -n \"${API_KEY}\" | base64); echo \"window.process = window.process || {}; window.process.env = window.process.env || {}; window.process.env.ENCODED_API_KEY = '${ENCODED_KEY}';\" > /usr/share/nginx/html/env-config.js && nginx -g 'daemon off;'"]
