# Demo Rehearsal Fixes and 3-Slide Deck

This document captures the finalized rehearsal fixes and the 1-minute slide section for the Threat Intelligence Platform presentation.

## Rehearsal Issues Fixed

- Reduced scope to one crisp narrative: login, triage, risk context, dashboards, and analytics.
- Standardized live flow to avoid hesitation between screens.
- Added fallback narration when AI recommendations are temporarily unavailable.
- Removed non-essential clicks and typing to prevent dead air.
- Added time-boxed script to keep the whole delivery on schedule.

## Slide Plan (1 Minute Total)

## Slide 1: Problem (20 seconds)

### Title
Security Teams Struggle to Prioritize Threat Data

### Slide bullets
- Threat indicators are scattered across tools and formats.
- Analysts spend too much time on manual triage and tracking.
- Lack of fast trend visibility delays incident response.

### Speaker notes (20s)
Security teams receive high volumes of threat indicators, but triage is often fragmented and manual. Without a single workflow and clear risk visibility, high-priority threats can be delayed or missed.

## Slide 2: Architecture (20 seconds)

### Title
Threat Intelligence Platform Architecture

### Slide bullets
- Frontend (React + TypeScript): login, indicator workflows, dashboards, analytics.
- Backend (Spring Boot): threat indicator CRUD, filtering, stats, export and upload APIs.
- AI Service (Python): recommendation support for analyst decision-making.
- Seeded dataset: realistic indicators available immediately for demos.

### Speaker notes (20s)
The platform uses a React frontend for analyst workflows, a Spring Boot backend for core threat operations, and a Python AI service for recommendations. Seeded data ensures the product is demo-ready with meaningful insights.

## Slide 3: Demo Flow (20 seconds)

### Title
90-Second Demo Flow

### Slide bullets
1. Login to protected workspace.
2. Indicator list with search, filters, and quick edit.
3. Indicator detail with risk score and context.
4. Dashboard KPI snapshot.
5. Analytics trends with 7, 30, and 90 day windows.

### Speaker notes (20s)
In the demo, we follow the full analyst journey: secure login, fast triage on the indicator list, deep context in detail view, and then executive and analyst insights through dashboard and analytics.

## Transition Line to Live Demo

Now I will show this complete flow live in 90 seconds.
