# Full Link Shortener System

## Overview
This is a full-featured link shortener system with multi-domain support, admin dashboards, redirect verification, lifespan management, and more. The backend is built with Python Flask, and the frontend is pure HTML + JavaScript with CSS-styled inputs and buttons (no actual form or input tags).

## Features
- Shorten URLs with custom lifespan and multiple link generation
- Multi-domain support (configurable ON/OFF)
- Main admin dashboard with password protection to manage all shortened links
- User admin dashboard for each shortened link with password to monitor visits
- Redirect verification page to distinguish bots from humans
- Dark/light mode toggle on the main landing page
- No actual form or input tags; all UI elements are CSS styled divs/spans with JavaScript handling
- Lifespan management with automatic expiration and deletion
- Developer mode for local development or production use

## Environment Variables (.env)
- PORT: Port number for backend server
- MAIN_DOMAIN: Main domain used for short links (e.g., `elitetradershubllc.com/shortlink`)
- MAIN_ADMIN_PASSWORD: Password for main admin dashboard
- MULTIPLE_DOMAINS: ON/OFF to enable multiple domains
- DOMAIN_1, DOMAIN_2, DOMAIN_3, DOMAIN_4: Domains used when MULTIPLE_DOMAINS=ON
- DEVELOPER_MODE: ON/OFF to indicate local development or production mode

## Setup Instructions

1. Clone the repository or copy the files to your server.

2. Create a `.env` file in the `backend/` directory with the following content:

```
PORT=5000
MAIN_DOMAIN=elitetradershubllc.com/shortlink
MAIN_ADMIN_PASSWORD=My%admin1_2@3
MULTIPLE_DOMAINS=OFF
DOMAIN_1=
DOMAIN_2=
DOMAIN_3=
DOMAIN_4=
DEVELOPER_MODE=ON
```

3. Install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

4. Run the backend server inside a tmux session:

```bash
tmux new -s linkshortener
python app.py
```

5. Serve the frontend files using any static file server or open `frontend/index.html` in your browser.

## Usage

- Use the main landing page to shorten URLs with options for user admin, lifespan, and multiple links.
- Access the main admin dashboard at `/admin.html` with the main admin password.
- Access user admin dashboards at `/useradmin.html` with the user password.
- Redirects will go through a verification page to filter bots.

## Notes

- The backend uses SQLite for storage.
- Lifespan expiration and deletion are handled automatically.
- Developer mode enables local testing features.

## License

MIT License
