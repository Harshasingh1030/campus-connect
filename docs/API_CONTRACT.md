# CampusConnect — REST API Specification & Contract

This document outlines the planned REST API contract for the **CampusConnect** backend hosted on **Amazon API Gateway** and executed by **AWS Lambda** with **Amazon DynamoDB** persistence.

---

## 1. Global Conventions

- **Base URL**: `https://{api-id}.execute-api.{region}.amazonaws.com/prod/v1` (or custom domain `https://api.campusconnect.example.edu/v1`)
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <Cognito ID/Access Token>`), validated via Amazon Cognito Authorizer or Lambda Authorizer.
- **Frontend Role Checks**: Frontend role validation is for user experience (UX) and navigation gating only. True authorization is strictly enforced by AWS Lambda handlers evaluating Cognito claims (`cognito:groups`).

### Standard Error Response Format
```json
{
  "error": {
    "code": "EVENT_CAPACITY_FULL",
    "message": "Sorry, this event has reached its maximum participant capacity.",
    "requestId": "aws-request-id-uuid",
    "timestamp": "2026-10-19T18:00:00Z"
  }
}
```

---

## 2. Authentication Endpoints (Amazon Cognito Proxy)

> **Note**: While frontend applications typically authenticate directly against Amazon Cognito using the AWS Amplify Auth SDK or Cognito Identity JS, these endpoints represent API Gateway proxy routes for custom authorizer flows.

### `POST /auth/login`
- **Description**: Authenticate student or administrator credentials.
- **Request Body**:
  ```json
  {
    "email": "student@campus.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "accessToken": "eyJraWQ...",
      "idToken": "eyJraWQ...",
      "refreshToken": "eyJraWQ...",
      "expiresIn": 3600,
      "user": {
        "id": "usr_991203",
        "name": "Aarav Sharma",
        "email": "student@campus.edu",
        "role": "student",
        "studentId": "CS2023-048",
        "department": "Computer Science & Engineering"
      }
    }
    ```
  - `401 Unauthorized`: Invalid credentials.

### `POST /auth/register`
- **Description**: Register a new student profile in Cognito User Pool.
- **Request Body**:
  ```json
  {
    "name": "Maya Patel",
    "email": "maya@campus.edu",
    "studentId": "CS2026-104",
    "department": "Computer Science & Engineering",
    "password": "SecurePassword123!"
  }
  ```
- **Responses**:
  - `201 Created`: User created with status `CONFIRMED` or `UNCONFIRMED` (requiring email OTP code).
  - `409 Conflict`: User with email already exists.

---

## 3. Events Endpoints

### `GET /events`
- **Description**: List published events with query parameter filtering.
- **Query Parameters**:
  - `q` (string): Search query across title, description, venue, and tags.
  - `category` (string): Category filter (`technical`, `cultural`, `sports`, `workshop`, `hackathon`, `seminar`).
  - `status` (string, Admin only): `published`, `draft`, `cancelled`, `all`.
  - `startDate` (ISO 8601 string): Filter events on or after date.
  - `endDate` (ISO 8601 string): Filter events on or before date.
  - `venue` (string): Filter by venue string.
  - `sortBy` (string): `date` (default) or `popularity`.
- **Response `200 OK`**:
  ```json
  {
    "events": [
      {
        "id": "evt-001",
        "title": "HackCampus 2026: 48-Hour National Hackathon",
        "shortDescription": "Build real-world solutions...",
        "fullDescription": "Join 500+ student developers...",
        "category": "hackathon",
        "eventDate": "2026-11-14",
        "startTime": "09:00",
        "endTime": "18:00",
        "venue": "Main Campus Auditorium",
        "organizer": "ACM Student Chapter",
        "organizerEmail": "acm@campus.edu",
        "maxParticipants": 300,
        "registeredCount": 245,
        "registrationDeadline": "2026-11-10T23:59",
        "status": "published",
        "posterUrl": "https://d123456.cloudfront.net/posters/evt-001.jpg",
        "featured": true,
        "price": "Free",
        "tags": ["Hackathon", "Coding", "AI"]
      }
    ],
    "count": 1
  }
  ```

### `GET /events/{id}`
- **Description**: Retrieve specific event details by ID.
- **Response `200 OK`**: Event object.
- **Response `404 Not Found`**: Event ID not found in DynamoDB.

### `POST /admin/events` (Admin Only)
- **Description**: Create and publish or draft a new event.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Quantum Computing Colloquium",
    "shortDescription": "Intro to Qubits and Qiskit.",
    "fullDescription": "Detailed curriculum...",
    "category": "seminar",
    "eventDate": "2026-12-01",
    "startTime": "14:00",
    "endTime": "17:00",
    "venue": "Physics Lecture Hall 1",
    "organizer": "Dept. of Physics",
    "organizerEmail": "physics@campus.edu",
    "maxParticipants": 120,
    "registrationDeadline": "2026-11-28T18:00",
    "eligibility": "Open to all students",
    "status": "published",
    "posterUrl": "https://d123456.cloudfront.net/posters/quantum.jpg",
    "featured": false,
    "tags": ["Physics", "Quantum", "Research"]
  }
  ```
- **Responses**:
  - `201 Created`: Returns newly created event with generated `id`.
  - `400 Bad Request`: Validation failure (negative capacity, invalid date sequence).
  - `403 Forbidden`: Caller lacks admin role.

### `PUT /admin/events/{id}` (Admin Only)
- **Description**: Update an existing event's details.
- **Response `200 OK`**: Updated event object.
- **Response `400 Bad Request`**: Capacity reduced below currently registered count.

### `PATCH /admin/events/{id}/status` (Admin Only)
- **Description**: Transition event status (`published`, `draft`, `cancelled`).
- **Request Body**: `{ "status": "cancelled" }`
- **Response `200 OK`**: Status updated.

### `DELETE /admin/events/{id}` (Admin Only)
- **Description**: Permanently delete a draft event. (Published events with registered participants must be cancelled rather than deleted).
- **Responses**:
  - `204 No Content`: Successfully deleted.
  - `409 Conflict`: Cannot delete published event with active registrations.

---

## 4. Registration Endpoints

### `POST /events/{eventId}/registrations`
- **Description**: Register current student for an event.
- **Headers**: `Authorization: Bearer <token>`
- **DynamoDB Atomic Invariant**:
  - Uses `TransactWriteItems` or conditional `PutItem` with `attribute_not_exists(PK)`.
  - Concurrently increments `registeredCount` on the event item with condition `registeredCount < maxParticipants`.
- **Request Body**:
  ```json
  {
    "studentId": "usr_991203",
    "studentName": "Aarav Sharma",
    "studentEmail": "student@campus.edu",
    "studentRegNo": "CS2023-048",
    "department": "Computer Science & Engineering"
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "registration": {
        "id": "reg-2026-9812",
        "eventId": "evt-001",
        "studentId": "usr_991203",
        "ticketCode": "CC-HCK-2026-9812",
        "status": "confirmed",
        "attendance": "pending",
        "registeredAt": "2026-10-19T18:00:00Z"
      }
    }
    ```
  - `400 Bad Request`: Registration deadline has passed.
  - `409 Conflict`: Duplicate registration (`ConditionalCheckFailedException: Already registered`).
  - `410 Gone`: Event capacity full (`ConditionalCheckFailedException: Capacity full`).

### `POST /registrations/{registrationId}/cancel`
- **Description**: Cancel a student's confirmed registration and release the seat back to the pool.
- **Headers**: `Authorization: Bearer <token>`
- **DynamoDB Atomic Invariant**:
  - Updates registration status to `cancelled`.
  - Atomically decrements event `registeredCount` by 1 (`SET registeredCount = registeredCount - :one`).
- **Response `200 OK`**: `{ "status": "cancelled", "registrationId": "reg-2026-9812" }`.

### `GET /me/registrations`
- **Description**: Retrieve all event registrations for the authenticated student.
- **Response `200 OK`**: List of registrations with associated event details.

### `GET /admin/events/{eventId}/registrations` (Admin Only)
- **Description**: List all registered attendees for a specific event or all events.
- **Response `200 OK`**: Array of participant registration records.

---

## 5. Attendance & Ticket Verification Endpoints

### `POST /admin/attendance/verify` (Admin Only)
- **Description**: Scan or query ticket code / registration ID to verify entry legitimacy.
- **Request Body**: `{ "ticketCode": "CC-HCK-2026-8941" }`
- **Responses**:
  - `200 OK`:
    ```json
    {
      "valid": true,
      "registration": {
        "id": "reg-2026-001",
        "studentName": "Aarav Sharma",
        "studentRegNo": "CS2023-048",
        "eventTitle": "HackCampus 2026",
        "status": "confirmed",
        "attendance": "pending"
      },
      "isAlreadyCheckedIn": false,
      "message": "Valid ticket confirmed."
    }
    ```
  - `404 Not Found`: Ticket code does not exist.
  - `400 Bad Request`: Ticket is cancelled.

### `POST /admin/attendance/{registrationId}/mark` (Admin Only)
- **Description**: Mark participant attendance status (`present` or `absent`).
- **Request Body**: `{ "status": "present" }`
- **Response `200 OK`**: Attendance updated.

---

## 6. Secure S3 Upload Endpoints

### `POST /admin/uploads/presigned-url` (Admin Only)
- **Description**: Generates a secure, short-lived Amazon S3 presigned PUT URL for uploading event poster images directly from the browser into the private S3 bucket.
- **Request Body**:
  ```json
  {
    "fileName": "hackathon_banner.png",
    "fileType": "image/png",
    "fileSize": 2048500
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "uploadUrl": "https://campusconnect-posters-prod.s3.amazonaws.com/posters/evt-uuid.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
      "finalUrl": "https://d123456.cloudfront.net/posters/evt-uuid.png",
      "s3Key": "posters/evt-uuid.png",
      "expiresInSeconds": 300
    }
    ```
  - `400 Bad Request`: Invalid MIME type or file size exceeds 5MB limit.
