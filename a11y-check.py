import re
from pathlib import Path
p = Path('index.html')
s = p.read_text(encoding='utf-8')
issues = []

# 1. Images without alt or empty alt
for m in re.finditer(r"<img\s+([^>]+)>", s, flags=re.IGNORECASE):
    attrs = m.group(1)
    if 'alt=' not in attrs.lower():
        issues.append(f"Image tag missing alt: {m.group(0)}")
    else:
        # check alt value empty
        alt_m = re.search(r"alt\s*=\s*\"([^\"]*)\"|alt\s*=\s*'([^']*)'", attrs, flags=re.IGNORECASE)
        if alt_m:
            alt_val = alt_m.group(1) if alt_m.group(1) is not None else alt_m.group(2)
            if alt_val.strip() == '':
                issues.append(f"Image has empty alt attribute: {m.group(0)}")

# 2. Video elements missing <track kind="captions">
for m in re.finditer(r"<video\b([^>]*)>(.*?)</video>", s, flags=re.IGNORECASE|re.DOTALL):
    inner = m.group(2)
    if not re.search(r"<track\b[^>]*kind\s*=\s*\"captions\"|<track\b[^>]*kind\s*=\s*'captions'", inner, flags=re.IGNORECASE):
        issues.append(f"<video> missing captions track: {m.group(0)[:120].strip()}...")

# 3. Anchors with href="#" lacking aria-label or descriptive text
for m in re.finditer(r"<a\b([^>]*)>(.*?)</a>", s, flags=re.IGNORECASE|re.DOTALL):
    attrs = m.group(1)
    text = re.sub(r"<[^>]+>", "", m.group(2)).strip()
    href_m = re.search(r"href\s*=\s*\"([^\"]*)\"|href\s*=\s*'([^']*)'", attrs, flags=re.IGNORECASE)
    if href_m:
        href = href_m.group(1) if href_m.group(1) is not None else href_m.group(2)
        if href == '#':
            # check for aria-label
            if not re.search(r"aria-label\s*=", attrs, flags=re.IGNORECASE):
                # check if text is descriptive
                if text == '' or len(text) < 4 or text.lower() in ['click','go','open','link']:
                    issues.append(f"Anchor with href='#' missing aria-label or descriptive text: {m.group(0)[:120].strip()}...")

# 4. Inputs without labels (none expected but check)
for m in re.finditer(r"<input\b([^>]*)>", s, flags=re.IGNORECASE):
    attrs = m.group(1)
    if not re.search(r"id\s*=", attrs, flags=re.IGNORECASE) and not re.search(r"aria-label\s*=", attrs, flags=re.IGNORECASE) and not re.search(r"name\s*=", attrs, flags=re.IGNORECASE):
        issues.append(f"Input missing id/name/aria-label: {m.group(0)}")

# Write report
out = Path('a11y-report.txt')
if issues:
    lines = ['Accessibility issues found:'] + issues
else:
    lines = ['No obvious issues found by this scan.']
out.write_text('\n'.join(lines), encoding='utf-8')
print('Wrote a11y-report.txt')
