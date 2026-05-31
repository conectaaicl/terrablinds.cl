#!/usr/bin/env python3
import re

idx_f = '/var/www/amav2/backend/templates/index.html'
idx = open(idx_f).read()

# Remove the broken leftover orphan lines from the partial removal
# (from the comment down to the closing </div></div> before section 3)
idx = re.sub(
    r'\n<!-- ── 2\. Trust strip.*?</div>\n\n<!-- ── 3\. Featured',
    '''
<!-- ── 2. Trust strip ──────────────────────────────────────── -->
<div class="trust-strip">
  <div class="container">
    <div class="trust-strip-inner">
      <div class="trust-item">
        <div class="trust-item-icon">📦</div>
        Envío en empaque discreto
      </div>
      <div class="trust-dot"></div>
      <div class="trust-item">
        <div class="trust-item-icon">🌿</div>
        Solo materiales body-safe
      </div>
      <div class="trust-dot"></div>
      <div class="trust-item">
        <div class="trust-item-icon">💬</div>
        Asesoría 100% privada por WhatsApp
      </div>
      <div class="trust-dot"></div>
      <div class="trust-item">
        <div class="trust-item-icon">✅</div>
        Marcas verificadas y certificadas
      </div>
    </div>
  </div>
</div>

<!-- ── 3. Featured''',
    idx,
    flags=re.DOTALL
)

open(idx_f, 'w').write(idx)
print('Trust strip restored')
