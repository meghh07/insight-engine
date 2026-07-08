#!/usr/bin/env python3
"""Local health checker for Insight Engine API."""

from urllib.request import urlopen
import json
import sys

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000/health/ready"

with urlopen(url, timeout=5) as response:
    data = json.loads(response.read().decode("utf-8"))

print(json.dumps(data, indent=2))
