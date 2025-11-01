import http.server
import socketserver
import os

os.chdir(r'c:\Users\neruk\OneDrive\Desktop\tour')

PORT = 8888
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Сервер запущен на http://localhost:{PORT}")
    httpd.serve_forever()