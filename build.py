#!/usr/bin/env python3
"""Build the static site (index.html + logic.js) from memoryorb/project/Main.dc.html."""
import re, glob, os
src = open('memoryorb/project/Main.dc.html', encoding='utf-8').read()
body = src[src.index('<x-dc>') + 6:src.index('</x-dc>')]
code = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', src, re.S).group(1)
title = re.search(r'<title>(.*?)</title>', src).group(1)
files = {os.path.splitext(os.path.basename(f))[0]: os.path.basename(f) for f in glob.glob('assets/*')}
body = re.sub(r'/_blob/([0-9a-f]+)', lambda m: 'assets/' + files[m.group(1)], body)
open('logic.js', 'w', encoding='utf-8').write(code + '\nDC.mount(Component);\n')
open('index.html', 'w', encoding='utf-8').write(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a0907">
<title>{title}</title>
<style>html,body{{margin:0;background:#0a0907}}</style>
</head>
<body>
<div id="app"></div>
<template id="tpl">{body}</template>
<script src="runtime.js"></script>
<script src="logic.js"></script>
</body>
</html>
''')
print('built index.html, logic.js')
