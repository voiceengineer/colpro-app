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
