# PI Planning Hub - Role-Based Features Guide

## 1. Release Train Engineer (RTE)

### Purpose
The RTE is the servant leader who facilitates PI Planning, manages dependencies, and ensures the ART delivers value. They are the "CEO of the ART" — responsible for the overall health and progress of the program.

### Dashboard Display
When RTE is selected, the dashboard shows:

| Item | Value | Logic |
|------|-------|-------|
| **Open Dependencies** | 3 | `GET /api/dependencies` where `status = 'OPEN'` — RTE needs to track all unresolved cross-team dependencies |
| **Blocked Dependencies** | 1 | `GET /api/dependencies` where `status = 'BLOCKED'` — Critical blockers requiring immediate attention |
| **PI Progress** | 67% | `Math.min(piDaysElapsed, piDaysTotal) / piDaysTotal * 100` — Capped at 100% to prevent display issues |
| **Risks** | 8 | `GET /api/risks` where `piId = executingPI.id` — Full risk register for ROAM review |

### Role-Specific Logic
```
isRTE = role === "RTE"

// RTE gets full ART-level visibility
// They see all teams, all dependencies, all risks
// Dashboard items link to:
//   /dependencies → Dependency management page
//   /board → Program board for visual planning
//   /risks → ROAM board for risk assessment
```

---

## 2. Scrum Master (SM)

### Purpose
The SM coaches the team on agile practices, removes impediments, and ensures the team follows Scrum/SAFe processes. They focus on team health, velocity, and process improvement.

### Dashboard Display
When SM is selected, the dashboard shows:

| Item | Value | Logic |
|------|-------|-------|
| **Team Velocity** | 45 | `team.velocity` — Average story points completed per sprint |
| **Capacity** | 85% | `capacity.plannedPoints / capacity.availablePoints * 100` — Team utilization for current sprint |
| **Team Confidence** | 3.8 | `AVG(confidenceVotes.score)` where `teamId = user.teamId` — Team's confidence in PI objectives |
| **Blocked Stories** | 2 | `GET /api/stories` where `status = 'BLOCKED'` and `teamId = user.teamId` — Impediments to resolve |

### Role-Specific Logic
```
isSM = role === "SM"

// SM gets team-level visibility
// They see their team's metrics only
// Dashboard items link to:
//   /teams → Team management and velocity trends
//   /capacity → Sprint capacity planning
//   /confidence → Team confidence voting
//   /board → Story status updates
```

---

## 3. Product Owner (PO)

### Purpose
The PO owns the product backlog, prioritizes features based on business value, and ensures the team builds the right things. They are the voice of the customer and business stakeholders.

### Dashboard Display
When PO is selected, the dashboard shows:

| Item | Value | Logic |
|------|-------|-------|
| **Features Done** | 25 | `GET /api/features` where `status = 'DONE'` — Completed features for PI |
| **WSJF Score** | 8.5 | `(BV + TC + RR) / JS` — Weighted Shortest Job First prioritization |
| **Business Value** | 8 | `objective.businessValue` — Committed business value for PI objectives |
| **Backlog Items** | 47 | `GET /api/features` where `status = 'BACKLOG'` — Features awaiting prioritization |

### Role-Specific Logic
```
isPO = role === "PO"

// PO gets feature and backlog visibility
// They focus on prioritization and business value
// Dashboard items link to:
//   /backlog → Feature prioritization with WSJF
//   /objectives → PI objectives and business value
//   /board → Feature progress tracking
//   /analytics → Predictability metrics
```

---

## 4. Development Team (DEV)

### Purpose
Dev team members write code, create stories, and deliver working software. They focus on technical implementation, code quality, and sprint execution.

### Dashboard Display
When DEV is selected, the dashboard shows:

| Item | Value | Logic |
|------|-------|-------|
| **Stories In Progress** | 12 | `GET /api/stories` where `status = 'DOING'` and `teamId = user.teamId` — Active work items |
| **Story Points** | 34 | `SUM(story.storyPoints)` where `status = 'DONE'` and `iterationId = currentSprint` — Completed points this sprint |
| **Definition of Done** | 85% | `stories.where(dod = true).count / stories.count * 100` — Quality metric |
| **Blocked Items** | 2 | `GET /api/stories` where `status = 'BLOCKED'` — Impediments to escalate |

### Role-Specific Logic
```
isDevTeam = role === "DEV" || role === "QA"

// DEV gets story-level visibility
// They focus on execution and delivery
// Dashboard items link to:
//   /board → Update story status (TODO → DOING → DONE)
//   /backlog → View and estimate stories
//   /dependencies → Check technical dependencies
//   /teams → View team capacity
```

---

## 5. Quality Assurance (QA)

### Purpose
QA ensures software quality through testing, validates definition of done, and identifies defects early. They work closely with DEV to maintain quality standards.

### Dashboard Display
When QA is selected, the dashboard shows:

| Item | Value | Logic |
|------|-------|-------|
| **Stories to Test** | 8 | `GET /api/stories` where `status = 'DOING'` and `definitionOfDone = false` — Stories awaiting testing |
| **Defect Rate** | 5% | `stories.where(hasDefect = true).count / stories.count * 100` — Quality metric |
| **Acceptance Criteria** | 90% | `stories.where(acMet = true).count / stories.count * 100` — Requirements compliance |
| **Sprint Progress** | 75% | `stories.where(status = 'DONE').count / stories.count * 100` — Sprint completion |

### Role-Specific Logic
```
isQA = role === "QA"

// QA gets quality-focused visibility
// They focus on testing and defect tracking
// Dashboard items link to:
//   /board → Stories requiring testing
//   /backlog → Acceptance criteria review
//   /teams → Quality metrics by team
//   /analytics → Defect trends
```

---

## 6. Architect (ARCH)

### Purpose
The ARCH designs system architecture, manages technical debt, and ensures enabler features are prioritized. They focus on technical feasibility and non-functional requirements.

### Dashboard Display
When ARCH is selected, the dashboard shows:

| Item | Value | Logic |
|------|-------|-------|
| **Enabler Features** | 15 | `GET /api/features` where `featureType = 'ENABLER'` — Technical foundation work |
| **Technical Dependencies** | 4 | `GET /api/dependencies` where `type = 'CROSS_TEAM'` and `description LIKE '%technical%'` — Architecture dependencies |
| **Architecture Risks** | 3 | `GET /api/risks` where `title LIKE '%architecture%' OR title LIKE '%technical%'` — Technical risks |
| **Technical Debt** | 8 | `GET /api/features` where `name LIKE '%debt%' OR name LIKE '%refactor%'` — Debt items |

### Role-Specific Logic
```
isArch = role === "ARCH"

// ARCH gets technical visibility
// They focus on architecture and enablers
// Dashboard items link to:
//   /backlog → Enabler feature prioritization
//   /dependencies → Technical dependency management
//   /risks → Architecture risk assessment
//   /board → Technical story tracking
```

---

## 7. Product Manager (PM)

### Purpose
The PM owns the product vision, strategy, and roadmap. They align business objectives with PI objectives and ensure the ART delivers maximum business value.

### Dashboard Display
When PM is selected, the dashboard shows:

| Item | Value | Logic |
|------|-------|-------|
| **PI Objectives** | 20 | `GET /api/objectives` where `piId = executingPI.id` — Strategic objectives |
| **Business Value Delivered** | 85 | `SUM(objective.actualValue)` — Actual business value achieved |
| **Feature Throughput** | 25 | `GET /api/features` where `status = 'DONE'` — Features completed this PI |
| **Predictability** | 82% | `SUM(objective.actualValue) / SUM(objective.businessValue) * 100` — Plan vs actual |

### Role-Specific Logic
```
isPM = role === "PM"

// PM gets strategic visibility
// They focus on business value and objectives
// Dashboard items link to:
//   /objectives → PI objective tracking
//   /analytics → Predictability and velocity trends
//   /backlog → Feature prioritization
//   /pis → PI lifecycle management
```

---

## 8. Admin (ADMIN)

### Purpose
The ADMIN has full system access, manages users and configuration, and oversees all ARTs and teams. They are the system administrator.

### Dashboard Display
When ADMIN is selected, the dashboard shows:

| Item | Value | Logic |
|------|-------|-------|
| **All Teams** | 8 | `GET /api/teams` — Complete team list across all ARTs |
| **All Features** | 125 | `GET /api/features` — Full feature backlog |
| **System Health** | OK | API response times and error rates |
| **Database Stats** | 18 tables | Prisma schema model count |

### Role-Specific Logic
```
isAdmin = role === "ADMIN"

// ADMIN gets full system visibility
// They manage configuration and users
// Dashboard items link to:
//   /settings → System configuration
//   /teams → Team management
//   /pis → PI lifecycle management
//   /resources → Documentation
```

---

## Dashboard Logic Summary

### Role Detection
```typescript
const { role } = useRole()
const isRTE = role === "RTE"
const isSM = role === "SM"
const isPO = role === "PO"
const isDevTeam = role === "DEV" || role === "QA"
const isArch = role === "ARCH"
const isPM = role === "PM"
const isAdmin = role === "ADMIN"
```

### Conditional Display
```tsx
{isRTE && (
  <>
    <a href="/dependencies">Open Dependencies: {data.openDependencies}</a>
    <a href="/board">PI Progress: {piPct}%</a>
    <a href="/risks">Risks: {data.risks}</a>
  </>
)}

{isSM && (
  <>
    <a href="/teams">Team Velocity: {data.velocity}</a>
    <a href="/capacity">Capacity: {capacityPct}%</a>
    <a href="/confidence">Confidence: {avgConfidence}/5</a>
  </>
)}

{isPO && (
  <>
    <a href="/backlog">Features Done: {data.featuresDone}</a>
    <a href="/objectives">Business Value: {bv}</a>
    <a href="/board">WSJF Top: {wsjfTop}</a>
  </>
)}
```

### Navigation Links
Each role's dashboard items link to the most relevant pages:
- **RTE**: `/dependencies`, `/board`, `/risks`
- **SM**: `/teams`, `/capacity`, `/confidence`
- **PO**: `/backlog`, `/objectives`, `/board`
- **DEV**: `/board`, `/backlog`, `/dependencies`
- **QA**: `/board`, `/backlog`, `/teams`
- **ARCH**: `/backlog`, `/dependencies`, `/risks`
- **PM**: `/objectives`, `/analytics`, `/pis`
- **ADMIN**: `/settings`, `/teams`, `/resources`

---

## Back-to-Dashboard Links

Every sub-page includes a "← Back to Dashboard" link at the top, allowing users to quickly return to their role-specific dashboard after viewing details.

```tsx
<a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
  ← Back to Dashboard
</a>
```
