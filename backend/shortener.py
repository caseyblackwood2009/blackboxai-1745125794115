import threading
import time
from datetime import datetime, timedelta
import sqlite3
import os

DB_PATH = 'shortener.db'

class Shortener:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.create_table()
        self.lock = threading.Lock()
        self.start_cleanup_thread()

    def create_table(self):
        with self.conn:
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS links (
                    short_code TEXT PRIMARY KEY,
                    original_url TEXT NOT NULL,
                    useradmin_enabled INTEGER NOT NULL,
                    useradmin_password TEXT,
                    created_at TIMESTAMP NOT NULL,
                    lifespan_seconds INTEGER,
                    warning_enabled INTEGER DEFAULT 0,
                    warning_issued INTEGER DEFAULT 0
                )
            ''')
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS stats (
                    short_code TEXT,
                    timestamp TIMESTAMP,
                    is_bot INTEGER,
                    FOREIGN KEY(short_code) REFERENCES links(short_code)
                )
            ''')

    def add_link(self, short_code, original_url, useradmin_enabled, useradmin_password, lifespan_seconds):
        with self.lock:
            with self.conn:
                self.conn.execute('''
                    INSERT INTO links (short_code, original_url, useradmin_enabled, useradmin_password, created_at, lifespan_seconds)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (short_code, original_url, int(useradmin_enabled), useradmin_password, datetime.utcnow(), lifespan_seconds))

    def get_link(self, short_code):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM links WHERE short_code = ?', (short_code,))
        row = cur.fetchone()
        if row:
            return {
                'short_code': row[0],
                'original_url': row[1],
                'useradmin_enabled': bool(row[2]),
                'useradmin_password': row[3],
                'created_at': row[4],
                'lifespan_seconds': row[5],
                'warning_enabled': bool(row[6]),
                'warning_issued': bool(row[7])
            }
        return None

    def get_all_links(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM links')
        rows = cur.fetchall()
        links = []
        for row in rows:
            links.append({
                'short_code': row[0],
                'original_url': row[1],
                'useradmin_enabled': bool(row[2]),
                'useradmin_password': row[3],
                'created_at': row[4],
                'lifespan_seconds': row[5],
                'warning_enabled': bool(row[6]),
                'warning_issued': bool(row[7])
            })
        return links

    def remove_link(self, short_code):
        with self.lock:
            with self.conn:
                self.conn.execute('DELETE FROM links WHERE short_code = ?', (short_code,))
                self.conn.execute('DELETE FROM stats WHERE short_code = ?', (short_code,))

    def extend_lifespan(self, short_code, extra_seconds):
        with self.lock:
            link = self.get_link(short_code)
            if link:
                new_lifespan = (link['lifespan_seconds'] or 0) + int(extra_seconds)
                with self.conn:
                    self.conn.execute('UPDATE links SET lifespan_seconds = ? WHERE short_code = ?', (new_lifespan, short_code))

    def edit_url(self, short_code, new_url):
        with self.lock:
            with self.conn:
                self.conn.execute('UPDATE links SET original_url = ? WHERE short_code = ?', (new_url, short_code))

    def toggle_warning(self, short_code, enable):
        with self.lock:
            with self.conn:
                self.conn.execute('UPDATE links SET warning_enabled = ? WHERE short_code = ?', (1 if enable else 0, short_code))

    def add_stat(self, short_code, is_bot):
        with self.lock:
            with self.conn:
                self.conn.execute('INSERT INTO stats (short_code, timestamp, is_bot) VALUES (?, ?, ?)', (short_code, datetime.utcnow(), int(is_bot)))

    def get_stats(self, short_code):
        cur = self.conn.cursor()
        cur.execute('SELECT COUNT(*) FROM stats WHERE short_code = ? AND is_bot = 0', (short_code,))
        human_visits = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM stats WHERE short_code = ? AND is_bot = 1', (short_code,))
        bot_visits = cur.fetchone()[0]
        total_visits = human_visits + bot_visits
        return {
            'human_visits': human_visits,
            'bot_visits': bot_visits,
            'total_visits': total_visits
        }

    def cleanup_expired_links(self):
        while True:
            with self.lock:
                now = datetime.utcnow()
                cur = self.conn.cursor()
                cur.execute('SELECT short_code, created_at, lifespan_seconds, warning_issued FROM links')
                rows = cur.fetchall()
                for row in rows:
                    short_code, created_at, lifespan_seconds, warning_issued = row
                    if lifespan_seconds is None or lifespan_seconds == 0:
                        continue
                    created_at_dt = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S.%f')
                    age = (now - created_at_dt).total_seconds()
                    if age > lifespan_seconds + 48*3600:
                        # Delete after 48 hours past lifespan
                        self.remove_link(short_code)
                    elif age > lifespan_seconds + 24*3600 and not warning_issued:
                        # Mark warning issued after 24 hours past lifespan
                        with self.conn:
                            self.conn.execute('UPDATE links SET warning_issued = 1 WHERE short_code = ?', (short_code,))
            time.sleep(3600)  # Run cleanup every hour

    def start_cleanup_thread(self):
        thread = threading.Thread(target=self.cleanup_expired_links, daemon=True)
        thread.start()
