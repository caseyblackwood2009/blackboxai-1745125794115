# Full Link Shortener System

## Overview

This project is a full link shortener system with backend API, frontend UI, admin dashboards, and environment-based configuration. It supports multiple domains, user admin, lifespan management, and bot detection.

## Backend

- Python Flask app in `backend/`
- Uses SQLite for storage (`shortener.db`)
- Environment variables configured in `.env`
- Run backend with:
  ```
  cd backend
  pip install -r requirements.txt
  python app.py
  ```
- API base URL configured via `MAIN_DOMAIN` in `.env`

## Frontend

- Static files in `frontend/`
- Uses ES modules for JavaScript; script tags include `type="module"`
- API base URL configured in `frontend/assets/config.js` via `DEVELOPER_MODE` flag
- Serve frontend with any static server, e.g.:
  ```
  cd frontend
  python3 -m http.server 8000
  ```
- Access UI at `http://localhost:8000/index.html`

## Environment Configuration (`backend/.env`)

```
PORT=5000
MAIN_DOMAIN=elitetradershubllc.com/shortner
MAIN_ADMIN_PASSWORD=My%admin1_2@3
MULTIPLE_DOMAINS=OFF
DOMAIN_1=
DOMAIN_2=
DOMAIN_3=
DOMAIN_4=
DEVELOPER_MODE=ON
```

- Set `DEVELOPER_MODE=ON` for debug mode, `OFF` for production.

## NGINX Configuration

Use the provided `nginx-linkshortener.conf` to serve the main website and link shortener under `/shortner` path.

```nginx
server {
    listen 80;
    server_name elitetradershubllc.com;

    root /var/www/elitetradershubllc.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /shortner/ {
        alias /var/www/elitetradershubllc.com/shortner/;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /shortner/api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Notes

- Update `frontend/assets/config.js` to toggle API base URL for local or production.
- Ensure all frontend script tags use `type="module"` for ES module support.
- Test locally by running backend on port 5000 and serving frontend on port 8000.
- Adjust `.env` and NGINX config accordingly for production deployment.

---

This completes the full working code and configuration for your link shortener system. You can now deploy and test it as needed.
