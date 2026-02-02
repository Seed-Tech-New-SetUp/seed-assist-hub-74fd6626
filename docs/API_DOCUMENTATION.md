# SEED Assist Portal - API Documentation

> **Last Updated:** February 2026  
> **Base URL:** `https://seedglobaleducation.com/api/assist/`  
> **Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [In-Person Events](#2-in-person-events)
   - [BSF Events](#21-bsf-events)
   - [Campus Tours](#22-campus-tours)
3. [Virtual Events](#3-virtual-events)
   - [Overview](#31-overview)
   - [Masterclasses](#32-masterclasses)
   - [Meetups (1:1 Profile Evaluation)](#33-meetups-11-profile-evaluation)
4. [In-Country Representation (ICR)](#4-in-country-representation-icr)
5. [Scholarship Portal](#5-scholarship-portal)
6. [University Applications](#6-university-applications)
7. [Lead & Application Engagement (LAE)](#7-lead--application-engagement-lae)
8. [Profile Leads](#8-profile-leads)
9. [School Profile](#9-school-profile)
10. [Programs Management](#10-programs-management)
11. [Team Management](#11-team-management)
12. [AI Visa Tutor](#12-ai-visa-tutor)
13. [Secure Report Download](#13-secure-report-download)

---

## Authentication Header

All authenticated endpoints require the following header:

```
Authorization: Bearer <portal_token>
```

The `portal_token` is obtained from the login endpoint and stored in secure cookies (`portal_token` or `auth_token`).

---

## 1. Authentication

### 1.1 Login

**Endpoint:** `POST /login.php`

**Proxy:** `portal-auth`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe",
      "school_id": "456",
      "school_name": "Example Business School",
      "permissions": {
        "leadGeneration": { "enabled": true },
        "inPersonEvents": { "enabled": true },
        "virtualEvents": { "enabled": true },
        "icrReports": { "enabled": true },
        "scholarshipPortal": { "enabled": true },
        "applicantPools": { "enabled": true },
        "leadAndApplicationEngagement": { "enabled": true },
        "visaPrep": { "enabled": true },
        "schoolProfile": { "enabled": true },
        "teamManagement": { "enabled": true }
      }
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Error Codes:**
- `EMAIL_NOT_FOUND` - Email not registered
- `INVALID_PASSWORD` - Incorrect password

---

## 2. In-Person Events

### 2.1 BSF Events

**Proxy:** `bsf-proxy`

#### List BSF Events

**Endpoint:** `GET /in-person-event/bsf`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "event_name": "Business School Festival Lagos 2024",
      "city": "Lagos",
      "country": "Nigeria",
      "event_date": "2024-03-15",
      "season": "Spring 2024",
      "registrants": 245,
      "attendees": 198,
      "connections": 156,
      "has_report": true
    }
  ]
}
```

#### Download BSF Report

**Endpoint:** `GET /in-person-event/bsf/reports.php?id={event_id}`

**Response:** Binary XLSX file

**Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="bsf_report_{event_id}.xlsx"
```

---

### 2.2 Campus Tours

**Proxy:** `campus-tour-proxy`

#### List Campus Tour Events

**Endpoint:** `GET /in-person-event/campus-tour/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "event_name": "IIT Delhi Campus Tour",
      "campus": "IIT Delhi",
      "city": "New Delhi",
      "country": "India",
      "event_date": "2024-02-20",
      "campuses_reached": 1,
      "attendees": 450,
      "students_connected": 280,
      "has_report": true
    }
  ]
}
```

#### Download Campus Tour Report

**Endpoint:** `GET /in-person-event/campus-tour/reports.php?id={event_id}`

**Response:** Binary XLSX file

---

## 3. Virtual Events

**Proxy:** `virtual-events-proxy`

### 3.1 Overview

**Endpoint:** `GET /virtual-event/overview.php`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_registrations": 5000,
    "total_attendance": 3200,
    "total_events": 45,
    "upcoming_event": {
      "id": "1",
      "title": "MBA Application Masterclass",
      "date": "2024-03-20",
      "time": "14:00",
      "timezone": "IST"
    },
    "latest_report": {
      "id": "10",
      "title": "Career Switcher Webinar",
      "date": "2024-03-15",
      "type": "masterclass"
    }
  }
}
```

### 3.2 Masterclasses

#### List Masterclasses

**Endpoint:** `GET /virtual-event/masterclass`

**Proxy Query:** `?action=masterclass`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "MBA Application Masterclass",
      "date": "2024-03-20",
      "time": "14:00",
      "timezone": "IST",
      "registrants": 150,
      "attendees": 98,
      "recording_url": "https://...",
      "has_report": true
    }
  ]
}
```

#### Download Masterclass Report

**Endpoint:** `GET /virtual-event/masterclass/report.php?id={event_id}`

**Proxy Query:** `?action=download&id={event_id}`

**Response:** Binary XLSX file

### 3.3 Meetups (1:1 Profile Evaluation)

#### List Meetups

**Endpoint:** `GET /virtual-event/meetup`

**Proxy Query:** `?action=meetup` or `?action=meetups`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Profile Evaluation Session - Lagos",
      "date": "2024-03-18",
      "registrants": 80,
      "attendees": 65,
      "connections": 45,
      "has_report": true
    }
  ]
}
```

#### Download Meetup Report

**Endpoint:** `GET /virtual-event/meetup/reports.php?id={event_id}`

**Proxy Query:** `?action=download-meetup&id={event_id}`

**Response:** Binary XLSX file

---

## 4. In-Country Representation (ICR)

**Proxy:** `icr-proxy`

### 4.1 List ICR Reports

**Endpoint:** `GET /in-country-representation/`

**Request Method:** `POST` (via proxy with JSON body)

**Request Body:**
```json
{
  "year": "2024",
  "month": "03"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "1",
        "title": "Nigeria Monthly Report",
        "country": "Nigeria",
        "region": "West Africa",
        "month": "March",
        "year": "2024",
        "activities_count": 12,
        "leads_generated": 45,
        "report_url": "https://..."
      }
    ],
    "filter_options": {
      "years": ["2024", "2023"],
      "months": ["January", "February", "March"]
    }
  }
}
```

### 4.2 Download ICR Report

**Endpoint:** `GET /in-country-representation/download.php?id={report_id}`

**Response:** Binary PDF/XLSX file

---

## 5. Scholarship Portal

**Proxy:** `scholarship-proxy`

### 5.1 List Scholarship Applicants

**Endpoint:** `GET /scholarship/applicants.php`

**Proxy Query:** `?action=list` or `?action=applicants`

**Response:**
```json
{
  "success": true,
  "data": {
    "applicants": [
      {
        "id": "1",
        "contact_id": "C001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+234123456789",
        "nationality": "NG",
        "nationality_name": "Nigeria",
        "gender": "Male",
        "test_type": "GMAT",
        "test_score": 720,
        "program_applied": "MBA",
        "round": "Round 1",
        "status": "Pending",
        "applied_date": "2024-01-15"
      }
    ],
    "meta": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "total_pages": 8
    },
    "filter_options": {
      "nationalities": [
        { "key": "NG", "value": "Nigeria" },
        { "key": "KE", "value": "Kenya" }
      ],
      "genders": ["Male", "Female", "Other"],
      "test_types": ["GMAT", "GRE", "None"],
      "rounds": ["Round 1", "Round 2", "Round 3"],
      "statuses": ["Pending", "Shortlisted", "SEED Recommended", "Admitted", "Rejected"]
    },
    "status_counts": {
      "Pending": 45,
      "Shortlisted": 30,
      "SEED Recommended": 25,
      "Admitted": 35,
      "Rejected": 15
    }
  }
}
```

### 5.2 Get Student Profile

**Endpoint:** `GET /scholarship/profile.php?contact_id={contact_id}`

**Proxy Query:** `?action=profile&contact_id={contact_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "contact_id": "C001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+234123456789",
    "nationality": "Nigeria",
    "date_of_birth": "1995-05-15",
    "gender": "Male",
    "education": {
      "undergraduate": {
        "institution": "University of Lagos",
        "degree": "BSc Economics",
        "gpa": "3.8",
        "graduation_year": "2017"
      }
    },
    "work_experience": [...],
    "test_scores": {
      "gmat": {
        "total": 720,
        "verbal": 38,
        "quant": 49
      }
    },
    "documents": [...]
  }
}
```

### 5.3 Update Applicant Status

**Endpoint:** `POST /scholarship/status_assignment.php`

**Proxy Query:** `?action=status_assignment`

**Request Body:**
```json
{
  "contact_id": "C001",
  "status": "Shortlisted"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

---

## 6. University Applications

**Proxy:** `applications-proxy`

### 6.1 List Applications

**Endpoint:** `GET /admissions/index.php`

**Proxy Query:** `?action=list`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name or email |
| `status` | string | Filter by status |
| `program` | string | Filter by program |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "record_id": "APP001",
        "name": "John Doe",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone_number": "+234123456789",
        "program_name": "MBA Full-Time",
        "intake": "Fall 2024",
        "status": "Applied",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "meta": {
      "total_applications": 250,
      "filtered_count": 50,
      "status_counts": {
        "Applied": 100,
        "Under Review": 80,
        "Admitted": 50,
        "Rejected": 20
      }
    },
    "filter_options": {
      "statuses": ["Applied", "Under Review", "Interview Scheduled", "Admitted", "Rejected"],
      "intakes": ["Fall 2024", "Spring 2025"],
      "programs": ["MBA Full-Time", "MBA Part-Time", "EMBA"]
    },
    "school": {
      "university": "Example University",
      "school_name": "Example Business School"
    }
  }
}
```

### 6.2 Export Applications

**Endpoint:** `GET /admissions/download.php`

**Proxy Query:** `?action=export`

**Note:** The primary export method is client-side using the `xlsx` library. The backend endpoint is available as fallback.

**Response:** Binary XLSX file

---

## 7. Lead & Application Engagement (LAE)

**Proxy:** `lae-proxy`

**Permission Requirement:** `leadAndApplicationEngagement.enabled` must be `true`

### 7.1 Get LAE Analytics

**Endpoint:** `GET /lae/`

**Proxy Query:** `?action=list`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | string | Filter by year |
| `month` | string | Filter by month |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_assignments": 150,
      "completed": 120,
      "pending": 30,
      "success_rate": 80
    },
    "assignments": [
      {
        "id": "1",
        "student_name": "John Doe",
        "student_email": "john@example.com",
        "program": "MBA",
        "assignment_type": "Application Review",
        "status": "Completed",
        "assigned_date": "2024-01-10",
        "completed_date": "2024-01-15"
      }
    ],
    "analytics": {
      "by_month": [...],
      "by_type": [...]
    }
  }
}
```

### 7.2 Upload LAE File

**Endpoint:** `POST /lae/upload.php`

**Proxy Query:** `?action=upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | XLSX file with assignments |

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "records_processed": 50,
    "records_created": 45,
    "records_updated": 5,
    "errors": []
  }
}
```

### 7.3 Download LAE Report

**Endpoint:** `GET /lae/download.php`

**Proxy Query:** `?action=download`

**Response:** Binary XLSX file

---

## 8. Profile Leads

**Proxy:** `school-profile-proxy`

### 8.1 Get Lead Statistics

**Endpoint:** `GET /school-profile/leads.php?action=get_stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_leads": 1250,
    "new_leads_7_days": 45,
    "active_leads": 890,
    "engaged_leads": 340
  }
}
```

### 8.2 Get Programs (for filtering)

**Endpoint:** `GET /school-profile/leads.php?action=get_programs`

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "MBA Full-Time" },
    { "id": "2", "name": "MBA Part-Time" }
  ]
}
```

### 8.3 Get Countries (for filtering)

**Endpoint:** `GET /school-profile/leads.php?action=get_countries`

**Response:**
```json
{
  "success": true,
  "data": [
    { "key": "NG", "value": "Nigeria" },
    { "key": "KE", "value": "Kenya" }
  ]
}
```

### 8.4 List Leads

**Endpoint:** `GET /school-profile/leads.php?action=get_leads`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `program_id` | string | Filter by program |
| `country` | string | Filter by country code |
| `start_date` | string | Filter from date (YYYY-MM-DD) |
| `end_date` | string | Filter to date (YYYY-MM-DD) |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "country_of_residence": "234",
        "country_name": "Nigeria",
        "intended_pg_program_start_year": "2025",
        "intended_study_level": "Masters",
        "intended_subject_area": "Business & Management",
        "page_views": 15,
        "registration_date": "2024-01-15T10:30:00Z",
        "last_activity": "2024-02-01T14:20:00Z",
        "programs_viewed": "MBA Full-Time, EMBA"
      }
    ],
    "meta": {
      "total": 1250,
      "page": 1,
      "limit": 20,
      "total_pages": 63
    }
  }
}
```

---

## 9. School Profile

**Proxy:** `school-profile-proxy`

**Authentication Note:** The JWT `portal_token` in the Authorization header identifies the school context. No explicit `school_id` parameter needed.

### 9.1 Get School Information

**Endpoint:** `GET /school-profile/info.php`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Example Business School",
    "university": "Example University",
    "about": "Description of the school...",
    "logo": "https://...",
    "banner": "school_banner_123.jpg",
    "website": "https://example.edu",
    "location": {
      "city": "New York",
      "country": "USA",
      "address": "123 Business Ave"
    },
    "contact": {
      "email": "admissions@example.edu",
      "phone": "+1234567890"
    },
    "stats": {
      "graduate_programs": 5,
      "phd_programs": 2,
      "international_students": 45,
      "average_salary": "150000",
      "scholarship_amount": "3000000"
    },
    "accreditations": ["AACSB", "EQUIS", "AMBA"],
    "school_brochure_link": "https://..."
  }
}
```

### 9.2 Update School Information

**Endpoint:** `POST /school-profile/info.php`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `about` | string | School description |
| `graduate_programs` | number | Number of graduate programs |
| `phd_programs` | number | Number of PhD programs |
| `international_students` | number | International student percentage |
| `average_salary` | string | Average salary |
| `scholarship_amount` | string | Total scholarship amount |
| `school_brochure_link` | string | Brochure URL |
| `imageUpload` | File | Banner image file |

### 9.3 Get School FAQs

**Endpoint:** `GET /school-profile/faqs.php`

### 9.4 Update School FAQs

**Endpoint:** `POST /school-profile/faqs.php`

**Request Body:**
```json
{
  "faqs": [
    {
      "id": "1",
      "question": "Question text?",
      "answer": "Answer text...",
      "category": "Admissions",
      "order": 1
    }
  ]
}
```

### 9.5 Get Social Media Links

**Endpoint:** `GET /school-profile/social_media.php`

### 9.6 Update Social Media Links

**Endpoint:** `POST /school-profile/social_media.php`

**Request Body:**
```json
{
  "linkedin": "https://linkedin.com/school/example",
  "twitter": "https://twitter.com/example",
  "facebook": "https://facebook.com/example",
  "instagram": "https://instagram.com/example",
  "youtube": "https://youtube.com/example"
}
```

---

## 10. Programs Management

**Proxy:** `programs-proxy`

**UI Structure:** Multi-section form with 10 sub-sections: Core Details, Highlights, Faculty, Students, Alumni, Rankings, Recruiters, Job Roles, FAQs, and POCs.

### 10.1 List Programs

**Endpoint:** `GET /school-profile/programs/?action=list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "MBA Full-Time",
      "degree_type": "MBA",
      "duration": "2 years",
      "format": "Full-Time",
      "tuition": "80000",
      "currency": "USD",
      "start_date": "September",
      "status": "Active"
    }
  ]
}
```

### 10.2 Get Program Details

**Endpoint:** `GET /school-profile/programs/?action=details&program_id={id}`

### 10.3 Update Program Information

**Endpoint:** `POST /school-profile/programs/update_program_information.php`

### 10.4 Add Program Highlight (USP)

**Endpoint:** `POST /school-profile/programs/add_program_usp.php`

**Request Body:**
```json
{
  "program_id": "1",
  "usp": "Global Network of 50,000+ Alumni"
}
```

### 10.5 Update Program Member (Faculty/Student/Alumni)

**Endpoint:** `POST /school-profile/programs/update_program_member.php`

**Note:** Member photos are served from `school_member_uploads/` directory.

**Request Body:**
```json
{
  "program_id": "1",
  "member_type": "faculty",
  "member_id": "10",
  "name": "Dr. John Smith",
  "title": "Professor of Finance",
  "bio": "...",
  "image": "..."
}
```

### 10.6 Update Program Rankings

**Endpoint:** `POST /school-profile/programs/update_program_rankings.php`

**Note:** Rankings read.php provides both current data and the organization list (735+ items). Rankings require year/org normalization.

### 10.7 Update Program Recruiters (Batch)

**Endpoint:** `POST /school-profile/programs/update_program_recruiters.php`

**Note:** Sends the entire list as string array, replacing all existing items.

**Request Body:**
```json
{
  "program_id": "1",
  "recruiters": ["Google", "McKinsey", "Goldman Sachs"]
}
```

### 10.8 Update Program Job Roles (Batch)

**Endpoint:** `POST /school-profile/programs/update_program_job_roles.php`

**Note:** Sends the entire list as string array, replacing all existing items.

### 10.9 Update Program FAQs (Batch)

**Endpoint:** `POST /school-profile/programs/update_program_faqs.php`

**Note:** Sends the entire list as objects, replacing all existing items.

### 10.10 Update Program POCs

**Endpoint:** `POST /school-profile/programs/update_program_poc.php`

---

## 11. Team Management

**Proxy:** `users-proxy`

### 11.1 List Team Members

**Endpoint:** `GET /users/?action=list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.edu",
      "role": "admin",
      "status": "active",
      "last_login": "2024-02-01T10:30:00Z",
      "created_at": "2023-01-15T09:00:00Z"
    }
  ]
}
```

### 11.2 Invite Team Member

**Endpoint:** `POST /users/?action=invite`

**Request Body:**
```json
{
  "email": "newuser@example.edu",
  "role": "representative",
  "name": "New User"
}
```

### 11.3 Update Team Member Role

**Endpoint:** `POST /users/?action=update_role`

### 11.4 Remove Team Member

**Endpoint:** `POST /users/?action=remove`

---

## 12. AI Visa Tutor

**Proxy:** `visa-tutor-proxy`

**Config:** `verify_jwt = false` in `supabase/config.toml` (proxy handles its own JWT verification)

**Table Features:** 18 columns including License Number, Alloted to, Created Date, Assigned To (sub_partner_id), Student Name, Contact Details, Target Degree, Visa App Type, and various activation/usage metrics. "Test Attempted" and "View" columns are sticky at the right side.

### 12.1 List Licenses

**Endpoint:** `GET /visa-tutor/`

**Response Structure:** Data is nested under `data.data.licenses` and `data.data.pagination`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": {
      "licenses": [
        {
          "id": "1",
          "license_number": "VT-2024-001",
          "alloted_to": "Example Business School",
          "created_date": "2024-01-15",
          "sub_partner_id": "partner_123",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com",
          "mobile": "+234123456789",
          "target_degree": "Masters",
          "visa_app_type": "F-1",
          "activation_status": "Active",
          "activation_date": "2024-01-20",
          "sessions_completed": 3,
          "usage_expiry_date": "2024-07-20",
          "usage_status": "Active",
          "usage_start_date": "2024-01-20",
          "test_attempted": 3
        }
      ],
      "pagination": {
        "total": 50,
        "page": 1,
        "limit": 20,
        "total_pages": 3
      }
    }
  }
}
```

### 12.2 Get License Details

**Endpoint:** `GET /visa-tutor/details.php?id={license_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "license": {
      "id": "1",
      "license_number": "VT-2024-001",
      "student": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+234123456789",
        "nationality": "Nigeria"
      },
      "program": {
        "degree": "Masters",
        "university": "Example University",
        "country": "USA"
      },
      "visa": {
        "type": "F-1",
        "interview_date": "2024-03-15",
        "consulate": "Lagos"
      }
    },
    "sessions": [...]
  }
}
```

### 12.3 Reassign License

**Endpoint:** `POST /visa-tutor/reassign.php`

**Frontend Processing:**
- Name field: First word → `first_name`, remaining words → `last_name`
- All fields are `.trim()`ed before sending

**Request Body:**
```json
{
  "license_id": "1",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile": "+234123456789",
  "target_degree": "Masters"
}
```

### 12.4 Bulk Upload Licenses

**Endpoint:** `POST /visa-tutor/bulk-upload.php`

**Content-Type:** `multipart/form-data`

**Response:**
```json
{
  "success": true,
  "message": "Bulk upload successful",
  "data": {
    "total_records": 25,
    "created": 20,
    "updated": 3,
    "errors": [
      {
        "row": 5,
        "error": "Invalid email format"
      }
    ]
  }
}
```

---

## 13. Secure Report Download

**Public Portal Routes:** `/reports/` and `/mreports/`

### 13.1 Get Report Metadata

**Endpoint:** `GET /report_info.php?id={hash_id}`

**Note:** Virtual event data is nested under `data.0`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "Business School Festival Lagos 2024",
    "event_date": "2024-03-15",
    "venue": "Lagos, Nigeria",
    "type": "bsf",
    "in_person_event_type_id": "B001"
  }
}
```

### 13.2 Verify Credentials

**Endpoint:** `POST /report_verify.php`

**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `hash_id` | string | Report hash ID |
| `report_type` | string | Type of report |
| `email` | string | User email |
| `password` | string | User password |
| `event_type` | string | (Virtual only) `masterclass` or `meetup` |

**Error Codes:**
- `FORBIDDEN` - Access denied
- `UNAUTHORIZED` / `INVALID_CREDENTIALS` - Credential mismatch

### 13.3 Download Report

**In-Person Events:** `GET /in-person-event/report_download.php?id={hash_id}`

**Virtual Events:** `GET /virtual-event/report_download.php?id={hash_id}&event_type={type}`

**Routing Logic:** Use `in-person-event/report_download.php` if `in_person_event_type_id` is present (e.g., B001, B002, B004), otherwise use `virtual-event/report_download.php`.

**Response:** Binary XLSX file with content-disposition-based filename

---

## Error Handling

All endpoints return consistent error responses:

**Client Error (4xx):**
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

**Server Error (5xx):**
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Safe JSON Parsing

All Edge Function proxies implement safe-parsing:
1. Read `response.text()` from upstream
2. Attempt `JSON.parse()` in try-catch
3. If non-JSON (e.g., HTML from WAF), return 502 with diagnostic info

---

## Rate Limiting

- **Standard endpoints:** 100 requests per minute
- **Report downloads:** 10 requests per minute
- **Bulk uploads:** 5 requests per minute

---

## Pagination

Paginated endpoints accept these query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |

Paginated responses include:

```json
{
  "meta": {
    "total": 250,
    "page": 1,
    "limit": 20,
    "total_pages": 13
  }
}
```

---

## File Downloads

Binary file downloads (XLSX, PDF) include these headers:

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="report_name.xlsx"
```

Handle these responses as binary data, not JSON.

---

## Proxy Architecture

All API requests from the frontend are routed through Supabase Edge Functions:

| Proxy Function | Backend Endpoint | JWT Verify |
|----------------|------------------|------------|
| `portal-auth` | `/login.php` | `false` |
| `bsf-proxy` | `/in-person-event/bsf` | `true` |
| `campus-tour-proxy` | `/in-person-event/campus-tour/` | `true` |
| `virtual-events-proxy` | `/virtual-event/` | `true` |
| `icr-proxy` | `/in-country-representation/` | `true` |
| `scholarship-proxy` | `/scholarship/` | `true` |
| `applications-proxy` | `/admissions/` | `true` |
| `lae-proxy` | `/lae/` | `false` |
| `school-profile-proxy` | `/school-profile/` | `true` |
| `programs-proxy` | `/school-profile/programs/` | `true` |
| `users-proxy` | `/users/` | `false` |
| `visa-tutor-proxy` | `/visa-tutor/` | `false` |

**Configured in `supabase/config.toml`:**
```toml
[functions.users-proxy]
verify_jwt = false

[functions.portal-auth]
verify_jwt = false

[functions.lae-proxy]
verify_jwt = false

[functions.visa-tutor-proxy]
verify_jwt = false
```

This architecture handles:
- CORS preflight requests
- Secure JWT forwarding (prioritizes `portal_token`)
- Error normalization (safe JSON parsing)
- Binary file streaming for report downloads
- Multipart/form-data forwarding for file uploads
