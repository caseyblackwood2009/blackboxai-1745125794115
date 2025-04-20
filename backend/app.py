import os
from flask import Flask, request, jsonify, redirect, make_response, render_template_string
from dotenv import load_dotenv
from shortener import Shortener
from utils import is_bot, generate_gibberish
from datetime import datetime, timedelta

load_dotenv(dotenv_path='.env')

PORT = int(os.getenv('PORT', 5000))
MAIN_DOMAIN = os.getenv('MAIN_DOMAIN', 'elitetradershubllc.com/shortlink')
MAIN_ADMIN_PASSWORD = os.getenv('MAIN_ADMIN_PASSWORD', 'My%admin1_2@3')
MULTIPLE_DOMAINS = os.getenv('MULTIPLE_DOMAINS', 'OFF').upper() == 'ON'
DOMAINS = [
    os.getenv('DOMAIN_1', ''),
    os.getenv('DOMAIN_2', ''),
    os.getenv('DOMAIN_3', ''),
    os.getenv('DOMAIN_4', '')
]
DEVELOPER_MODE = os.getenv('DEVELOPER_MODE', 'ON').upper() == 'ON'

app = Flask(__name__)
shortener = Shortener()

@app.route('/api/shorten', methods=['POST'])
def shorten_url():
    data = request.json
    original_url = data.get('url')
    useradmin_enabled = data.get('useradmin', False)
    useradmin_password = data.get('useradmin_password', '')
    enable_lifespan = data.get('enable_lifespan', False)
    lifespan_hours = data.get('lifespan_hours', 0)
    lifespan_days = data.get('lifespan_days', 0)
    lifespan_weeks = data.get('lifespan_weeks', 0)
    multiple_links_enabled = data.get('multiple_links_enabled', False)
    multiple_links_count = data.get('multiple_links_count', 1)

    if not original_url:
        return jsonify({'error': 'URL is required'}), 400

    lifespan_seconds = (lifespan_hours * 3600) + (lifespan_days * 86400) + (lifespan_weeks * 604800)
    if not enable_lifespan:
        lifespan_seconds = 0

    short_links = []
    for _ in range(multiple_links_count):
        short_code = generate_gibberish(6)
        short_url = f"https://{MAIN_DOMAIN}/{short_code}"
        shortener.add_link(short_code, original_url, useradmin_enabled, useradmin_password, lifespan_seconds)
        short_links.append(short_url)

    return jsonify({'short_links': short_links})

@app.route('/<short_code>')
def redirect_short_link(short_code):
    # Redirect logic with verification page and cookie
    link = shortener.get_link(short_code)
    if not link:
        return "Link not found", 404

    # Check for verification cookie
    verified = request.cookies.get('verified_' + short_code)
    if verified:
        # Redirect to original URL
        return redirect(link['original_url'])
    else:
        # Redirect to verify page with short_code param
        return redirect(f"/verify.html?code={short_code}")

@app.route('/api/verify', methods=['GET'])
def verify():
    short_code = request.args.get('code')
    if not short_code:
        return jsonify({'error': 'Code is required'}), 400

    # Set verification cookie for 12 seconds
    resp = make_response(jsonify({'verified': True}))
    resp.set_cookie('verified_' + short_code, 'true', max_age=12)
    return resp

@app.route('/api/admin', methods=['POST'])
def admin_dashboard():
    data = request.json
    password = data.get('password')
    if password != MAIN_ADMIN_PASSWORD:
        return jsonify({'error': 'Unauthorized'}), 401

    links = shortener.get_all_links()
    return jsonify({'links': links})

@app.route('/api/admin/update', methods=['POST'])
def admin_update():
    data = request.json
    password = data.get('password')
    if password != MAIN_ADMIN_PASSWORD:
        return jsonify({'error': 'Unauthorized'}), 401

    short_code = data.get('short_code')
    action = data.get('action')
    value = data.get('value')

    if not short_code or not action:
        return jsonify({'error': 'Missing parameters'}), 400

    if action == 'remove':
        shortener.remove_link(short_code)
    elif action == 'extend_lifespan':
        shortener.extend_lifespan(short_code, value)
    elif action == 'edit_url':
        shortener.edit_url(short_code, value)
    elif action == 'toggle_warning':
        shortener.toggle_warning(short_code, value)
    else:
        return jsonify({'error': 'Invalid action'}), 400

    return jsonify({'success': True})

@app.route('/api/useradmin/<short_code>', methods=['POST'])
def user_admin(short_code):
    data = request.json
    password = data.get('password')
    link = shortener.get_link(short_code)
    if not link:
        return jsonify({'error': 'Link not found'}), 404

    if not link['useradmin_enabled'] or password != link['useradmin_password']:
        return jsonify({'error': 'Unauthorized'}), 401

    stats = shortener.get_stats(short_code)
    return jsonify({'stats': stats})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEVELOPER_MODE)
