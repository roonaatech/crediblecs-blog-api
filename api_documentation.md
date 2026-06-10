# Contact Submissions API Documentation

This document describes how to submit contact leads and access the secure Contact Submissions API exposed by the `crediblecs-blog-api` backend.

---

## 1. API Overview

- **Base URL**: `http://localhost:3001/api/v1` (or your production API URL)
- **Endpoint**: `/contact/api-submissions`
- **HTTP Method**: `GET`
- **Authentication**: Required via API Key.

---

## 2. Authentication

You must provide the configured API Key in one of the following ways:

### A. HTTP Header (Recommended)
Include the key in the `x-api-key` (or `api-key`) request header:
```http
x-api-key: cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c
```

### B. Query Parameter
Append the key as `api_key` (or `apiKey`) in the URL:
```url
GET /api/v1/contact/api-submissions?api_key=cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c
```

---

## 3. Query Parameters

The endpoint supports several query parameters to handle pagination, sorting, filtering, and searching:

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | Integer | `1` | The page number to retrieve. |
| `limit` | Integer | `10` | Number of items per page. Maximum allowed value is `50`. |
| `status` | String | *None* | Filter by submission status (`new`, `contacted`, `resolved`, `consumed`, `junk`). |
| `service`| String | *None* | Filter by the exact service requested (e.g. `Payroll Services`). |
| `website`| String | *None* | Filter by the source website identifier (e.g. `ccs`). |
| `search` | String | *None* | Fuzzy text search matching against `name`, `email`, or `phone`. |
| `sortBy` | String | `created_at`| Field to sort results by (`id`, `name`, `email`, `created_at`, `status`, `service`, `website`). |
| `sortOrder`| String | `DESC` | Sorting direction (`ASC` for ascending, `DESC` for descending). |

---

## 4. Understanding Pagination

When queries succeed, the API returns results wrapped in a standard pagination envelope.

### A. JSON Envelope structure
```json
{
  "success": true,
  "data": [
    // Array of submission objects
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

- `page`: Current page number.
- `limit`: Number of items requested per page.
- `total`: Total number of matching records in the database.
- `totalPages`: Total number of pages calculated as `Math.ceil(total / limit)`.
- `hasNext`: Boolean flag showing if a next page exists (`page < totalPages`).
- `hasPrev`: Boolean flag showing if a previous page exists (`page > 1`).

### B. Custom HTTP Headers
For convenience, the API also sends pagination metrics in the HTTP response headers:
- `X-Total-Count`: Total number of matching records.
- `X-Total-Pages`: Total pages count.

---

## 5. Request Examples

### A. Using cURL

#### Retrieve First Page (Default settings)
```bash
curl -H "x-api-key: cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c" \
     http://localhost:3001/api/v1/contact/api-submissions
```

#### Pagination (Fetch Page 2, Limit 5 items per page)
```bash
curl -H "x-api-key: cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c" \
     "http://localhost:3001/api/v1/contact/api-submissions?page=2&limit=5"
```

#### Filtering & Search (Get submissions with 'new' status searching for 'Sakthi')
```bash
curl -H "x-api-key: cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c" \
     "http://localhost:3001/api/v1/contact/api-submissions?status=new&search=Sakthi"
```

#### Filter by Website Source
```bash
curl -H "x-api-key: cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c" \
     "http://localhost:3001/api/v1/contact/api-submissions?website=ccs"
```

---

### B. JavaScript Fetch Example

Here is how to fetch all pages sequentially using async/await:

```javascript
const API_URL = 'http://localhost:3001/api/v1/contact/api-submissions';
const API_KEY = 'cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c';

async function fetchSubmissions(page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to fetch contact submissions:', error);
  }
}

// Usage:
fetchSubmissions(1, 5).then(res => {
  console.log('Submissions:', res.data);
  console.log('Has Next Page?', res.pagination.hasNext);
});
```

---

### C. Python Example

```python
import requests

API_URL = "http://localhost:3001/api/v1/contact/api-submissions"
headers = {
    "x-api-key": "cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c"
}

params = {
    "page": 1,
    "limit": 5,
    "status": "new",
    "search": "gmail.com"
}

response = requests.get(API_URL, headers=headers, params=params)

if response.status_code == 200:
    result = response.json()
    print(f"Total matching items: {result['pagination']['total']}")
    for item in result['data']:
        print(f"- {item['name']} ({item['email']}): {item['service']}")
else:
    print(f"Failed to fetch data: {response.status_code}")
    print(response.json())
```

---

## 6. Update Submission Status

- **Endpoint**: `/contact/api-submissions/:id/status`
- **HTTP Method**: `PATCH`
- **Authentication**: Required via API Key (Headers or Query param).
- **Body**: JSON object containing:
  - `status`: String (must be one of `new`, `contacted`, `resolved`, `consumed`, `junk`).

### Request Examples

#### A. Using cURL (Updating status to 'consumed')
```bash
curl -X PATCH \
     -H "x-api-key: cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c" \
     -H "Content-Type: application/json" \
     -d '{"status": "consumed"}' \
     http://localhost:3001/api/v1/contact/api-submissions/10/status
```

#### B. JavaScript Fetch Example
```javascript
const API_URL = 'http://localhost:3001/api/v1/contact/api-submissions';
const API_KEY = 'cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c';

async function updateStatus(submissionId, newStatus) {
  try {
    const response = await fetch(`${API_URL}/${submissionId}/status`, {
      method: 'PATCH',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result; // returns success and updated record
  } catch (error) {
    console.error('Failed to update submission status:', error);
  }
}

// Usage:
updateStatus(10, 'consumed').then(res => {
  console.log('Update result:', res);
});
```

#### C. Python Example
```python
import requests

submission_id = 10
API_URL = f"http://localhost:3001/api/v1/contact/api-submissions/{submission_id}/status"
headers = {
    "x-api-key": "cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c",
    "Content-Type": "application/json"
}
payload = {
    "status": "consumed"
}

response = requests.patch(API_URL, headers=headers, json=payload)

if response.status_code == 200:
    result = response.json()
    print("Successfully updated status:")
    print(result['data'])
else:
    print(f"Failed: {response.status_code}")
    print(response.json())
```

---

## 7. Submit Contact Lead (POST)

- **Endpoint**: `/contact`
- **HTTP Method**: `POST`
- **Authentication**: Required via API Key (same as GET endpoints — see [Section 2](#2-authentication)).
- **Content-Type**: `application/json`

### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | ✅ Yes | Full name of the contact. |
| `phone` | String | ✅ Yes | Phone number (any format). |
| `email` | String | ✅ Yes | Email address. |
| `service` | String | No | Service requested (e.g. `Payroll Services`, `PF Registration`). |
| `message` | String | No | Additional message or notes. |
| `website` | String | No | Source website identifier (e.g. `ccs`, `partner-site`). Used to track which website the lead came from. |

### Request Examples

#### A. Using cURL
```bash
curl -X POST \
     -H "x-api-key: cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "phone": "+919876543210",
       "email": "john@example.com",
       "service": "PF Registration",
       "message": "Need help with PF registration for my startup.",
       "website": "ccs"
     }' \
     http://localhost:3001/api/v1/contact
```

#### B. JavaScript Fetch Example
```javascript
const API_URL = 'http://localhost:3001/api/v1/contact';

async function submitLead(data) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c'
      },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email,
        service: data.service || null,
        message: data.message || null,
        website: 'your-site-id'   // e.g. 'ccs', 'partner-site'
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('Lead submitted successfully!');
    } else {
      console.error('Submission failed:', result.message);
    }

    return result;
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage:
submitLead({
  name: 'Jane Smith',
  phone: '9876543210',
  email: 'jane@example.com',
  service: 'ESI Registration',
  message: 'Need ESI registration for 15 employees.'
});
```

#### C. Python Example
```python
import requests

API_URL = "http://localhost:3001/api/v1/contact"
headers = {
    "x-api-key": "cc_sec_a8b9f71c4d23e590fa1b6c7d3e2a9b4c",
    "Content-Type": "application/json"
}

payload = {
    "name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com",
    "service": "PF Registration",
    "message": "Need help with PF registration for my startup.",
    "website": "partner-site"
}

response = requests.post(API_URL, headers=headers, json=payload)

if response.status_code == 201:
    print("Lead submitted successfully!")
    print(response.json())
else:
    print(f"Failed: {response.status_code}")
    print(response.json())
```

#### D. HTML Form Integration (for third-party websites)
```html
<form id="lead-form">
  <input type="text" name="name" placeholder="Full Name" required />
  <input type="tel" name="phone" placeholder="Phone" required />
  <input type="email" name="email" placeholder="Email" required />
  <select name="service">
    <option value="">Select a service</option>
    <option value="PF Registration">PF Registration</option>
    <option value="ESI Registration">ESI Registration</option>
    <option value="Payroll Services">Payroll Services</option>
  </select>
  <textarea name="message" placeholder="Message (optional)"></textarea>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  formData.website = 'your-website-id';  // Replace with your site identifier

  const res = await fetch('https://YOUR_API_URL/api/v1/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(formData)
  });

  const result = await res.json();
  if (res.ok && result.success) {
    alert('Thank you! We will contact you soon.');
    e.target.reset();
  } else {
    alert(result.message || 'Something went wrong.');
  }
});
</script>
```

### Responses

#### Success (201 Created)
```json
{
  "success": true,
  "message": "Submission successful"
}
```

#### Validation Error (400 Bad Request)
Returned when required fields (`name`, `phone`, `email`) are missing:
```json
{
  "success": false,
  "message": "Name, phone, and email are required."
}
```

#### Authentication Error (401 Unauthorized)
Returned when the API key is missing or invalid:
```json
{
  "success": false,
  "message": "Invalid or missing API key. Access denied."
}
```

#### Server Error (500)
```json
{
  "success": false,
  "message": "Error details..."
}
```

### Notes
- The `website` field is optional but **strongly recommended** when integrating from external websites. It allows you to filter and track leads by source using `GET /contact/api-submissions?website=your-site-id`.
- An email notification is automatically sent to the configured SMTP recipient when a lead is submitted (if SMTP settings are configured in admin).
- CORS must be configured on the server to allow requests from your website domain. Add your domain to the `CORS_ORIGIN` environment variable.

