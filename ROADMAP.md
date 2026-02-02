# Overdrafter Portal Roadmap

## Dashboard Architecture

### 1. Customer Dashboard (`/dashboard`)
**For: Clients uploading files, reviewing work**

**Features:**
- Project list view
- File upload & download
- Version history
- Comments/feedback on designs
- Billing & subscription management
- Download completed work

### 2. Worker Dashboard (`/overdrafter`)
**For: CAD designers doing the work**

**Features:**
- Work queue (assigned projects)
- File browser with CAD viewer
- Upload completed designs
- Time tracking per project
- Status updates (in progress → review → complete)
- Customer communication
- Earnings/deliverables tracking

### 3. Admin Dashboard (`/admin`)
**For: Blaine (business owner)**

**Features:**
- All projects overview
- Worker assignment & management
- Customer management
- Billing & payouts
- Quality control/review
- Analytics & reporting

---

## Current Status
- ✅ File upload with R2 storage
- ✅ Supabase database schema
- ✅ Magic link authentication
- ✅ Customer dashboard (basic)
- ✅ Project detail pages

## Phase 1: Core Customer Experience

### Authentication & Onboarding
- ✅ Magic link auth
- ✅ Protected routes
- [ ] Onboarding flow (collect company info)
- [ ] Subscription selection

### Customer Dashboard
- ✅ Project list
- ✅ Project detail
- ✅ File upload
- [ ] File download
- [ ] File version history
- [ ] Project comments

## Phase 2: Worker Experience

### Worker Auth
- [ ] Worker invitation system
- [ ] Worker profile (skills, availability)
- [ ] Separate worker login

### Worker Dashboard
- [ ] Work queue (assigned projects)
- [ ] Project detail with CAD viewer
- [ ] File upload for deliverables
- [ ] Status workflow (assigned → in progress → review → complete)
- [ ] Time tracking
- [ ] Customer messaging

### Assignment System
- [ ] Blaine assigns workers to projects
- [ ] Worker capacity tracking
- [ ] Skill matching (optics, sheet metal, etc.)

## Phase 3: PDM Features

### Version Control
- [ ] Check-in / check-out
- [ ] Version comparison
- [ ] Branching for alternatives
- [ ] Tag releases

### Assembly Management
- [ ] BOM generation
- [ ] Assembly tree view
- [ ] Where-used search

## Phase 4: CAD Viewer (Future)

### ISO View Rendering
- [ ] Server-side CAD rendering
- [ ] ISO view thumbnails
- [ ] Interactive 3D viewer
- [ ] Section views

**Research needed:** CAD kernel licensing vs conversion to web formats

---

## Technical Debt

### Immediate
- [ ] Worker role system
- [ ] Project assignment logic
- [ ] File download API

### Future
- [ ] CDN for file delivery
- [ ] CAD viewer integration
- [ ] Real-time collaboration