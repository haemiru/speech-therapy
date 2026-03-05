"""사업계획서 Markdown → HTML 변환 (Puppeteer PDF용)"""
import sys
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import markdown

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MD_PATH = os.path.join(SCRIPT_DIR, "사업계획서_소리야놀자.md")
HTML_PATH = os.path.join(SCRIPT_DIR, "사업계획서_소리야놀자.html")

with open(MD_PATH, "r", encoding="utf-8") as f:
    md_content = f.read()

html_body = markdown.markdown(
    md_content,
    extensions=["tables", "fenced_code", "toc", "nl2br"],
)

full_html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>사업계획서 - 소리야 놀자!</title>
<style>
@page {{
    size: A4;
    margin: 2.5cm 2cm 2.5cm 2.5cm;
}}

body {{
    font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
    font-size: 10.5pt;
    line-height: 1.75;
    color: #222;
    max-width: 100%;
    word-break: keep-all;
    overflow-wrap: break-word;
}}

h1 {{
    font-size: 18pt;
    font-weight: bold;
    color: #1a1a2e;
    border-bottom: 3px solid #2C5F8D;
    padding-bottom: 8px;
    margin-top: 36px;
    margin-bottom: 20px;
    page-break-after: avoid;
}}

h2 {{
    font-size: 14pt;
    font-weight: bold;
    color: #2C5F8D;
    margin-top: 28px;
    margin-bottom: 12px;
    border-left: 4px solid #2C5F8D;
    padding-left: 10px;
    page-break-after: avoid;
}}

h3 {{
    font-size: 12pt;
    font-weight: bold;
    color: #333;
    margin-top: 20px;
    margin-bottom: 8px;
    page-break-after: avoid;
}}

h4 {{
    font-size: 11pt;
    font-weight: bold;
    color: #555;
    margin-top: 16px;
    margin-bottom: 6px;
    page-break-after: avoid;
}}

table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
}}

th {{
    background-color: #2C5F8D;
    color: white;
    font-weight: bold;
    padding: 8px 10px;
    text-align: left;
    border: 1px solid #2C5F8D;
}}

td {{
    padding: 6px 10px;
    border: 1px solid #ddd;
    vertical-align: top;
    word-break: keep-all;
    overflow-wrap: break-word;
}}

tr:nth-child(even) {{
    background-color: #f8f9fa;
}}

code {{
    font-family: 'D2Coding', 'Consolas', monospace;
    background-color: #f4f4f4;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 9pt;
}}

pre {{
    background-color: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 14px;
    font-size: 8.5pt;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    page-break-inside: avoid;
}}

pre code {{
    background: none;
    padding: 0;
}}

blockquote {{
    border-left: 4px solid #FF9933;
    margin: 12px 0;
    padding: 8px 16px;
    background-color: #fff8f0;
    color: #555;
    font-style: italic;
}}

strong {{
    color: #1a1a2e;
}}

hr {{
    border: none;
    border-top: 1px solid #ddd;
    margin: 28px 0;
}}

ul, ol {{
    margin: 8px 0;
    padding-left: 24px;
}}

li {{
    margin-bottom: 4px;
}}

p {{
    margin: 6px 0;
}}

/* 화면캡처 플레이스홀더 스타일 */
p:has(> text) {{
    break-inside: avoid;
}}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(full_html)

print(f"HTML generated: {HTML_PATH}")
