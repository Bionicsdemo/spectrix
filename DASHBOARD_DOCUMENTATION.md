# 📊 BioQL Client Dashboard - Complete Documentation

## 🎯 Overview

The BioQL Client Dashboard is a comprehensive web-based interface that allows clients to monitor their quantum computing usage, manage billing and payments, and access technical support. Built with modern web technologies and integrated with Stripe for secure payments.

**URL:** `https://bioql.spectrixrd.com/dashboard.html`

---

## ✨ Key Features

### 1. **Usage Analytics & Statistics**
- Real-time quantum shot tracking
- Total spending visualization
- Molecules designed counter
- Backend usage distribution
- 30-day usage trends with interactive charts
- Per-backend breakdown with detailed metrics

### 2. **Billing & Payment Management**
- Current balance display
- Invoice history table with status tracking
- One-click payment via Stripe
- Individual invoice payment
- Automatic payment processing
- Secure payment method storage

### 3. **Technical Support System**
- Priority-based ticket submission
- Support categories (Low, Medium, High, Critical)
- Detailed issue description forms
- 24-hour response guarantee
- Direct integration with support backend

### 4. **API Key Management**
- Secure API key display
- One-click copy to clipboard
- API key obfuscation for security
- Automatic authentication handling

### 5. **User Authentication**
- LocalStorage-based session management
- Auto-redirect if not authenticated
- Secure logout functionality
- Persistent user data across sessions

---

## 🏗️ Technical Architecture

### Frontend Stack
```
- HTML5 (Semantic structure)
- CSS3 (Modern styling with CSS Variables)
- Vanilla JavaScript (ES6+)
- Chart.js 4.4.0 (Data visualization)
- Stripe.js v3 (Payment processing)
```

### Backend Integration
```
Base URL: https://ac510c965a21.ngrok-free.app

Endpoints Used:
- GET  /auth/user           → Fetch user data
- GET  /analytics/usage     → Usage statistics
- GET  /billing/invoices    → Billing history
- POST /billing/create-payment → Create payment session
- POST /support/ticket      → Submit support ticket
```

### Data Flow
```
1. User Registration (signup.html)
   ↓
2. API Key saved to localStorage
   ↓
3. Auto-redirect to Dashboard
   ↓
4. Dashboard loads user data, usage stats, billing info
   ↓
5. Real-time updates via API calls
```

---

## 📱 User Interface Components

### Dashboard Header
```html
<div class="dashboard-header">
  - Welcome message with user name
  - Quantum-themed gradient background
  - Responsive design
</div>
```

**Features:**
- Personalized greeting
- Dynamic user name from localStorage
- Background image overlay (quantum-bg-1.png)

### Statistics Cards (4 cards)

| Card | Metric | Icon | Data Source |
|------|--------|------|-------------|
| **Total Shots** | Quantum shots executed | ⚛️ | `/analytics/usage` |
| **Total Spent** | USD amount | 💰 | `/analytics/usage` |
| **Molecules Designed** | Count of molecules | 🧬 | `/analytics/usage` |
| **Backends Used** | Number of backends | 🖥️ | `/analytics/usage` |

**Styling:**
- Glassmorphism effect
- Hover animations (translateY -4px)
- Gradient text for values
- Auto-responsive grid

### Usage Charts (2 charts)

#### Chart 1: Usage Over Time (Line Chart)
```javascript
Chart Type: Line
Time Range: Last 30 days
Data Points: Daily quantum shots
Color Scheme: Quantum blue (#00D4FF)
Features:
  - Smooth curve (tension: 0.4)
  - Fill area under line
  - Responsive canvas
  - Dark theme labels
```

#### Chart 2: Backend Distribution (Doughnut Chart)
```javascript
Chart Type: Doughnut
Categories: All used backends
Colors: [Blue, Purple, Magenta, Green, Cyan, Gold]
Features:
  - Legend at bottom
  - Percentage display
  - Interactive tooltips
  - Responsive sizing
```

### Backend Usage Breakdown
```html
<div class="usage-breakdown">
  - Grid layout (auto-fit, minmax 200px)
  - Individual cards per backend
  - Usage count display
  - Purple quantum theme
</div>
```

### Billing Section

**Components:**
1. **Current Balance Display**
   - Large font (2rem, bold)
   - Red color if negative (debt)
   - Purple color if zero/positive
   - Real-time updates

2. **Pay Now Button**
   - Disabled if balance = $0
   - Gradient background
   - Hover elevation effect
   - Stripe checkout redirect

3. **Invoice Table**
   - Columns: Date, Description, Amount, Status, Action
   - Row hover effects
   - Status badges (Paid, Pending, Overdue)
   - Individual pay buttons for pending invoices

**Status Badge Colors:**
```css
.status-paid    → Green (#06FFA5)
.status-pending → Gold (#FFD700)
.status-overdue → Red (#ff3b30)
```

### Support Form

**Form Fields:**
| Field | Type | Options | Required |
|-------|------|---------|----------|
| **Priority** | Select | Low, Medium, High, Critical | Yes |
| **Subject** | Text | Brief description | Yes |
| **Message** | Textarea | Detailed issue | Yes |

**Submit Process:**
1. Validate all fields
2. Show loading overlay
3. POST to `/support/ticket`
4. Show success/error alert
5. Reset form on success

**Response Time SLA:**
- Low: 48 hours
- Medium: 24 hours
- High: 12 hours
- Critical: 4 hours

---

## 🔐 Authentication System

### Flow Diagram
```
┌─────────────────┐
│   Load Page     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check localStorage│
│  for API key?   │
└────────┬────────┘
         │
    Yes  │  No
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│Dashboard│ │ Redirect │
│  Load   │ │  signup  │
└────────┘ └──────────┘
```

### LocalStorage Keys
```javascript
'bioql_api_key'     → API key for authentication
'bioql_user_name'   → User's full name
'bioql_user_email'  → User's email address
```

### Authentication Headers
```javascript
headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
}
```

### Logout Process
```javascript
function logout() {
    localStorage.removeItem('bioql_api_key');
    localStorage.removeItem('bioql_user_name');
    localStorage.removeItem('bioql_user_email');
    window.location.href = 'index.html';
}
```

---

## 💳 Stripe Payment Integration

### Configuration
```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_live_51SG9nS8N85z8U7algbG3PoqbZc5kCC1ECveDawmt8jtTdfLCN1Z0U8uKCjfVvHYADp5qvXe28zZMhW8AbIuTty7F006eI727wu'
```

### Payment Flow

#### 1. Pay Balance
```javascript
async function payBalance() {
    1. Get current balance
    2. POST to /billing/create-payment
    3. Receive Stripe session_id
    4. Redirect to Stripe Checkout
    5. Stripe processes payment
    6. User returns to dashboard
    7. Balance updated
}
```

#### 2. Pay Individual Invoice
```javascript
async function payInvoice(invoiceId) {
    1. Alert user
    2. Call payBalance() with invoice amount
    3. Stripe processes
    4. Invoice status updated to "paid"
}
```

### Stripe Checkout Session
```json
{
    "session_id": "cs_test_...",
    "amount": 1500,  // $15.00 in cents
    "currency": "usd",
    "success_url": "https://bioql.spectrixrd.com/dashboard.html?payment=success",
    "cancel_url": "https://bioql.spectrixrd.com/dashboard.html?payment=cancel"
}
```

---

## 📊 Data Structure Examples

### User Data Response
```json
{
    "id": 123,
    "name": "Dr. Jane Smith",
    "email": "jane@university.edu",
    "api_key": "bioql_3EI7-xILRTsxWtjPnkzWjXYV0W_zXgAfH7hVn4VH_CA",
    "stripe_customer_id": "cus_...",
    "created_at": "2025-01-15T10:30:00Z"
}
```

### Usage Statistics Response
```json
{
    "total_shots": 15000,
    "total_spent": 2500.50,
    "molecules_designed": 45,
    "backends_used": 4,
    "backends": {
        "ibm_quantum": 8000,
        "ionq": 4000,
        "simulator": 2500,
        "aws_braket": 500
    },
    "daily_usage": {
        "dates": ["2025-01-01", "2025-01-02", ...],
        "shots": [500, 750, 600, ...]
    }
}
```

### Billing Data Response
```json
{
    "current_balance": 350.00,
    "invoices": [
        {
            "id": "inv_001",
            "date": "2025-01-15",
            "description": "Quantum shots usage - January 1-15",
            "amount": 350.00,
            "status": "pending"
        },
        {
            "id": "inv_002",
            "date": "2024-12-31",
            "description": "Quantum shots usage - December",
            "amount": 500.00,
            "status": "paid"
        }
    ]
}
```

### Support Ticket Request
```json
{
    "priority": "high",
    "subject": "API endpoint returning 500 error",
    "message": "When calling /quantum endpoint with EGFR target, I'm getting a 500 Internal Server Error. API key: bioql_3EI7...CA. Error started at 10:30 AM today."
}
```

---

## 🎨 Styling & Theming

### CSS Variables
```css
--color-bg-dark: #0A0E27
--color-bg-card: #12172E
--color-quantum-blue: #00D4FF
--color-quantum-purple: #9D4EDD
--gradient-primary: linear-gradient(135deg, #00D4FF 0%, #9D4EDD 100%)
--gradient-secondary: linear-gradient(135deg, #9D4EDD 0%, #FF006E 100%)
```

### Responsive Breakpoints
```css
Desktop:  > 768px  → Full grid layouts
Tablet:   ≤ 768px  → Single column grids
Mobile:   ≤ 480px  → Stacked layout
```

### Glassmorphism Effect
```css
.stat-card {
    background: rgba(18, 23, 46, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 212, 255, 0.2);
}
```

### Hover Animations
```css
.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 40px rgba(0, 212, 255, 0.2);
    border-color: var(--color-quantum-blue);
}
```

---

## 🚀 Performance Optimizations

### Loading Strategy
```javascript
1. Check authentication (instant)
2. Show loading overlay
3. Parallel API calls (Promise.all):
   - fetchUserData()
   - fetchUsageStats()
   - fetchBillingData()
4. Update UI as data arrives
5. Hide loading overlay
```

### Caching
- LocalStorage for user credentials
- Chart.js internal caching
- Browser caching for static assets

### Error Handling
```javascript
try {
    await apiCall();
} catch (error) {
    console.error('Error:', error);
    showAlert('Operation failed: ' + error.message, 'error');
}
```

---

## 🔔 Alert System

### Alert Types
| Type | Color | Border | Use Case |
|------|-------|--------|----------|
| **success** | Green | #06FFA5 | Successful operations |
| **error** | Red | #ff3b30 | Failed operations |
| **info** | Blue | #00D4FF | Informational messages |

### Usage
```javascript
showAlert('API key copied!', 'success');
showAlert('Payment failed', 'error');
showAlert('Loading data...', 'info');
```

### Auto-dismiss
- 5 second timeout
- Fade-out animation
- Multiple alerts stack vertically

---

## 📱 Mobile Responsiveness

### Adaptations

**Navigation:**
- Hamburger menu on mobile
- Stacked buttons on mobile

**Dashboard Grid:**
```css
Desktop: 4 columns → 2x2 grid
Tablet:  2 columns → 2x1 grid
Mobile:  1 column  → 4x1 stack
```

**Invoice Table:**
- Font size reduced to 0.85rem
- Padding reduced
- Horizontal scroll if needed

**Charts:**
- Responsive canvas sizing
- Legend position adjusted
- Touch-friendly tooltips

---

## 🔒 Security Features

### API Key Protection
- Obfuscated display (bioql_••••••••••••••••)
- Copy to clipboard (full key)
- No transmission in URL params
- HTTPS-only transmission

### Payment Security
- Stripe PCI compliance
- No card data stored locally
- Tokenized payment methods
- 3D Secure support

### Data Validation
```javascript
// Server-side validation
- API key format check
- Amount validation
- Email format validation
- Priority value validation
```

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Dashboard loads with valid API key
- [ ] Redirects to signup without API key
- [ ] Stats display correctly
- [ ] Charts render properly
- [ ] Payment flow works end-to-end
- [ ] Support ticket submission
- [ ] Logout functionality
- [ ] Copy API key button
- [ ] Mobile responsiveness
- [ ] Alert system

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 📈 Usage Metrics to Track

### Key Performance Indicators
1. **Dashboard Load Time** → Target: < 2 seconds
2. **API Response Time** → Target: < 500ms
3. **Payment Success Rate** → Target: > 95%
4. **Support Ticket Response Time** → Target: < 24 hours
5. **User Session Duration** → Track average time on dashboard

---

## 🐛 Common Issues & Solutions

### Issue 1: Dashboard shows "Loading..." forever
**Cause:** API server down or API key invalid
**Solution:**
1. Check browser console for errors
2. Verify API key in localStorage
3. Test server endpoint manually
4. Clear localStorage and re-login

### Issue 2: Charts not rendering
**Cause:** Chart.js not loaded or data format incorrect
**Solution:**
1. Check Chart.js CDN availability
2. Verify data structure in console
3. Check canvas element exists
4. Refresh page

### Issue 3: Payment button disabled
**Cause:** Balance is $0.00 (no pending charges)
**Solution:** This is expected behavior. Button only enables when balance > 0

### Issue 4: Support ticket fails to submit
**Cause:** Server error or invalid data
**Solution:**
1. Check all required fields filled
2. Verify API key authorization
3. Check network tab for error response
4. Try again or contact admin

---

## 🔄 Update & Maintenance

### Version History
- **v1.0.0** (2025-01-19): Initial dashboard release
  - Usage statistics
  - Billing integration
  - Support ticket system
  - Chart.js visualizations

### Future Enhancements
- [ ] Real-time usage updates (WebSockets)
- [ ] Export usage reports (CSV/PDF)
- [ ] Custom date range filtering
- [ ] Team/organization accounts
- [ ] Advanced analytics (cost optimization)
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Email notification preferences

---

## 📞 Support & Contact

### For Dashboard Issues
- **Email:** support@spectrixrd.com
- **Priority:** Use dashboard support form
- **Response Time:** Within 24 hours

### For Payment Issues
- **Email:** billing@spectrixrd.com
- **Priority:** High (financial)
- **Response Time:** Within 12 hours

### For Technical Integration
- **Docs:** https://bioql.spectrixrd.com/docs.html
- **API Reference:** https://bioql.spectrixrd.com/api.html
- **Email:** dev@spectrixrd.com

---

## 📄 API Endpoint Reference

### Authentication
```http
GET /auth/user
Authorization: Bearer {api_key}
Response: User object
```

### Analytics
```http
GET /analytics/usage
Authorization: Bearer {api_key}
Response: Usage statistics object
```

### Billing
```http
GET /billing/invoices
Authorization: Bearer {api_key}
Response: Billing data object

POST /billing/create-payment
Authorization: Bearer {api_key}
Body: { "amount": number }
Response: { "session_id": string }
```

### Support
```http
POST /support/ticket
Authorization: Bearer {api_key}
Body: { "priority": string, "subject": string, "message": string }
Response: { "ticket_id": string, "status": string }
```

---

## 📊 Success Metrics

### Dashboard Completion Checklist
✅ **Design & Structure** - Professional UI with quantum theme
✅ **Usage Statistics** - Real-time analytics with Chart.js
✅ **Billing Integration** - Stripe payment system
✅ **Support System** - Priority-based ticket submission
✅ **Authentication** - localStorage-based sessions
✅ **Navigation** - Consistent across all pages
✅ **Auto-redirect** - Signup → Dashboard flow
✅ **Responsive Design** - Mobile, tablet, desktop
✅ **Error Handling** - Comprehensive try/catch
✅ **Documentation** - Complete feature documentation

---

## 🎯 Dashboard URL

**Production:** `https://bioql.spectrixrd.com/dashboard.html`

**Local Development:** `file:///Users/heinzjungbluth/Desktop/bioql_website/dashboard.html`

---

**Last Updated:** January 19, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
