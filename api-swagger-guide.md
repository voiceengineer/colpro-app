# Cases API – Swagger How-To (Hard Collection)

This guide shows how to use the Cases API via Swagger, including the required hard collection permissions for each endpoint.

## Base URLs

- API base: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api` and `http://localhost:3000/swagger`
- Swagger JSON: `http://localhost:3000/swagger/json`

All endpoints below are prefixed with `/api` automatically.

## Prerequisites

- The backend is running locally on port `3000`.
- You have a user account and know its credentials.
- Your user’s role has the required permissions (see next section).

## Required Permissions

The Cases controller is protected by JWT and permission guards. The following permission slugs are used:

- `view_hard_collection`: Read/list and share operations
- `edit_hard_collection`: Create/Update cases (together with manage)
- `manage_hard_collection`: Create/Update/Delete cases and some admin actions

Notes:

- List, get by id, statuses and share endpoints require `view_hard_collection`.
- Create and update require BOTH `edit_hard_collection` AND `manage_hard_collection`.
- Delete requires `manage_hard_collection`.

If your role is missing these permissions you will receive `403 Forbidden`.

### Assigning Permissions to a Role (if needed) you will not need it for now, if you login using username:admin and password:12345678 its role is 'director' and he has all the permissions but you can check them again using the GET api below just make sure the role of the login user you have have the view, edit and manage permissions for hard-collection and you'll be good

1. In Swagger, open `GET /permissions` to list all permissions and find the IDs for:

   - `view_hard_collection`
   - `edit_hard_collection`
   - `manage_hard_collection`

2. Assign them to a role using `POST /roles/assign-permission/{id}` with body:

```
{
  "permissionIds": [<id_of_view>, <id_of_edit>, <id_of_manage>]
}
```

3. Ensure your user is assigned to that role.

## Authenticate in Swagger

1. Open Swagger UI at `http://localhost:3000/api` (or `/swagger`).
2. Expand `Auth` and use `POST /auth/login` with your `username` and `password`.
3. Copy the `access_token` from the response.
4. Click the green `Authorize` button in Swagger, select `bearerAuth`, and paste ONLY the raw token (do NOT include the `Bearer ` prefix). Swagger adds `Bearer` automatically.

You are now authorized for all protected endpoints.

## Cases Endpoints Overview

Base route for Cases: `/cases` (effective paths are `/api/cases/...`).

- List cases: `GET /cases`

  - Permissions: `view_hard_collection`
  - Query params (optional): `page`, `limit`, `search`, `statusId`, `priority`, `collectionStage`, `sortBy`, `sortOrder`

- Case statuses: `GET /cases/statuses`

  - Permissions: `view_hard_collection`
  - Returns statuses assigned to the Hard Collection module.

- Get case by id: `GET /cases/{id}`

  - Permissions: `view_hard_collection`

- Create case: `POST /cases`

  - Permissions: `edit_hard_collection` AND `manage_hard_collection`
  - Body (example):
    ```
    {
      "originalAmount": 10000,
      "currentBalance": 9200,
      "daysPastDue": 45,
      "lastPaymentDate": "2025-10-20T14:30:00.000Z",
      "collectionStage": "legal_notice",
      "priority": "HIGH",
      "statusId": 2,
      "nextAction": "Call debtor",
      "nextActionDate": "2025-11-30T09:00:00.000Z",
      "contactAttempts": 0,
      "lastContactDate": null,
      "notes": "Escalated from auto rule",
      "accountId": 123,
      "agentId": 5
    }
    ```

- Update case: `PATCH /cases/{id}`

  - Permissions: `edit_hard_collection` AND `manage_hard_collection`
  - Body: any subset of fields from CreateCaseDto

- Delete case: `DELETE /cases/{id}`

  - Permissions: `manage_hard_collection`

- Escalate from promise: `POST /cases/escalate-promise`

  - Permissions: `view_hard_collection` (class-level)
  - Body: payload defined by `EscalatePromiseData` in Swagger schema

- Bulk list (lightweight): `POST /cases/bulk/list`
  - Permissions: `view_hard_collection`
  - Body (example):
    ```
    {
      "search": "John",
      "statusId": 2,
      "priority": "MEDIUM",
      "collectionStage": "legal_action",
      "excludeIds": [10, 11],
      "limit": 100
    }
    ```

### Share Links

- Create public share: `POST /cases/{id}/share/public`

  - Permissions: `view_hard_collection`
  - Body (optional): `{ "expiresAt": "2025-12-31T23:59:59.000Z" }`

- Create private share: `POST /cases/{id}/share/private`

  - Permissions: `view_hard_collection`
  - Body (example):
    ```
    {
      "allowedEmails": ["user1@example.com", "user2@example.com"],
      "expiresAt": "2025-12-31T23:59:59.000Z"
    }
    ```

- List shares for a case: `GET /cases/{id}/shares`

  - Permissions: `view_hard_collection`

- Revoke share by id: `DELETE /cases/shares/{shareId}`

  - Permissions: `view_hard_collection`

- Revoke share by token: `DELETE /cases/shares/token/{token}`
  - Permissions: `view_hard_collection`

## Common Errors & Fixes

- 401 Unauthorized: You did not attach a valid JWT. Click `Authorize` and paste the token from `POST /auth/login`.
- 403 Forbidden: Your role lacks the required permission. Add the proper slug(s) to the role via `POST /roles/assign-permission/{id}`.
- 400 Bad Request: Request body or query values fail validation. Check the Swagger schema for expected types and allowed enums.

## Optional: Test via cURL

Authenticate:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"12345678"}'
```

List cases (replace TOKEN):

```bash
curl -X GET 'http://localhost:3000/api/cases?page=1&limit=10' \
  -H 'Authorization: Bearer TOKEN'
```

Create case (requires edit+manage):

```bash
curl -X POST http://localhost:3000/api/cases \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "originalAmount": 10000,
    "currentBalance": 9200,
    "daysPastDue": 45,
    "accountId": 123
  }'
```

---

For questions or missing permissions, check:

- `GET /api/permissions`
- `GET /api/roles` and `POST /api/roles/assign-permission/{id}`

- Field Agent Registration API (Standalone)

Base URL: http://localhost:3000/api (global prefix is set in main.ts)
Endpoint: POST /api/register-field-agent
Auth: none (public endpoint)
What it does: creates a new user where username = phoneNumber and enforces Field Agent role (slug='field-agent' or fallback level=4), status active. Password is hashed automatically by the User entity hook.
Request JSON
Required: name, phoneNumber, password, confirmPassword
Optional: pinfl, passportNumber, passportIssueDate (YYYY-MM-DD), passportIssuePlace, employeeAddress
Example (curl)

curl -sS -X POST "http://localhost:3000/api/register-field-agent" \  -H "Content-Type: application/json" \  -d '{    "name":"Ali Raza",    "phoneNumber":"+998901234567",    "password":"strongPassword@123",    "confirmPassword":"strongPassword@123",    "pinfl":"36192425214556",    "passportNumber":"AB1234567",    "passportIssueDate":"2025-01-02",    "passportIssuePlace":"Tashkent",    "employeeAddress":"Tashkent, Yunusabad..."  }'
Response: returns a “user resource” (password is null, plus role + permissions). Mapping is in user.resource.ts.
Common errors
400 if password/confirm mismatch (explicit BadRequestException)
Error if phone number already exists (service throws "A user with this phone number already exists")
Error if Field Agent role is missing in DB ("Field Agent role not found")
If you want to immediately login as that new Field Agent (to test uploads), use POST /api/login with username equal to the phone number:

TOKEN=$(curl -sS -X POST "http://localhost:3000/api/login" \  -H "Content-Type: application/json" \  -d '{"username":"+998901234567","password":"strongPassword@123"}' | jq -r .access_token)echo "$TOKEN" 2) Field Visit Tasks — Upload/List/Download/Delete Images (Documents tab)

Auth: JWT required + role must be Director or Field Agent
Upload endpoint: POST /api/field-visit/tasks/:taskId/attachments
Content-Type: multipart/form-data
Form fields:
file (required) — max 10MB
description (optional)
attachmentType (optional enum): photo | document | signature | receipt | other (default photo)
gpsLatitude / gpsLongitude (optional numbers)
Allowed file types: JPG/JPEG/PNG/GIF and PDF (validated by mimetype)
Storage: saved to ./uploads/field-visits with a generated filename
Example (curl) (important: don’t manually set the multipart boundary header)

curl -sS -X POST "http://localhost:3000/api/field-visit/tasks/123/attachments" \  -H "Authorization: Bearer $TOKEN" \  -F "file=@/path/to/image.png" \  -F "description=Front door photo" \  -F "attachmentType=photo" \  -F "gpsLatitude=41.311081" \  -F "gpsLongitude=69.240562"
List attachments for a task: GET /api/field-visit/tasks/:taskId/attachments

curl -sS -H "Authorization: Bearer $TOKEN" \  "http://localhost:3000/api/field-visit/tasks/123/attachments"
Returns attachments ordered newest-first; includes uploader relation.
Download a single attachment file: GET /api/field-visit/attachments/:attachmentId/download

curl -L -H "Authorization: Bearer $TOKEN" \  "http://localhost:3000/api/field-visit/attachments/55/download" \  -o downloaded-file
Delete attachment: DELETE /api/field-visit/attachments/:attachmentId

curl -sS -X DELETE -H "Authorization: Bearer $TOKEN" \  "http://localhost:3000/api/field-visit/attachments/55"
If you want, I can also write a short “frontend integration note” showing exactly which endpoint URLs the Hard Collection Field Visit Documents tab should call (based on the existing apiClient base URL).

# **Cases API Field Mapping Guide for Android**

## **Base URL:** `http://your-server.com/api`

**Authentication:** All endpoints require Bearer Token (JWT)

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## **📋 Field Mapping Table**

| Required Field      | API Response Field        | Data Type     | Example Value            | API Endpoint                   | Notes                               |
| ------------------- | ------------------------- | ------------- | ------------------------ | ------------------------------ | ----------------------------------- |
| **PINFL**           | `pinfl`                   | string        | `"12345678901234"`       | GET `/cases/{id}`              | ✅ Available (14 digits)            |
| **Contract**        | `contractNumber`          | string        | `"CN-2024-789"`          | GET `/cases/{id}`              | ✅ Available                        |
| **Passport**        | `passportNumber`          | string        | `"AA1234567"`            | GET `/cases/{id}`              | ✅ Available                        |
| **Upload Image**    | N/A                       | -             | -                        | POST `/files/upload`           | ✅ **IMPLEMENTED** - See Section 5  |
| **Update Status**   | `statusId` / `statusName` | number/string | `2` / `"In Progress"`    | PATCH `/cases/{id}`            | ✅ Available                        |
| **Update Remarks**  | `remarks`                 | string        | `"Customer promised..."` | PATCH `/cases/{id}`            | ✅ Available                        |
| **Payment History** | N/A                       | -             | -                        | GET `/payments?accountId={id}` | ✅ **Separate API** - See Section 6 |
| **Overdue Amount**  | `overdueAmount`           | number        | `4000000`                | GET `/cases/{id}`              | ✅ Auto-calculated                  |

---

## **🔍 Detailed API Response Structure**

### **1. GET /cases/{id} - Get Single Case**

```http
GET /cases/123
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": 123,
  "accountId": 456,
  "caseNumber": "HC-2025-001",

  // ============ IDENTITY FIELDS ============
  "debtorName": "John Doe",
  "debtorPhone": "+998901234567",
  "debtorEmail": "john.doe@example.com",
  "debtorAddress": "Tashkent, Uzbekistan",

  // ============ DOCUMENT NUMBERS ============
  "contractNumber": "CN-2024-789", // ← Contract Number
  "passportNumber": "AA1234567", // ← Passport
  "pinfl": "12345678901234", // ← PINFL (14 digits)

  // ============ FINANCIAL FIELDS ============
  "totalAmount": 5000000, // Total debt amount
  "paidAmount": 1000000, // Amount paid so far
  "overdueAmount": 4000000, // ← Overdue Amount (auto-calculated: totalAmount - paidAmount)
  "interestAmount": 200000, // Interest charges
  "penaltyAmount": 150000, // Penalty charges

  // ============ STATUS & REMARKS ============
  "statusId": 2, // ← Status ID (for updates)
  "statusName": "In Progress", // ← Status Name (for display)
  "remarks": "Customer promised to pay next week", // ← Remarks/Notes

  // ============ ASSIGNMENT ============
  "assignedAgentId": 10,
  "assignedAgentName": "Agent Smith",

  // ============ TIMESTAMPS ============
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-12-04T15:20:00.000Z",
  "lastContactDate": "2025-12-03T09:00:00.000Z",

  // ============ ACCOUNT DETAILS ============
  "account": {
    "id": 456,
    "accountNumber": "ACC-2024-456",
    "pinfl": "12345678901234", // Alternative PINFL location
    "contractNumber": "CN-2024-789", // Alternative contract location
    "passportSeries": "AA",
    "passportNumber": "1234567"
  }
}
```

---

### **2. GET /cases - Get All Cases (with pagination)**

```http
GET /cases?page=1&limit=10&search=John&statusId=2&agentId=10
Authorization: Bearer {token}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | Integer | Page number (default: 1) |
| `limit` | Integer | Items per page (default: 10) |
| `search` | String | Search by debtor name, account number |
| `statusId` | Integer | Filter by status ID |
| `agentId` | Integer | Filter by assigned agent |

**Response:**

```json
{
  "data": [
    {
      "id": 123,
      "caseNumber": "HC-2025-001",
      "debtorName": "John Doe",
      "debtorPhone": "+998901234567",
      "contractNumber": "CN-2024-789",
      "passportNumber": "AA1234567",
      "pinfl": "12345678901234",
      "totalAmount": 5000000,
      "paidAmount": 1000000,
      "overdueAmount": 4000000,
      "statusId": 2,
      "statusName": "In Progress",
      "assignedAgentId": 10,
      "assignedAgentName": "Agent Smith",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-12-04T15:20:00.000Z",
      "lastContactDate": "2025-12-03T09:00:00.000Z",
      "remarks": "Customer promised to pay next week"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95,
    "itemsPerPage": 10
  }
}
```

---

## **3. Update Case Status**

```http
PATCH /cases/123
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "statusId": 3,
  "remarks": "Case resolved after payment"
}
```

**Response:**

```json
{
  "id": 123,
  "statusId": 3,
  "statusName": "Resolved",
  "remarks": "Case resolved after payment",
  "updatedAt": "2025-12-05T10:00:00.000Z"
}
```

---

## **4. Update Case Remarks/Notes**

```http
PATCH /cases/123
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "remarks": "Customer called back, promised payment by end of week. Follow up scheduled for Friday."
}
```

**Response:**

```json
{
  "id": 123,
  "remarks": "Customer called back, promised payment by end of week. Follow up scheduled for Friday.",
  "updatedAt": "2025-12-05T10:30:00.000Z"
}
```

---

## **5. Upload Image to Case** ✅ **IMPLEMENTED**

### **5.1 Upload Document/Image (Passport, Contract, etc.)**

```http
POST /files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ Yes | Image or PDF file |
| `entityType` | String | ✅ Yes | Use `"case"` for case documents |
| `entityId` | Integer | ✅ Yes | Case ID |
| `documentType` | String | ❌ No | Type: `"passport"`, `"contract"`, `"photo"`, `"receipt"`, `"other"` |
| `description` | String | ❌ No | Description of the document |

**Android Example (Kotlin):**

```kotlin
suspend fun uploadCaseDocument(
    caseId: Int,
    file: File,
    documentType: String
): CaseDocument {
    val filePart = file.asRequestBody("image/*".toMediaTypeOrNull())
    val fileMultipart = MultipartBody.Part.createFormData("file", file.name, filePart)
    val entityType = "case".toRequestBody("text/plain".toMediaTypeOrNull())
    val entityId = caseId.toString().toRequestBody("text/plain".toMediaTypeOrNull())
    val docType = documentType.toRequestBody("text/plain".toMediaTypeOrNull())

    return api.uploadFile(fileMultipart, entityType, entityId, docType)
}
```

**Response:**

```json
{
  "id": 555,
  "fileName": "passport_scan_123.jpg",
  "originalName": "passport.jpg",
  "filePath": "/uploads/documents/passport_scan_123.jpg",
  "fileSize": 245680,
  "mimeType": "image/jpeg",
  "documentType": "passport",
  "entityType": "case",
  "entityId": 123,
  "uploadedBy": 10,
  "createdAt": "2025-12-05T10:45:00.000Z"
}
```

---

### **5.2 Get Documents for Case**

```http
GET /files?entityType=case&entityId=123
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": 555,
    "fileName": "passport_scan_123.jpg",
    "originalName": "passport.jpg",
    "filePath": "/uploads/documents/passport_scan_123.jpg",
    "fileSize": 245680,
    "mimeType": "image/jpeg",
    "documentType": "passport",
    "entityType": "case",
    "entityId": 123,
    "uploadedBy": 10,
    "uploadedByName": "Agent Smith",
    "createdAt": "2025-12-05T10:45:00.000Z"
  },
  {
    "id": 556,
    "fileName": "contract_123.pdf",
    "originalName": "signed_contract.pdf",
    "filePath": "/uploads/documents/contract_123.pdf",
    "fileSize": 512000,
    "mimeType": "application/pdf",
    "documentType": "contract",
    "entityType": "case",
    "entityId": 123,
    "uploadedBy": 10,
    "uploadedByName": "Agent Smith",
    "createdAt": "2025-12-04T14:20:00.000Z"
  }
]
```

---

### **5.3 Download Document**

```http
GET /files/555/download
Authorization: Bearer {token}
```

**Response:** Binary file data

---

## **6. Payment History** ✅ **IMPLEMENTED**

### **6.1 Get Payment History for Case**

```http
GET /payments?accountId=456
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": 789,
    "accountId": 456,
    "amount": 500000,
    "paymentDate": "2025-11-15T14:30:00.000Z",
    "paymentMethod": "Bank Transfer",
    "referenceNumber": "TRX-2025-11-15-001",
    "remarks": "Partial payment",
    "createdBy": 10,
    "createdByName": "Agent Smith",
    "createdAt": "2025-11-15T14:30:00.000Z"
  },
  {
    "id": 790,
    "accountId": 456,
    "amount": 500000,
    "paymentDate": "2025-12-01T10:00:00.000Z",
    "paymentMethod": "Cash",
    "referenceNumber": "TRX-2025-12-01-002",
    "remarks": "Second installment",
    "createdBy": 10,
    "createdByName": "Agent Smith",
    "createdAt": "2025-12-01T10:00:00.000Z"
  }
]
```

---

### **6.2 Add Payment**

```http
POST /payments
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "accountId": 456,
  "amount": 500000,
  "paymentDate": "2025-12-05T10:00:00.000Z",
  "paymentMethod": "Cash",
  "referenceNumber": "TRX-2025-12-05-003",
  "remarks": "Payment collected during field visit"
}
```

**Response:**

```json
{
  "id": 791,
  "accountId": 456,
  "amount": 500000,
  "paymentDate": "2025-12-05T10:00:00.000Z",
  "paymentMethod": "Cash",
  "referenceNumber": "TRX-2025-12-05-003",
  "remarks": "Payment collected during field visit",
  "createdAt": "2025-12-05T10:00:00.000Z"
}
```

---

## **7. Get Available Statuses**

```http
GET /cases/statuses
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "New",
    "slug": "new",
    "color": "#3B82F6"
  },
  {
    "id": 2,
    "name": "In Progress",
    "slug": "in-progress",
    "color": "#F59E0B"
  },
  {
    "id": 3,
    "name": "Resolved",
    "slug": "resolved",
    "color": "#10B981"
  },
  {
    "id": 4,
    "name": "Closed",
    "slug": "closed",
    "color": "#6B7280"
  }
]
```

---

## **📊 Complete Kotlin Data Models**

### **Case Model**

```kotlin
data class Case(
    @SerializedName("id")
    val id: Int,

    @SerializedName("accountId")
    val accountId: Int,

    @SerializedName("caseNumber")
    val caseNumber: String,

    // Identity
    @SerializedName("debtorName")
    val debtorName: String,

    @SerializedName("debtorPhone")
    val debtorPhone: String?,

    @SerializedName("debtorEmail")
    val debtorEmail: String?,

    @SerializedName("debtorAddress")
    val debtorAddress: String?,

    // Document Numbers
    @SerializedName("contractNumber")
    val contractNumber: String?,

    @SerializedName("passportNumber")
    val passportNumber: String?,

    @SerializedName("pinfl")
    val pinfl: String?,

    // Financial
    @SerializedName("totalAmount")
    val totalAmount: Double,

    @SerializedName("paidAmount")
    val paidAmount: Double,

    @SerializedName("overdueAmount")
    val overdueAmount: Double,

    @SerializedName("interestAmount")
    val interestAmount: Double?,

    @SerializedName("penaltyAmount")
    val penaltyAmount: Double?,

    // Status
    @SerializedName("statusId")
    val statusId: Int,

    @SerializedName("statusName")
    val statusName: String,

    // Assignment
    @SerializedName("assignedAgentId")
    val assignedAgentId: Int?,

    @SerializedName("assignedAgentName")
    val assignedAgentName: String?,

    // Timestamps
    @SerializedName("createdAt")
    val createdAt: String,

    @SerializedName("updatedAt")
    val updatedAt: String,

    @SerializedName("lastContactDate")
    val lastContactDate: String?,

    // Notes
    @SerializedName("remarks")
    val remarks: String?
)
```

---

### **Payment Model**

```kotlin
data class Payment(
    @SerializedName("id")
    val id: Int,

    @SerializedName("accountId")
    val accountId: Int,

    @SerializedName("amount")
    val amount: Double,

    @SerializedName("paymentDate")
    val paymentDate: String,

    @SerializedName("paymentMethod")
    val paymentMethod: String,

    @SerializedName("referenceNumber")
    val referenceNumber: String?,

    @SerializedName("remarks")
    val remarks: String?,

    @SerializedName("createdBy")
    val createdBy: Int,

    @SerializedName("createdByName")
    val createdByName: String?,

    @SerializedName("createdAt")
    val createdAt: String
)
```

---

### **Document Model**

```kotlin
data class CaseDocument(
    @SerializedName("id")
    val id: Int,

    @SerializedName("fileName")
    val fileName: String,

    @SerializedName("originalName")
    val originalName: String,

    @SerializedName("filePath")
    val filePath: String,

    @SerializedName("fileSize")
    val fileSize: Int,

    @SerializedName("mimeType")
    val mimeType: String,

    @SerializedName("documentType")
    val documentType: String,

    @SerializedName("entityType")
    val entityType: String,

    @SerializedName("entityId")
    val entityId: Int,

    @SerializedName("uploadedBy")
    val uploadedBy: Int,

    @SerializedName("uploadedByName")
    val uploadedByName: String?,

    @SerializedName("createdAt")
    val createdAt: String
)
```

---

### **Status Model**

```kotlin
data class CaseStatus(
    @SerializedName("id")
    val id: Int,

    @SerializedName("name")
    val name: String,

    @SerializedName("slug")
    val slug: String,

    @SerializedName("color")
    val color: String
)
```

---

## **🔑 Authentication**

### **Login**

```http
POST /auth/login
Content-Type: application/json
```

**Request:**

```json
{
  "username": "admin",
  "password": "12345678"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": {
      "id": 1,
      "name": "Admin"
    }
  }
}
```

**Use token in subsequent requests:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## **⚠️ Important Notes for Android Developer**

### **1. PINFL (National ID)**

- 14-digit national identification number
- Available in case response: `case.pinfl`
- May be empty for old records
- Can also be found in `case.account.pinfl`

### **2. Contract Number**

- Available in case response: `case.contractNumber`
- Alternative location: `case.account.contractNumber`

### **3. Passport Number**

- Available in case response: `case.passportNumber`
- May need to combine `passportSeries` + `passportNumber` from account

### **4. Upload Image to Case**

- ✅ **FULLY IMPLEMENTED**
- Use `/files/upload` endpoint
- Set `entityType=case` and `entityId={caseId}`
- Supports: JPG, JPEG, PNG, GIF, PDF
- Recommended `documentType` values: `passport`, `contract`, `photo`, `receipt`, `other`

### **5. Update Status**

- First, get available statuses from `/cases/statuses`
- Then use `statusId` (number) in PATCH request
- Can combine with remarks update in same request

### **6. Update Remarks**

- Use PATCH `/cases/{id}` with `remarks` field
- Can update remarks alone or with status

### **7. Payment History**

- **Separate API call required**
- Use `GET /payments?accountId={accountId}`
- Extract `accountId` from case first
- Can also add new payments with POST `/payments`

### **8. Overdue Amount**

- Automatically calculated: `overdueAmount = totalAmount - paidAmount`
- No manual calculation needed
- Always available in case response

---

## **📡 Complete Android Repository Example**

```kotlin
class CaseRepository(private val api: ApiService) {

    // Get single case with all details
    suspend fun getCaseDetails(caseId: Int): Case {
        return api.getCaseDetails(caseId)
    }

    // Get all cases with pagination
    suspend fun getAllCases(
        page: Int = 1,
        limit: Int = 10,
        search: String? = null,
        statusId: Int? = null
    ): CasesResponse {
        return api.getAllCases(page, limit, search, statusId)
    }

    // Update case status
    suspend fun updateStatus(
        caseId: Int,
        statusId: Int,
        remarks: String? = null
    ): Case {
        val request = UpdateCaseRequest(
            statusId = statusId,
            remarks = remarks
        )
        return api.updateCase(caseId, request)
    }

    // Update case remarks
    suspend fun updateRemarks(caseId: Int, remarks: String): Case {
        val request = UpdateCaseRequest(remarks = remarks)
        return api.updateCase(caseId, request)
    }

    // Upload document (passport, contract, etc.)
    suspend fun uploadDocument(
        caseId: Int,
        file: File,
        documentType: String
    ): CaseDocument {
        val filePart = file.asRequestBody("image/*".toMediaTypeOrNull())
        val fileMultipart = MultipartBody.Part.createFormData("file", file.name, filePart)
        val entityType = "case".toRequestBody("text/plain".toMediaTypeOrNull())
        val entityId = caseId.toString().toRequestBody("text/plain".toMediaTypeOrNull())
        val docType = documentType.toRequestBody("text/plain".toMediaTypeOrNull())

        return api.uploadFile(fileMultipart, entityType, entityId, docType)
    }

    // Get all documents for case
    suspend fun getCaseDocuments(caseId: Int): List<CaseDocument> {
        return api.getFiles(entityType = "case", entityId = caseId)
    }

    // Get payment history
    suspend fun getPaymentHistory(accountId: Int): List<Payment> {
        return api.getPayments(accountId)
    }

    // Add new payment
    suspend fun addPayment(payment: PaymentRequest): Payment {
        return api.createPayment(payment)
    }

    // Get available statuses
    suspend fun getStatuses(): List<CaseStatus> {
        return api.getCaseStatuses()
    }
}
```

---

## **🧪 Testing Examples**

### **Using cURL:**

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"12345678"}'

# 2. Get case details
curl -X GET http://localhost:3000/api/cases/123 \
  -H 'Authorization: Bearer YOUR_TOKEN'

# 3. Update status
curl -X PATCH http://localhost:3000/api/cases/123 \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"statusId":3,"remarks":"Case resolved"}'

# 4. Upload document
curl -X POST http://localhost:3000/api/files/upload \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'file=@passport.jpg' \
  -F 'entityType=case' \
  -F 'entityId=123' \
  -F 'documentType=passport'

# 5. Get payment history
curl -X GET 'http://localhost:3000/api/payments?accountId=456' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## **📊 Quick Reference Table**

| Feature             | Endpoint          | Method | Body/Query                           |
| ------------------- | ----------------- | ------ | ------------------------------------ |
| **Get Case**        | `/cases/{id}`     | GET    | -                                    |
| **Get All Cases**   | `/cases`          | GET    | `?page=1&limit=10&search=...`        |
| **Update Status**   | `/cases/{id}`     | PATCH  | `{"statusId": 3}`                    |
| **Update Remarks**  | `/cases/{id}`     | PATCH  | `{"remarks": "..."}`                 |
| **Upload Document** | `/files/upload`   | POST   | FormData: file, entityType, entityId |
| **Get Documents**   | `/files`          | GET    | `?entityType=case&entityId={id}`     |
| **Get Payments**    | `/payments`       | GET    | `?accountId={id}`                    |
| **Add Payment**     | `/payments`       | POST   | Payment JSON                         |
| **Get Statuses**    | `/cases/statuses` | GET    | -                                    |

---

## **✅ Field Availability Summary**

| Field           | Status   | Location              |
| --------------- | -------- | --------------------- |
| PINFL           | ✅ Ready | `case.pinfl`          |
| Contract Number | ✅ Ready | `case.contractNumber` |
| Passport Number | ✅ Ready | `case.passportNumber` |
| Upload Image    | ✅ Ready | POST `/files/upload`  |
| Update Status   | ✅ Ready | PATCH `/cases/{id}`   |
| Update Remarks  | ✅ Ready | PATCH `/cases/{id}`   |
| Payment History | ✅ Ready | GET `/payments`       |
| Overdue Amount  | ✅ Ready | `case.overdueAmount`  |

**All features are fully implemented and ready for Android development!**

---

**Document Version:** 2.0  
**API Version:** 1.0  
**Last Updated:** December 5, 2025  
**Backend Branch:** `feature/field_visit`  
**Prepared For:** Android Development Team

**For Questions:** Contact Backend Team
