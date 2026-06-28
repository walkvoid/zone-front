#!/usr/bin/env python3
"""Serve zone-admin dist with /api proxy to backend."""
import http.server
import os
import socketserver
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "apps", "zone-admin", "dist")
BACKEND = os.environ.get("ZONE_BACKEND_URL", "http://localhost:8080")
PORT = int(os.environ.get("ZONE_SERVE_PORT", "5173"))


class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api"):
            self._proxy()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api"):
            self._proxy()
        else:
            self.send_error(404, "Not Found")

    def do_PUT(self):
        if self.path.startswith("/api"):
            self._proxy()
        else:
            self.send_error(404, "Not Found")

    def do_DELETE(self):
        if self.path.startswith("/api"):
            self._proxy()
        else:
            self.send_error(404, "Not Found")

    def do_PATCH(self):
        if self.path.startswith("/api"):
            self._proxy()
        else:
            self.send_error(404, "Not Found")

    def _proxy(self):
        url = BACKEND + self.path
        if self.headers.get("Content-Length"):
            data = self.rfile.read(int(self.headers["Content-Length"]))
        else:
            data = None

        req = urllib.request.Request(url, data=data, method=self.command)
        for header, value in self.headers.items():
            if header.lower() in ("host", "connection"):
                continue
            req.add_header(header, value)

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                self.send_response(resp.status)
                for header, value in resp.headers.items():
                    if header.lower() not in ("transfer-encoding", "connection"):
                        self.send_header(header, value)
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(resp.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_error(502, f"Backend error: {e}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,DELETE,PATCH,OPTIONS",
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        self.end_headers()

    def log_message(self, format, *args):
        if "/api/" not in args[0] or args[1] not in ("200", "304"):
            sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]}\n")


if __name__ == "__main__":
    print(f"Serving {DIST} on http://localhost:{PORT}")
    print(f"API proxy -> {BACKEND}")
    with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
        httpd.allow_reuse_address = True
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down.")
