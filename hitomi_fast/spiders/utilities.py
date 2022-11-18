# -*- coding: utf-8 -*-
import functools
import os
import sys
from http.server import HTTPServer
from http.server import SimpleHTTPRequestHandler


def start_http_server(root: str, host: str, port: int):
    # keep the server quiet
    sys.stdout = open(os.devnull, 'w')
    sys.stderr = open(os.devnull, 'w')
    # change server root directory
    handler = SimpleHTTPRequestHandler
    handler = functools.partial(handler, directory=root)
    # start server on a dedicated port
    HTTPServer.allow_reuse_address = False
    httpd = HTTPServer((host, port), handler)
    httpd.serve_forever()
