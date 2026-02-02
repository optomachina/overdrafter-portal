# Overdrafter Portal Roadmap

## Current Status
- ✅ File upload with R2 storage
- ✅ Supabase database schema
- ✅ Tier-based validation
- ✅ Auto-delete for free tier

## Phase 1: MVP (This Week)

### Authentication
- [ ] Supabase magic link auth
- [ ] Protected routes middleware
- [ ] User session management

### Project Dashboard
- [ ] Project list view
- [ ] Project detail page
- [ ] File browser with metadata
- [ ] Version history sidebar

### File Management
- [ ] Download files
- [ ] Delete files
- [ ] Version rollback

## Phase 2: PDM Features

### Version Control
- [ ] Check-in / check-out workflow
- [ ] Version comparison (diff)
- [ ] Branching for design alternatives
- [ ] Tag releases ("Manufacturing ready")

### Assembly Management
- [ ] BOM (Bill of Materials) generation
- [ ] Assembly tree view
- [ ] Where-used search (find all assemblies using a part)
- [ ] Component replacement workflow

### Engineering Change Orders
- [ ] ECO creation workflow
- [ ] Approval process
- [ ] Affected items tracking
- [ ] Change notifications

## Phase 3: CAD Viewer (Future)

### ISO View Rendering ⭐ PRIORITY
- [ ] Server-side CAD rendering
- [ ] ISO view thumbnail generation
- [ ] Interactive 3D viewer (Three.js or similar)
- [ ] Section views
- [ ] Measurement tools

**Implementation Notes:**
- Option A: Use existing CAD kernel (expensive licensing)
- Option B: Convert to glTF/USDZ for web viewing
- Option C: Integrate with online CAD viewer API

### File Preview
- [ ] PDF preview
- [ ] Drawing view with dimensions
- [ ] STEP file 3D preview

## Phase 4: AI/ML Features

### Design Analysis
- [ ] DFM analysis automation
- [ ] Cost estimation from geometry
- [ ] Tolerance analysis suggestions
- [ ] Design similarity search

### Training Pipeline
- [ ] Extract features from uploaded models
- [ ] Build vector database of designs
- [ ] Train on customer design patterns
- [ ] Suggest design improvements

## Phase 5: Collaboration

### Team Features
- [ ] Multi-user projects
- [ ] Role-based permissions
- [ ] Comments on files
- [ ] Activity feed

### External Sharing
- [ ] Public share links
- [ ] Client review portal
- [ ] Watermarked previews
- [ ] Expiring access links

## Technical Debt

### Performance
- [ ] CDN for file delivery
- [ ] Image optimization
- [ ] Database query optimization
- [ ] Pagination for large file lists

### Security
- [ ] File virus scanning
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Data retention policies

### DevOps
- [ ] Staging environment
- [ ] Automated backups
- [ ] Monitoring and alerting
- [ ] Log aggregation

## Current Sprint

**Focus:** Authentication + Dashboard

1. Magic link auth
2. Project dashboard
3. File browser
4. Download/delete

**Next:** ISO view research