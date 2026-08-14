import base64

with open('public/logo_thumb.b64', 'r') as f:
    logo_b64 = f.read().strip()

html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Options & South Indian Real Estate Expense Engine</title>
  <style>
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }}
    
    :root {{
      --bg: #000000;
      --card: #0a0a0a;
      --border: #222222;
      --text-main: #ffffff;
      --text-muted: #888888;
      --accent-green: #22c55e;
      --accent-gold: #f59e0b;
      --accent-blue: #3b82f6;
      --highlight-bg: #111111;
    }}

    body.theme-a {{
      --bg: #000000;
      --card: #0a0a0a;
      --border: #222222;
      --text-main: #ffffff;
      --text-muted: #888888;
      --accent-green: #22c55e;
      --accent-gold: #f59e0b;
      --accent-blue: #3b82f6;
      --highlight-bg: #141414;
    }}

    body.theme-b {{
      --bg: #060907;
      --card: #0c130f;
      --border: #1a2b20;
      --text-main: #f0fdf4;
      --text-muted: #7d9685;
      --accent-green: #10b981;
      --accent-gold: #d97706;
      --accent-blue: #0284c7;
      --highlight-bg: #132219;
    }}

    body.theme-c {{
      --bg: #060913;
      --card: #0e1526;
      --border: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent-green: #10b981;
      --accent-gold: #fbbf24;
      --accent-blue: #38bdf8;
      --highlight-bg: #18233c;
    }}

    body {{
      background: var(--bg);
      color: var(--text-main);
      padding: 20px;
      line-height: 1.5;
      transition: background 0.2s ease, color 0.2s ease;
    }}

    .max-w {{
      max-width: 1200px;
      margin: 0 auto;
    }}

    header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }}

    .logo-box {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}

    .logo-img {{
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: 1px solid var(--border);
      object-fit: cover;
    }}

    .title-text {{
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }}

    .subtitle-text {{
      font-size: 12px;
      color: var(--text-muted);
    }}

    .theme-switcher {{
      display: flex;
      background: var(--highlight-bg);
      border: 1px solid var(--border);
      padding: 4px;
      border-radius: 8px;
      gap: 4px;
    }}

    .theme-btn {{
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.15s ease;
    }}

    .theme-btn.active {{
      background: var(--card);
      color: var(--text-main);
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }}

    .section-title {{
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .grid-3 {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }}

    .grid-kpi {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }}

    .card {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s ease;
    }}

    .card-kpi {{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 85px;
    }}

    .kpi-label {{
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}

    .kpi-val {{
      font-size: 18px;
      font-weight: 700;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 4px;
    }}

    .kpi-sub {{
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 4px;
    }}

    .kpi-green {{ color: var(--accent-green); }}
    .kpi-gold {{ color: var(--accent-gold); }}
    .kpi-blue {{ color: var(--accent-blue); }}

    .badge {{
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }}

    .badge-open {{
      background: rgba(245, 158, 11, 0.15);
      color: var(--accent-gold);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }}

    .badge-sold {{
      background: rgba(34, 197, 94, 0.15);
      color: var(--accent-green);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }}

    .progress-track {{
      width: 100%;
      height: 6px;
      background: var(--highlight-bg);
      border-radius: 3px;
      overflow: hidden;
      margin-top: 8px;
    }}

    .progress-bar {{
      height: 100%;
      background: var(--accent-green);
      border-radius: 3px;
    }}

    .sub-matrix {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: var(--highlight-bg);
      padding: 10px;
      border-radius: 6px;
      margin: 12px 0;
      font-size: 11px;
    }}

    .sub-label {{
      font-size: 9px;
      color: var(--text-muted);
      text-transform: uppercase;
    }}

    .sub-val {{
      font-weight: 700;
      font-family: ui-monospace, monospace;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }}

    th {{
      background: var(--highlight-bg);
      color: var(--text-muted);
      font-size: 10px;
      text-transform: uppercase;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
    }}

    td {{
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
    }}

    .table-container {{
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow-x: auto;
      background: var(--card);
      margin-bottom: 28px;
    }}

    .font-mono {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }}

    .callout {{
      background: var(--highlight-bg);
      border-left: 3px solid var(--accent-green);
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      margin-bottom: 20px;
    }}
  </style>
</head>
<body class="theme-b">
  <div class="max-w">
    <!-- Header -->
    <header>
      <div class="logo-box">
        <img src="data:image/jpeg;base64,{logo_b64}" alt="Logo" class="logo-img" />
        <div>
          <div class="title-text">Avaniya Real Estate & Land Asset Portfolio</div>
          <div class="subtitle-text">Design Direction Review & South Indian Land Expense Structure</div>
        </div>
      </div>

      <div class="theme-switcher">
        <button id="btn-theme-a" class="theme-btn">Option A: True Black</button>
        <button id="btn-theme-b" class="theme-btn active">Option B: Luxury Emerald (Recommended)</button>
        <button id="btn-theme-c" class="theme-btn">Option C: Midnight Navy</button>
      </div>
    </header>

    <div class="callout">
      <strong>Theme Selection Notice:</strong> Option B (Luxury Obsidian & Emerald Gold) brings subtle depth and high legibility specifically crafted for high-net-worth real estate & land business portfolios while maintaining True Black energy savings. Click between the buttons above to test live.
    </div>

    <!-- Live KPI Strip Mockup -->
    <div class="section-title">Portfolio Liquidity Overview (Live Formula Engine)</div>
    <div class="grid-kpi">
      <div class="card card-kpi">
        <div class="kpi-label">Net Bank Liquidity</div>
        <div class="kpi-val kpi-blue">₹ 29,24,297</div>
        <div class="kpi-sub">Bank Reserves</div>
      </div>
      <div class="card card-kpi">
        <div class="kpi-label">Cash in Hand</div>
        <div class="kpi-val kpi-green">₹ 19,93,500</div>
        <div class="kpi-sub">Liquid Site Cash</div>
      </div>
      <div class="card card-kpi">
        <div class="kpi-label">Total Combined Liquidity</div>
        <div class="kpi-val">₹ 49,17,797</div>
        <div class="kpi-sub">Capital: ₹ 1.74 Cr</div>
      </div>
      <div class="card card-kpi">
        <div class="kpi-label">Pending to Sellers</div>
        <div class="kpi-val kpi-gold">₹ 4,11,27,598</div>
        <div class="kpi-sub">5 Land Deals</div>
      </div>
      <div class="card card-kpi">
        <div class="kpi-label">Buyer Receivables</div>
        <div class="kpi-val kpi-green">₹ 1,21,50,000</div>
        <div class="kpi-sub">Agreed Sales Pipeline</div>
      </div>
      <div class="card card-kpi">
        <div class="kpi-label">Realized Profit</div>
        <div class="kpi-val">₹ 18,94,800</div>
        <div class="kpi-sub">Settled Deal Gains</div>
      </div>
    </div>

    <!-- Visual Deal Pipeline Cards -->
    <div class="section-title">Commercial Land Deal Cards (With Agreed Price, Expenses, Target, & Selling Price)</div>
    <div class="grid-3">
      <!-- Card 1: Kalaimal Nagar (Sold Deal with High Expenses Breakdown) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 700; font-size: 15px;">Kalaimal Nagar</div>
            <div style="font-size: 11px; color: var(--text-muted);">LND-002 • 1,122 sq.ft @ ₹9,100/sqft</div>
          </div>
          <span class="badge badge-sold">SOLD</span>
        </div>

        <!-- 4-Metric Grid including Agreed Price, Expenses, Target Price, Selling Price -->
        <div class="sub-matrix">
          <div>
            <div class="sub-label">1. Agreed Buy Price</div>
            <div class="sub-val">₹ 1,02,10,200</div>
          </div>
          <div>
            <div class="sub-label">2. Property Expenses</div>
            <div class="sub-val kpi-gold">₹ 45,000</div>
          </div>
          <div>
            <div class="sub-label">3. Target Sale Exit</div>
            <div class="sub-val kpi-blue">₹ 1,34,64,000</div>
          </div>
          <div>
            <div class="sub-label">4. Agreed Selling Price</div>
            <div class="sub-val kpi-green">₹ 1,21,50,000</div>
          </div>
        </div>

        <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
          <span>Total Project Outlay: <strong class="font-mono" style="color: var(--text-main);">₹ 1,02,55,200</strong></span>
          <span class="kpi-green font-mono"><strong>+ ₹ 18,94,800 Gain</strong></span>
        </div>

        <div class="progress-track">
          <div class="progress-bar" style="width: 100%;"></div>
        </div>
      </div>

      <!-- Card 2: Andal Avenue (Active Pipeline) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 700; font-size: 15px;">Andal Avenue</div>
            <div style="font-size: 11px; color: var(--text-muted);">LND-001 • Commercial Land Parcel</div>
          </div>
          <span class="badge badge-open">IN PROGRESS</span>
        </div>

        <div class="sub-matrix">
          <div>
            <div class="sub-label">1. Agreed Buy Price</div>
            <div class="sub-val">₹ 2,85,00,000</div>
          </div>
          <div>
            <div class="sub-label">2. Property Expenses</div>
            <div class="sub-val kpi-gold">₹ 40,000</div>
          </div>
          <div>
            <div class="sub-label">3. Target Sale Exit</div>
            <div class="sub-val kpi-blue">₹ 3,30,00,000</div>
          </div>
          <div>
            <div class="sub-label">4. Pending to Seller</div>
            <div class="sub-val kpi-gold">₹ 1,85,00,000</div>
          </div>
        </div>

        <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
          <span>Total Outflow Paid: <strong class="font-mono" style="color: var(--text-main);">₹ 1,00,40,000</strong></span>
          <span class="font-mono">35% Funded</span>
        </div>

        <div class="progress-track">
          <div class="progress-bar" style="width: 35%;"></div>
        </div>
      </div>

      <!-- Card 3: Revathi Nagar -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 700; font-size: 15px;">Revathi Nagar</div>
            <div style="font-size: 11px; color: var(--text-muted);">LND-005 • Registered Plot</div>
          </div>
          <span class="badge badge-sold">REGISTERED</span>
        </div>

        <div class="sub-matrix">
          <div>
            <div class="sub-label">1. Agreed Buy Price</div>
            <div class="sub-val">₹ 26,73,000</div>
          </div>
          <div>
            <div class="sub-label">2. Stamp & Legal Exp.</div>
            <div class="sub-val kpi-gold">₹ 90,000</div>
          </div>
          <div>
            <div class="sub-label">3. Target Sale Exit</div>
            <div class="sub-val kpi-blue">₹ 37,62,000</div>
          </div>
          <div>
            <div class="sub-label">4. Total Paid So Far</div>
            <div class="sub-val kpi-green">₹ 9,71,201</div>
          </div>
        </div>

        <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
          <span>Pending Outflow: <strong class="font-mono kpi-gold">₹ 17,91,799</strong></span>
          <span class="font-mono">36% Paid</span>
        </div>

        <div class="progress-track">
          <div class="progress-bar" style="width: 36%;"></div>
        </div>
      </div>
    </div>

    <!-- Comprehensive South Indian Land & Real Estate Expense Structure -->
    <div class="section-title">South Indian Real Estate Comprehensive Expense Categorization Engine</div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Expense Category</th>
            <th>Domain / Authority</th>
            <th>Financial Role in Engine</th>
            <th>Typical Range (South India / TN)</th>
            <th>Mathematical Treatment</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Sub-Registrar Stamp Duty (7%)</strong></td>
            <td>Registration Dept / SRO</td>
            <td><code>property_expense</code></td>
            <td>7% of guideline / agreement value</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Registration Fee (4%)</strong></td>
            <td>Registration Dept / SRO</td>
            <td><code>property_expense</code></td>
            <td>4% of guideline / agreement value</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Patta / Chitta Transfer & Mutation</strong></td>
            <td>Revenue Dept / Tahsildar</td>
            <td><code>property_expense</code></td>
            <td>₹100 online + VAO verification</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>DTCP / CMDA Layout Scrutiny Fees</strong></td>
            <td>Town & Country Planning</td>
            <td><code>property_expense</code></td>
            <td>₹25 - ₹750 per sq.meter</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Open Space Reservation (OSR) Charges</strong></td>
            <td>Planning Authority / Local Body</td>
            <td><code>property_expense</code></td>
            <td>10% land value / guideline cess</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Land Surveyor & FMB Sketch Verification</strong></td>
            <td>Govt Surveyor / Firka Surveyor</td>
            <td><code>property_expense</code></td>
            <td>₹5,000 - ₹25,000 per field survey</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Advocate Title Opinion & 30-Yr EC Search</strong></td>
            <td>Legal Practitioner</td>
            <td><code>property_expense</code></td>
            <td>₹15,000 - ₹50,000 per title doc</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Perimeter Fencing & Boundary Stone Fixing</strong></td>
            <td>Site Security / Contractor</td>
            <td><code>property_expense</code></td>
            <td>₹150 - ₹350 per running foot</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>EB Transformer & High Tension Line Setup</strong></td>
            <td>TANGEDCO / Electricity Board</td>
            <td><code>property_expense</code></td>
            <td>₹2,50,000 - ₹8,00,000</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Borewell Drilling & Motor Setup</strong></td>
            <td>Water Contractor</td>
            <td><code>property_expense</code></td>
            <td>₹1,50,000 - ₹4,00,000</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Brokerage / Mandi Mediator Commission</strong></td>
            <td>Real Estate Agent / Mediator</td>
            <td><code>property_expense</code></td>
            <td>1% - 2% of total transaction</td>
            <td>Added to Total Project Outlay</td>
          </tr>
          <tr>
            <td><strong>Token / Agreement Purchase Advance</strong></td>
            <td>Land Seller (Direct Principal)</td>
            <td><code>purchase_principal</code></td>
            <td>As agreed in sale agreement</td>
            <td>Directly reduces Pending Seller Outflow</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Comparison Summary -->
    <div class="section-title">Design Direction Comparison & Recommendations</div>
    <div class="grid-3">
      <div class="card">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">Option A: True Black Baseline</div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
          • Background: <code>#000000</code> Pure Black<br>
          • Surface: <code>#0A0A0A</code> Wire Borders<br>
          • Contrast: Maximum stark contrast<br>
          • Strengths: Strict compliance with default AGENTS.md, OLED power saving.<br>
          • Trade-offs: Can feel slightly clinical/monochromatic over long working sessions.
        </div>
      </div>

      <div class="card" style="border-color: var(--accent-green);">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: var(--accent-green);">Option B: Luxury Obsidian & Emerald (Recommended)</div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
          • Background: <code>#060907</code> Deep Obsidian<br>
          • Surface: <code>#0C130F</code> with Slate Emerald <code>#1A2B20</code> borders<br>
          • Accents: <code>#10B981</code> Emerald Cash & <code>#D97706</code> Gold Receivables<br>
          • Strengths: Sophisticated real estate wealth aesthetic, preserves true dark-mode comfort, premium visual hierarchy.<br>
          • Trade-offs: Requires user authorization to override default pure `#000000`.
        </div>
      </div>

      <div class="card">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: var(--accent-blue);">Option C: Midnight Navy & Platinum</div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
          • Background: <code>#060913</code> Deep Navy<br>
          • Surface: <code>#0E1526</code> with <code>#1E293B</code> borders<br>
          • Accents: <code>#38BDF8</code> Sky Blue & <code>#10B981</code> Emerald<br>
          • Strengths: Institutional fintech banking aesthetic.<br>
          • Trade-offs: Less warm than Option B for Indian real estate land business.
        </div>
      </div>
    </div>
  </div>

  <script>
    function selectTheme(themeName, activeBtn) {{
      document.body.className = themeName;
      var buttons = document.querySelectorAll('.theme-btn');
      for (var i = 0; i < buttons.length; i++) {{
        buttons[i].classList.remove('active');
      }}
      if (activeBtn) {{
        activeBtn.classList.add('active');
      }}
    }}

    document.getElementById('btn-theme-a').addEventListener('click', function() {{
      selectTheme('theme-a', this);
    }});
    document.getElementById('btn-theme-b').addEventListener('click', function() {{
      selectTheme('theme-b', this);
    }});
    document.getElementById('btn-theme-c').addEventListener('click', function() {{
      selectTheme('theme-c', this);
    }});
  </script>
</body>
</html>'''

with open('mockups/design_alternatives.html', 'w') as f:
    f.write(html_content)

print("Saved mockups/design_alternatives.html with event listeners")
