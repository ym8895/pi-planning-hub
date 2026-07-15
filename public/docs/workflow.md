# PI Planning Hub - Workflow Guide

## 1. Overview

This document describes the end-to-end workflow for running a PI (Program Increment) Planning event using PI Planning Hub. The workflow follows SAFe® best practices and covers the complete PI lifecycle.

## 2. PI Planning Lifecycle

### 2.1 Phase Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Pre-PI     │───▶│  PI         │───▶│  Execution  │───▶│  Inspect &  │
│  Planning   │    │  Planning   │    │             │    │  Adapt      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                   │                   │                   │
     ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│• Create PI  │    │• Day 1-2    │    │• Sprint     │    │• Retros     │
│• Seed data  │    │• Vision     │    │• Standups   │    │• Metrics    │
│• Capacity   │    │• Features   │    │• Dailies    │    │• Next PI    │
│• Backlog    │    │• Dependencies│   │• Updates    │    │             │
└─────────────┘    │• Risks      │    └─────────────┘    └─────────────┘
                   │• Commitment │
                   └─────────────┘
```

## 3. Detailed Workflow

### 3.1 Pre-PI Planning (1-2 weeks before)

#### Step 1: Create Program Increment
1. Navigate to **PI Management** page
2. Click **Create PI**
3. Enter PI name (e.g., "PI 3 - Q2 2026")
4. Set start and end dates (typically 8-12 weeks)
5. System auto-creates 5 sprints + 1 IP iteration
6. Status: **PLANNING**

#### Step 2: Prepare Backlog
1. Go to **Backlog** page
2. Create or import Features
3. For each Feature:
   - Set Business Value (1-10)
   - Set Time Criticality (1-10)
   - Set Risk Reduction (1-10)
   - Set Job Size (1-10)
   - System calculates WSJF score automatically
4. Set Feature Type: **Business** or **Enabler**
5. Assign owner team (optional)

#### Step 3: Set Team Capacity
1. Navigate to **Capacity** page
2. For each team and sprint:
   - Set Planned Points (based on velocity)
   - Adjust Focus Factor (default 80%)
   - Set Support % (time for bugs/support)
   - System calculates utilization

### 3.2 PI Planning Event (Day 1-2)

#### Day 1: Business Context & Vision

**Morning Session (RTE Facilitates)**
1. Present business context and vision
2. Review PI objectives and metrics
3. Current PI status review

**Afternoon: Team Breakouts**
1. Teams go to **Program Board**
2. Drag features to team lanes
3. Assign features to sprints
4. Create stories within features
5. Set story points

#### Day 2: Planning & Estimation

**Morning: Team Breakouts Continue**
1. Complete feature placement
2. Identify **Dependencies** between teams
3. Create dependency links on board
4. Review **Capacity** vs commitment

**Afternoon: Risk & Commitment**

**Risk Assessment**
1. Go to **Risks** page
2. Create risks using ROAM method:
   - **R**esolved: Risk is addressed
   - **O**wned: Someone owns mitigation
   - **A**ccepted: We acknowledge the risk
   - **M**itigated: We have a mitigation plan
3. Assign risk owner
4. Set impact and probability

**Confidence Vote**
1. Navigate to **Confidence** page
2. Each team votes (1-5 scale):
   - 1-2: Major concerns, need to revisit
   - 3: Moderate concerns, can proceed
   - 4-5: High confidence, ready to commit
3. If average < 3, revisit planning
4. Document any action items

### 3.3 PI Execution (8-12 weeks)

#### Sprint Cycle

```
┌─────────────────────────────────────────────────────────────┐
│  Sprint Planning → Daily Standups → Sprint Review → Retro  │
│       │                │               │            │       │
│       ▼                ▼               ▼            ▼       │
│  ┌─────────┐    ┌──────────┐    ┌─────────┐   ┌────────┐  │
│  │ Select  │    │ Update   │    │ Demo    │   │ Improve│  │
│  │ Stories │    │ Board    │    │ Done    │   │ Process│  │
│  └─────────┘    └──────────┘    └─────────┘   └────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Daily Activities

1. **Update Program Board**
   - Move stories: TODO → DOING → DONE
   - Mark blocked items
   - Update story points

2. **Track Dependencies**
   - Monitor dependency status
   - Resolve blockers
   - Update dependency status

3. **Monitor Capacity**
   - Track velocity per team
   - Adjust sprint scope if needed
   - Review utilization metrics

### 3.4 Inspect & Adapt (End of PI)

#### Step 1: Review Metrics
1. Go to **Charts** page
2. Review Velocity trends
3. Analyze Burndown/Burnup charts
4. Check Predictability scores
5. Review Cumulative Flow

#### Step 2: Team Retrospectives
1. What went well?
2. What could improve?
3. Action items for next PI

#### Step 3: Complete PI
1. Navigate to **PI Management**
2. Click **Complete PI**
3. Status changes to **COMPLETED**
4. Create next PI for continuation

## 4. Role-Specific Workflows

### 4.1 Release Train Engineer (RTE)

**Daily:**
- Review dashboard metrics
- Check dependency status
- Monitor risk register
- Facilitate scrum-of-scrums

**Weekly:**
- Review velocity trends
- Update stakeholders
- Manage escalations

**PI End:**
- Facilitate I&A
- Complete PI
- Plan next PI

### 4.2 Scrum Master (SM)

**Daily:**
- Team board updates
- Remove blockers
- Facilitate standups

**Sprint:**
- Capacity planning
- Velocity tracking
- Team health checks

### 4.3 Product Owner (PO)

**Daily:**
- Backlog prioritization
- Feature refinement
- Acceptance criteria review

**Sprint:**
- Sprint planning input
- Story acceptance
- Business value assessment

### 4.4 Development Team

**Daily:**
- Update story status
- Log time/points
- Flag blockers

**Sprint:**
- Estimation
- Code reviews
- Testing

## 5. Key Metrics Dashboard

### 5.1 Delivery Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **PI Progress** | 100% | % of sprints completed |
| **Predictability** | ≥80% | Done / Committed ratio |
| **Velocity** | Team avg | Story points per sprint |
| **Feature Throughput** | Increasing | Features completed per PI |

### 5.2 Quality Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Defect Rate** | <5% | Stories with defects |
| **Blocker Resolution** | <2 days | Time to resolve blockers |
| **Dependency Health** | 90%+ | On-time resolution rate |

### 5.3 Team Health

| Metric | Target | Description |
|--------|--------|-------------|
| **Confidence Vote** | ≥3.5 | Average team confidence |
| **Capacity Utilization** | 80-90% | Sustainable pace |
| **Risk Burn-down** | Decreasing | Risks being mitigated |

## 6. Best Practices

### 6.1 Planning
- ✅ Keep features small (1-2 sprints)
- ✅ Break features into stories (3-5 days each)
- ✅ Identify dependencies early
- ✅ Be realistic about capacity
- ✅ Include buffer for unknowns

### 6.2 Execution
- ✅ Update board daily
- ✅ Address blockers immediately
- ✅ Communicate dependency delays
- ✅ Adjust scope if needed
- ✅ Track actual vs planned

### 6.3 Continuous Improvement
- ✅ Conduct retrospectives
- ✅ Act on feedback
- ✅ Celebrate wins
- ✅ Document lessons learned
- ✅ Refine estimation process

## 7. Integration Points

### 7.1 External Systems (Future)

| System | Integration | Purpose |
|--------|-------------|---------|
| **Jira** | Bi-directional sync | Story/Feature sync |
| **Azure DevOps** | REST API | Work item tracking |
| **Slack** | Webhooks | Notifications |
| **Confluence** | Export | Documentation |
| **Teams** | Integration | Collaboration |

## 8. Troubleshooting

### Common Issues

| Issue | Resolution |
|-------|------------|
| Board not updating | Refresh page, check API |
| DnD not working | Verify story assignment |
| Charts not showing | Check PI selection |
| Capacity incorrect | Verify sprint dates |
| Dependencies missing | Check team assignments |

## 9. Support

- **Documentation**: This guide + Architecture doc
- **API Reference**: Check `/api/*` endpoints
- **Database**: Prisma schema in `prisma/schema.prisma`
- **Issues**: Report via project repository
