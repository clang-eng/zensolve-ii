# ZenSolve
## Citizen Complaint Management System
### End-to-End Development Documentation

**Version:** 1.0  
**Date:** February 16, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Database Schema](#4-database-schema)
5. [API Specifications](#5-api-specifications)
6. [Feature Specifications](#6-feature-specifications)
7. [User Workflows](#7-user-workflows)
8. [Security & Authentication](#8-security--authentication)
9. [Deployment Strategy](#9-deployment-strategy)
10. [Testing Strategy](#10-testing-strategy)
11. [Future Enhancements](#11-future-enhancements)

---

## 1. Executive Summary

ZenSolve is a citizen-centric complaint management system designed to bridge the communication gap between citizens and government authorities. The platform introduces innovative features including community-driven transparency through proximity-based validation and a gamified reward system to encourage civic participation.

### 1.1 Problem Statement

Traditional complaint systems suffer from lack of transparency, delayed responses, and no accountability mechanism for verifying resolution quality. Citizens often feel disconnected from the resolution process and have no way to validate if issues are genuinely resolved.

### 1.2 Solution

ZenSolve addresses these challenges through:

- Proximity-based validation where nearby citizens verify resolved complaints
- Gamified reward system with redeemable points at local businesses
- Real-time tracking and transparent status updates
- Automated complaint reopening based on community feedback
- Fraud detection mechanisms to prevent system gaming

### 1.3 Target Users

- **Citizens:** Submit complaints, validate resolutions, earn rewards
- **Government Officials:** Review and manage complaints, assign to departments
- **Department Staff:** Handle assigned complaints, update status
- **Local Businesses:** Partner for reward redemption

---

## 2. System Overview

### 2.1 Key Features

#### 2.1.1 Transparency System

When a complaint is marked as resolved, citizens within a 1km radius receive notifications to validate the resolution. This proximity-based approach ensures that only affected community members participate in validation, increasing authenticity.

**Key Parameters:**
- **Radius:** 1 kilometer from complaint location
- **Validation options:** Verified Resolved, Not Resolved, Under Review
- **Photo upload capability:** Users can upload proof during validation
- **Automatic reopening:** If multiple users report unresolved status

#### 2.1.2 Reward System

Users earn points for civic engagement, fostering community participation and accountability:

| Activity | Points | Notes |
|----------|--------|-------|
| Complaint Successfully Resolved | +50 | Awarded after validation |
| Successful Validation | +30 | For verifying resolution |
| Other Reviews/Feedback | +10 | General engagement |

**Point Redemption:**
- Partner with local businesses registered on ZenSolve
- Businesses offer discounts/benefits in exchange for points
- Points do not expire but require active account status

**Badges & Leaderboards:**
- **Bronze Badge:** 100-499 points
- **Silver Badge:** 500-1499 points
- **Gold Badge:** 1500-2999 points
- **Platinum Badge:** 3000+ points
- Public leaderboards for community recognition and credibility

#### 2.1.3 Anti-Gaming Mechanisms

- Fraudulent activity detection (spam complaints, fake validations)
- Complete point forfeiture upon confirmed fraud
- Location verification to prevent fake submissions
- Photo timestamp and geolocation validation
- User reputation scoring based on validation accuracy

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Real-time) |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | Supabase Auth (Email/Password, OAuth) |
| **Storage** | Supabase Storage (Images, Documents) |
| **Maps/Location** | Google Maps API / Mapbox |
| **Notifications** | Web Push API, Email (Resend/SendGrid) |
| **Deployment** | Vercel (Frontend), Supabase Cloud (Backend) |

### 3.2 System Architecture

The system follows a modern serverless architecture with clear separation of concerns:

1. **Client Layer:** Next.js frontend with React components
2. **API Layer:** Next.js API routes and Supabase Edge Functions
3. **Data Layer:** PostgreSQL with Row Level Security (RLS)
4. **Storage Layer:** Supabase Storage for media files
5. **Real-time Layer:** Supabase Realtime for live updates

### 3.3 Application Flow

1. User accesses Next.js application via browser
2. Authentication handled by Supabase Auth
3. API requests routed through Next.js API routes
4. Database queries executed with RLS policies
5. File uploads processed through Supabase Storage
6. Real-time updates pushed via WebSocket connections
7. Geospatial queries using PostGIS extension

---

## 4. Database Schema

### 4.1 Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR | UNIQUE, NOT NULL | User email address |
| full_name | VARCHAR | NOT NULL | Full name |
| phone | VARCHAR | UNIQUE | Phone number |
| role | ENUM | DEFAULT 'citizen' | citizen, admin, department |
| points | INTEGER | DEFAULT 0 | Reward points earned |
| badge | VARCHAR | DEFAULT 'none' | Current badge level |
| location | GEOGRAPHY | | User location (Point) |
| is_banned | BOOLEAN | DEFAULT false | Fraud flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation |

### 4.2 Complaints Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique complaint ID |
| user_id | UUID | FK -> users | Complaint creator |
| title | VARCHAR | NOT NULL | Complaint title |
| description | TEXT | NOT NULL | Detailed description |
| category | VARCHAR | NOT NULL | Infrastructure, Sanitation, etc. |
| status | ENUM | DEFAULT 'submitted' | Current status |
| location | GEOGRAPHY | NOT NULL | Complaint location (Point) |
| address | TEXT | | Human-readable address |
| images | TEXT[] | | Photo URLs |
| priority | INTEGER | DEFAULT 2 | 1=High, 2=Medium, 3=Low |
| assigned_to | UUID | FK -> users | Department user assigned |
| created_at | TIMESTAMP | DEFAULT NOW() | Submission time |
| resolved_at | TIMESTAMP | | Resolution time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Status enum values:**
- submitted
- under_review
- assigned
- in_progress
- resolved
- validated
- rejected
- reopened

**Category values:**
- Infrastructure
- Sanitation
- Public Safety
- Water Supply
- Electricity
- Roads & Transport
- Parks & Recreation
- Other

### 4.3 Validations Table

Tracks citizen validations of resolved complaints within 1km radius.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Validation ID |
| complaint_id | UUID | FK -> complaints | Complaint being validated |
| validator_id | UUID | FK -> users | User validating |
| validation_type | ENUM | NOT NULL | verified, not_resolved |
| comment | TEXT | | Optional feedback |
| proof_images | TEXT[] | | Validation photo URLs |
| created_at | TIMESTAMP | DEFAULT NOW() | Validation timestamp |

**Validation Types:**
- verified
- not_resolved

### 4.4 Point Transactions Table

Maintains audit trail of all point additions and deductions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Transaction ID |
| user_id | UUID | FK -> users | User receiving/losing points |
| points_change | INTEGER | NOT NULL | Positive or negative value |
| transaction_type | ENUM | NOT NULL | Type of transaction |
| reference_id | UUID | | Links to complaint/validation |
| description | TEXT | | Transaction details |
| created_at | TIMESTAMP | DEFAULT NOW() | Transaction time |

**Transaction Types:**
- complaint_resolved
- validation
- redemption
- fraud_penalty
- manual_adjustment

### 4.5 Business Partners Table

Stores information about local businesses offering reward redemption.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Partner ID |
| business_name | VARCHAR | NOT NULL | Business name |
| contact_email | VARCHAR | | Contact email |
| contact_phone | VARCHAR | | Contact phone |
| location | GEOGRAPHY | | Business location |
| address | TEXT | | Physical address |
| offers | JSONB | | Array of redemption offers |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration date |

**Offers JSONB Structure:**
```json
[
  {
    "id": "offer_1",
    "title": "10% discount on all items",
    "points_required": 100,
    "description": "Valid on purchases above $20",
    "terms": "Cannot be combined with other offers"
  }
]
```

### 4.6 Notifications Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Notification ID |
| user_id | UUID | FK -> users | Recipient |
| type | ENUM | NOT NULL | Notification type |
| title | VARCHAR | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| reference_id | UUID | | Related complaint/validation |
| is_read | BOOLEAN | DEFAULT false | Read status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Notification Types:**
- complaint_update
- validation_request
- point_earned
- badge_unlocked
- complaint_reopened
- assignment
- system_alert

### 4.7 Status History Table

Tracks all status changes for complaints (audit trail).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | History ID |
| complaint_id | UUID | FK -> complaints | Related complaint |
| old_status | VARCHAR | | Previous status |
| new_status | VARCHAR | NOT NULL | New status |
| changed_by | UUID | FK -> users | User who made change |
| notes | TEXT | | Optional notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Change timestamp |

---

## 5. API Specifications

(...Rest of the API Specs...)

## 8. Security & Authentication

### 8.1 Authentication Strategy

- **Supabase Auth** with email/password
- JWT-based session management
- Optional OAuth providers (Google, Facebook)
- Email verification required

### 8.2 Row Level Security (RLS) Policies

#### 8.2.1 Users Table Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

#### 8.2.2 Complaints Table Policies

```sql
-- Anyone can view complaints (transparency)
CREATE POLICY "Anyone can view complaints"
ON complaints FOR SELECT
USING (true);

-- Authenticated users can create complaints
CREATE POLICY "Users can create complaints"
ON complaints FOR INSERT
WITH CHECK (auth.uid() = user_id AND NOT is_banned);

-- Users can update own complaints (before assignment)
CREATE POLICY "Users can update own complaints"
ON complaints FOR UPDATE
USING (
  auth.uid() = user_id 
  AND status = 'submitted'
);

-- Admin/Department can update assigned complaints
CREATE POLICY "Staff can update complaints"
ON complaints FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() 
    AND role IN ('admin', 'department')
  )
);
```

#### 8.2.3 Validations Table Policies

```sql
-- Users can view validations for complaints they can see
CREATE POLICY "View validations"
ON validations FOR SELECT
USING (true);

-- Users can create validations (with proximity check in application)
CREATE POLICY "Users can validate"
ON validations FOR INSERT
WITH CHECK (
  auth.uid() = validator_id 
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_banned = true
  )
);
```

#### 8.2.4 Notifications Table Policies

```sql
-- Users can only view their own notifications
CREATE POLICY "Users view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);
```

---
