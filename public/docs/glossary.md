# SAFe & PI Planning — Glossary

## Agile Release Train (ART)

A long-lived team of Agile teams (50-125 people) that develops and delivers solutions incrementally. Each ART has a fixed cadence and synchronizes planning, execution, and delivery.

- **Teams** — 5-12 Agile teams per ART, each with a dedicated Product Owner
- **RTE** — Release Train Engineer, the "chief scrum master" who facilitates ART events
- **Cadence** — Fixed timebox (usually 8-12 weeks) for PI execution
- **Sync** — All teams plan, demo, and retrospective together

---

## Program Increment (PI)

A timebox during which an ART delivers incremental value. Typically 8-12 weeks (5 sprints + 1 Inspect & Adapt sprint). The PI is the fundamental planning and execution unit in SAFe.

- **PI Planning** — 2-day event where the entire ART plans the next PI together
- **Inspect & Adapt (I&A)** — Final sprint of the PI: demo, retrospective, and improvement planning
- **Innovation & Planning (IP)** — Dedicated sprint for innovation, technical debt, and PI planning
- **PI Objectives** — Business goals the ART commits to achieving during the PI

---

## PI Planning Events (Day-by-Day)

**Day 1 Morning — Business Context**
Vision, strategic themes, and top 10 features presented by business owners

**Day 1 — Team Breakout #1**
Teams estimate stories, identify risks, and build draft PI plans

**Day 1 Evening — Management Review**
ART-level review of draft plans, dependencies, and resource conflicts

**Day 2 — Team Breakout #2**
Teams finalize plans, adjust based on management feedback

**Day 2 — Final Plan Review & Confidence Vote**
Each team presents, followed by a 1-5 fist-of-five confidence vote

**Day 2 — Planning Retrospective**
What went well, what to improve, and celebration

---

## Backlog Items

- **Epic** — Large initiative spanning multiple PIs, requires ART-level or Solution-level coordination
- **Feature** — Medium-sized deliverable fitting within a single PI; the primary backlog item for PI Planning
- **Enabler** — Technical work (infrastructure, refactoring, research) that supports future business features
- **Story** — Small deliverable completed within a single sprint by a single team
- **Capability** — Larger feature-sized item requiring multiple teams within an ART
- **Technical Debt** — Accumulated shortcuts or legacy code that slows future development; tracked as Enablers

---

## WSJF — Weighted Shortest Job First

SAFe's prioritization model. Features with the highest WSJF score should be built first to maximize economic benefit.

`WSJF = Cost of Delay / Job Size`

- **Cost of Delay** = User-Business Value + Time Criticality + Risk Reduction/Opportunity Enablement
- **Job Size** = Estimated effort (1, 2, 3, 5, 8, 13 scale) — smaller = faster to implement

---

## Key Metrics

- **Velocity** — Story points completed per sprint; used for capacity planning and forecasting
- **Predictability** — % of planned objectives achieved (aim for 80-100%)
- **Load Factor** — Planned capacity / available capacity; should be 80-85% to allow for unknowns
- **Utilization** — Planned hours / available hours per sprint; >100% = overloaded
- **Feature Throughput** — Number of features completed per PI; tracks ART productivity
- **Cycle Time** — Time from story start to done; shorter = better flow

---

## Roles

- **Product Owner (PO)** — Owns team backlog, writes stories, prioritizes work, accepts completed stories
- **Product Manager (PM)** — Owns ART-level backlog (Features), defines vision, manages stakeholders
- **Scrum Master / Team Coach** — Facilitates team processes, removes impediments, coaches on Agile practices
- **Release Train Engineer (RTE)** — Chief Scrum Master for the ART; facilitates PI Planning and ART events
- **Business Owner** — Key stakeholder with budget authority; participates in PI Planning
- **System Architect / Engineering Lead** — Defines architecture runway, guides technical decisions across the ART

---

## ART Events & Ceremonies

- **PI Planning** — 2-day event, every PI cadence; the cornerstone of SAFe
- **Inspect & Adapt (I&A)** — PI-closing event: demo, retrospective, improvement items
- **System Demo** — Bi-weekly or per-sprint demo of integrated work from all teams
- **ART Sync** — Weekly sync meeting across team scrum masters and POs
- **Iteration Planning** — Team-level sprint planning, happens every sprint
- **Backlog Refinement** — Ongoing grooming of stories with estimates and acceptance criteria
- **Scrum of Scrums (SoS)** — Cross-team sync to identify dependencies and impediments

---

## Dependencies & Risks

- **Dependency** — Work that one team needs from another before it can proceed
- **FS (Finish-Start)** — Team B cannot start until Team A finishes
- **FF (Finish-Finish)** — Team B cannot finish until Team A finishes
- **ROAM** — Risk classification: Resolved, Owned, Accepted, Mitigated
- **Impediment** — Blocker preventing a team from progressing

---

## Story Status Flow

`TODO → DOING → DONE` (with BLOCKED as an exception state)

- **TODO** — Committed but not yet started
- **DOING** — Actively being worked on
- **DONE** — Completed and accepted by PO
- **BLOCKED** — Cannot proceed due to dependency, risk, or external factor

---

## Feature Status Flow

`BACKLOG → REFINING → PLANNED → IN_PROGRESS → DONE`

- **BACKLOG** — Identified but not yet refined
- **REFINING** — Being broken down into stories with estimates
- **PLANNED** — Committed for current or upcoming PI
- **IN_PROGRESS** — Actively being worked on by one or more teams
- **DONE** — Delivered and accepted

---

## Capacity Planning

- **Focus Factor** — % of time developers spend on sprint work (typically 70-80%)
- **Support %** — Time allocated to production support
- **Meetings %** — Time allocated to meetings and ceremonies
- **Available Hours** — Total productive hours per sprint (after focus factor, support, meetings)
- **Planned Hours** — Hours allocated to story work in the sprint
- **Overloaded** — When planned hours exceed available hours (>100% utilization)
