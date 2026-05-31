#!/usr/bin/env python3
import re

idx_f = '/var/www/amav2/backend/templates/index.html'
idx = open(idx_f).read()

# Remove the hero-trust div (the 4 duplicate badges inside the hero)
idx = re.sub(
    r'\s*<div class="hero-trust">.*?</div>\s*(?=</div>)',
    '\n    ',
    idx,
    flags=re.DOTALL
)

open(idx_f, 'w').write(idx)
print('hero-trust removed')
