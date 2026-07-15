# SAFe 6.0 Product Owner / Product Manager Workbook

## Overview

This workbook is the essential companion for SAFe PO/PM certification and day-to-day practice. It covers the core responsibilities of Product Owners and Product Managers within the Scaled Agile Framework.

---

## Part 1: The SAFe Product Manager / Product Owner Role

### Key Responsibilities
- **Define the Vision** — Communicate a compelling product vision aligned with enterprise strategy
- **Prioritize the Program Backlog** — Use WSJF (Weighted Shortest Job First) to sequence features
- **Own the Roadmap** — Maintain and communicate the product roadmap across PIs
- **Accept Features** — Verify that features meet acceptance criteria before PI boundary
- **Stakeholder Management** — Engage with business owners, users, and teams

### PO vs PM Distinction
| Aspect | Product Manager | Product Owner |
|--------|----------------|---------------|
| Focus | Market & customer needs | Team-level backlog |
| Scope | Program level | Team level |
| Backlog | Program Backlog | Team Backlog |
| Authority | Strategic direction | Tactical execution |
| Stakeholders | Business owners, customers | Dev team, scrum master |

---

## Part 2: PI Planning

### Day 1 Activities
1. **Business Context** — Leadership presents vision, priorities, and top PI objectives
2. **Product/Solution Vision** — PM presents current and future state of the solution
3. **Architecture Vision & Development Practices** — ARCH presents technical guidance
4. **Planning Context & Lunch** — Teams form and begin team-building
5. **Team Breakout #1** — Teams estimate capacity, create stories, identify risks

### Day 2 Activities
1. **Confidence Vote** — Teams vote 1-5 on ability to achieve PI objectives
2. **Team Breakout #2** — Refine plans based on dependencies and feedback
3. **Program Risks** — Discuss and resolve ROAM'd risks (Resolved, Owned, Accepted, Mitigated)
4. **Draft Plan Review** — Each team presents their plan
5. **Final Plan Review & Lunch**
6. **Planning Retrospective & Moving Forward**

### Planning Metrics
- **Team Velocity** — Historical throughput baseline
- **Capacity** — Available hours minus holidays, meetings, support overhead
- **Focus Factor** — Percentage of time spent on planned work (typically 70-80%)
- **Story Points** — Relative estimation of effort

---

## Part 3: WSJF (Weighted Shortest Job First)

### Formula
```
WSJF = Cost of Delay / Job Size
```

### Cost of Delay Components
- **User/Business Value** — How much value does this deliver? (1-10)
- **Time Criticality** — How time-sensitive is this? (1-10)
- **Risk Reduction / Opportunity Enablement** — Does this reduce risk or enable opportunities? (1-10)

### Job Size
- **Job Size** — Relative estimate of effort (1-10 Fibonacci-like scale)
- Smaller number = less effort = higher priority

### Prioritization Process
1. Score each feature on BV, TC, RR/ OE (1-10 each)
2. Calculate Cost of Delay = BV + TC + RR/OE
3. Divide by Job Size to get WSJF
4. Rank features by WSJF descending

---

## Part 4: Features and Stories

### Feature Template
- **Name** — Short, descriptive name
- **Description** — What the feature does
- **Benefit Hypothesis** — Expected business outcome
- **Acceptance Criteria** — Testable conditions for completion
- **Priority** — Must Have / Should Have / Could Have / Won't Have (MoSCoW)
- **Status** — BACKLOG → REFINING → PLANNED → IN PROGRESS → DONE

### Story Writing Best Practices
- Use **INVEST** criteria: Independent, Negotiable, Valuable, Estimable, Small, Testable
- Follow **Role-Action-Benefit** format: "As a [role], I want [action], so that [benefit]"
- Keep stories small enough to complete within a single iteration
- Define clear **Definition of Ready** and **Definition of Done**

### Story Splitting Patterns
- By workflow step
- By data type
- By interface
- By operations (CRUD)
- By business rules
- By platform/device

---

## Part 5: PI Objectives

### Types
- **Committed Objectives** — Negotiated with management, high confidence of achievement
- **Stretch Objectives** — Aspirational goals beyond committed scope

### Business Value
- Assigned by Business Owners on a 1-10 scale
- Measured after PI completion
- Used to calculate **Program Predictability Measure**

### Program Predictability
```
Predictability = (Achieved Business Value / Planned Business Value) × 100%
```
- Target: 80-100% predictability
- Below 60% indicates systemic issues

---

## Part 6: ROAM Risk Management

| Category | Action |
|----------|--------|
| **Resolved** | Risk is no longer a concern |
| **Owned** | Someone takes responsibility for mitigation |
| **Accepted** | Risk is acknowledged, no mitigation planned |
| **Mitigated** | Action plan in place to reduce impact/probability |

---

## Part 7: Inspect and Adapt (I&A)

### Three Segments
1. **PI System Demo** — Show the increment to stakeholders
2. **Quantitative and Qualitative Measurement** — Review PI objectives, predictability, metrics
3. **Problem-Solving Workshop** — Identify root causes and create improvement actions

### Improvement Kata
1. What is the target condition?
2. What is the actual condition now?
3. What obstacles prevent you from reaching the target?
4. What is your next step? (PDCA cycle)

---

## Key Metrics Reference

| Metric | Description | Target |
|--------|-------------|--------|
| **Velocity** | Story points completed per iteration | Stable/increasing |
| **Predictability** | Achieved vs planned business value | 80-100% |
| **Lead Time** | Time from idea to deployment | Decreasing |
| **Cycle Time** | Time from start to done | Decreasing |
| **Defect Rate** | Bugs per feature/story | Decreasing |
| **Team Happiness** | Anonymous team survey score | 4+/5 |
| **PI Capacity** | Available story points per PI | Planned accurately |

---

## SAFe 6.0 Core Values

1. **Alignment** — Everyone understands the mission and their role
2. **Transparency** — All work and progress is visible
3. **Respect for People** — Empower teams, foster psychological safety
4. **Reliability** — Deliver on commitments consistently

---

## SAFe 7.0 Considerations

- **Business Agility** — Extend beyond IT to entire enterprise
- **Continuous Learning Culture** — Embedded in every PI
- **Lean Portfolio Management** — Strategic themes drive investment
- **Customer Centricity** — Design thinking integrated into SAFe
