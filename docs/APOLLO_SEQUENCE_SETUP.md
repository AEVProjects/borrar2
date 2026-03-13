# Apollo Email Sequence Setup Guide

Complete guide to configure the 3-step email sequence in Apollo that matches the AI-generated emails from MSI's n8n workflow.

---

## Sequence Overview

**Service Focus:** All 3 emails promote MSI's **AI Discovery Workshop** — a 4-week engagement that delivers AI clarity and ROI projections without long-term contracts.

| Step       | Type                             | Timing           | Purpose                          | AI Field                      |
| ---------- | -------------------------------- | ---------------- | -------------------------------- | ----------------------------- |
| **Step 1** | **Automatic Email** (New Thread) | Immediately      | Intro + Discovery Workshop Value | `email1` / `subject1`         |
| **Step 2** | **Automatic Email** (Reply)      | +3 business days | Workshop ROI Proof               | `email2` (subject auto = Re:) |
| **Step 3** | **Automatic Email** (Reply)      | +3 business days | Workshop Summary + Door Open     | `email3` (subject auto = Re:) |

**Total sequence duration:** ~6 business days
**Auto-stop:** If the lead replies at any step, the sequence stops automatically.

---

## The AI Discovery Workshop (What You're Selling)

MSI's **AI Discovery Workshop** is a structured 4-week engagement that gives leaders like your leads the **clarity they need to act on AI** — without massive budget or long-term contract commitment.

### The 5 Phases

1. **Translate** (Week 1): Convert their business pain points into AI opportunities
2. **Validate** (Week 2): Assess if their data and systems are AI-ready
3. **Quantify** (Week 2): Build ROI estimates with real dollar projections
4. **Define** (Week 3): Set scope, timeline, and success metrics for the next PoC phase
5. **Align** (Week 4): Connect AI strategy to their core business objectives

### The Deliverables (What They Get)

- **AI Opportunity Map**: 3–5 prioritized use cases tailored to their business
- **Data Feasibility Report**: Definitive answer on data readiness
- **ROI Projections**: Dollar-based impact estimates for each use case
- **Technical Readiness Assessment**: Systems, compliance, and integration review
- **PoC Action Plan**: Budget, timeline, and success metrics for Phase 2

### The Value Prop (Why They Should Care)

- **Clear path to AI ROI** in just 4 weeks (vs. months of confusion)
- **No massive upfront investment**: It's a scoped engagement with measurable deliverables
- **De-risks the decision**: Data assessment + ROI projections give confidence before committing to PoC
- **Aligns AI with business**: Outcomes connect to their actual strategic objectives

---

## BEFORE YOU START — Required Changes from Current Setup

Your current Apollo sequence has these issues that need fixing:

| What                 | Current (Wrong)                                    | Should Be                                       |
| -------------------- | -------------------------------------------------- | ----------------------------------------------- |
| **Sender**           | Nataly Riano                                       | Nataly Riano                                    |
| **Apollo Signature** | ON (appends "Nataly Riano, MSI Technologies Inc.") | **OFF** — AI includes signature in body         |
| **Step 1 Subject**   | `Tech Solutions for {{FIRST_NAME}}`                | `{{personalized_subject1}}`                     |
| **Step 1 Body**      | Generic template                                   | `{{personalized_message}}`                      |
| **Step 2 Subject**   | `Re: [previous email subject line]`                | _(leave empty — Apollo adds Re: automatically)_ |
| **Step 2 Body**      | Generic template                                   | `{{personalized_followup}}`                     |
| **Step 3 Subject**   | `Re: [previous email subject line]`                | _(leave empty — Apollo adds Re: automatically)_ |
| **Step 3 Body**      | Generic template                                   | `{{personalized_email3}}`                       |

> **CRITICAL:** Disable Apollo's email signature in **Settings > Email Accounts**. The AI already generates the correct signature inside each email body (full sig for Email 1, just "Nataly" for Email 2, "Nataly Riano" for Email 3). If you leave Apollo's signature ON, there will be a DOUBLE signature.

---

## Step-by-Step Apollo Configuration

### 1. Create a New Sequence

1. Go to **Apollo > Engage > Sequences**
2. Click **+ New Sequence**
3. Name it: `MSI AI Outreach - [Batch Name]`
4. Set **Sequence Type**: "Email Only"

### 2. Configure Step 1 — Introduction Email (New Thread)

**Exact values to put in Apollo UI:**

| Apollo Field      | Exact Value to Enter        |
| ----------------- | --------------------------- |
| **Send email in** | `immediately`               |
| **Type**          | `New thread`                |
| **Subject**       | `{{personalized_subject1}}` |
| **Body**          | `{{personalized_message}}`  |

That's it — the entire Subject and Body are just the custom variable. The AI already generated the complete personalized email with greeting, body, and signature.

**DO NOT add any extra text** around the variable — no "Hey {{FIRST_NAME}}," before it, no signature after it. The variable contains the full email ready to send.

### 3. Configure Step 2 — Proof Email (Reply in Thread)

**Exact values to put in Apollo UI:**

| Apollo Field      | Exact Value to Enter                                       |
| ----------------- | ---------------------------------------------------------- |
| **Send email in** | `3 days`                                                   |
| **Type**          | `Reply`                                                    |
| **Subject**       | _(leave empty — Apollo auto-fills "Re: [Step 1 subject]")_ |
| **Body**          | `{{personalized_followup}}`                                |

### 4. Configure Step 3 — Breakup Email (Reply in Thread)

**Exact values to put in Apollo UI:**

| Apollo Field      | Exact Value to Enter                                       |
| ----------------- | ---------------------------------------------------------- |
| **Send email in** | `3 days`                                                   |
| **Type**          | `Reply`                                                    |
| **Subject**       | _(leave empty — Apollo auto-fills "Re: [Step 1 subject]")_ |
| **Body**          | `{{personalized_email3}}`                                  |

---

## Sequence Settings

### Schedule

| Setting           | Recommended Value                            |
| ----------------- | -------------------------------------------- |
| **Send window**   | Mon-Fri, 8:00 AM - 6:00 PM (lead's timezone) |
| **Timezone**      | Lead's local timezone (or EST if unknown)    |
| **Skip holidays** | Yes                                          |

### Safety Settings

| Setting                    | Recommended Value             |
| -------------------------- | ----------------------------- |
| **Stop on reply**          | Yes (critical)                |
| **Stop on bounce**         | Yes                           |
| **Stop on meeting booked** | Yes                           |
| **Max emails per day**     | 50-100 (start low, warm up)   |
| **Sending interval**       | 60-120 seconds between emails |

### Email Account Settings

| Setting        | Value                                            |
| -------------- | ------------------------------------------------ |
| **From name**  | Nataly Riano                                     |
| **From email** | nataly@msitechnologies.com (or configured alias) |
| **Reply-to**   | Same as from                                     |
| **Signature**  | **DISABLED** — AI includes it in the body        |

> **WHY disable signature?** The AI generates these signatures:
>
> - **Email 1:** "Nataly Riano\nBusiness Development\nMSI Technologies Inc."
> - **Email 2:** "Nataly" (brief — it's a reply)
> - **Email 3:** "Nataly Riano" (breakup — semi-formal)
>
> If Apollo's signature is ON, recipients will see a duplicate signature block at the bottom.

---

## Custom Fields Setup (One-time)

Before importing leads, you need to create custom fields in Apollo to hold the AI-generated content.

### Create These Custom Fields in Apollo:

Go to **Apollo > Settings > Custom Fields > Contact Fields** and create:

| Field Name              | Field Type  | Purpose              |
| ----------------------- | ----------- | -------------------- |
| `personalized_subject1` | Text        | Email 1 subject line |
| `personalized_message`  | Text (long) | Email 1 full body    |
| `personalized_followup` | Text (long) | Email 2 full body    |
| `personalized_email3`   | Text (long) | Email 3 full body    |

> You only need to create these ONCE. They'll be available for all future imports.

---

## CSV Export & Import

### Column Mapping (CSV → Apollo)

When exporting leads from the MSI platform, the CSV contains these columns:

| CSV Column              | Maps to Apollo Field             | Used In        |
| ----------------------- | -------------------------------- | -------------- |
| `first_name`            | First Name (built-in)            | Contact record |
| `last_name`             | Last Name (built-in)             | Contact record |
| `email`                 | Email (built-in)                 | Contact record |
| `title`                 | Title (built-in)                 | Contact record |
| `company_name`          | Company (built-in)               | Contact record |
| `personalized_subject1` | `personalized_subject1` (custom) | Step 1 Subject |
| `personalized_message`  | `personalized_message` (custom)  | Step 1 Body    |
| `personalized_followup` | `personalized_followup` (custom) | Step 2 Body    |
| `personalized_email3`   | `personalized_email3` (custom)   | Step 3 Body    |

### Import Steps

1. **Export** leads with AI messages from the MSI platform (the app will generate a CSV)
2. Go to **Apollo > Contacts > Import** → Upload CSV
3. **Map columns:**
   - `first_name` → First Name
   - `last_name` → Last Name
   - `email` → Email
   - `title` → Title
   - `company_name` → Company
   - `personalized_subject1` → personalized_subject1 (custom field)
   - `personalized_message` → personalized_message (custom field)
   - `personalized_followup` → personalized_followup (custom field)
   - `personalized_email3` → personalized_email3 (custom field)
4. Complete import
5. Select the imported contacts → **Add to Sequence** → select your MSI AI Outreach sequence
6. Apollo will automatically fill each step's Subject/Body with the AI content from the custom fields

---

## Visual Reference — What Each Apollo Step Should Look Like

### Step 1 (Current → Fixed)

**BEFORE (wrong):**

```
Subject: Tech Solutions for {{FIRST_NAME}}
Type:    New thread
Body:    Hey {{FIRST_NAME}}, At {{COMPANY_NAME}}, tackling digital...
         [generic template with Nataly signature]
```

**AFTER (correct):**

```
Subject: {{personalized_subject1}}
Type:    New thread
Body:    {{personalized_message}}
```

### Step 2 (Current → Fixed)

**BEFORE (wrong):**

```
Subject: Re: [previous email subject line]
Type:    Reply
Body:    MSI Technologies inc. specializes in tailored tech solutions...
```

**AFTER (correct):**

```
Subject: (leave empty)
Type:    Reply
Body:    {{personalized_followup}}
```

### Step 3 (Current → Fixed)

**BEFORE (wrong):**

```
Subject: Re: [previous email subject line]
Type:    Reply
Body:    {{first_name}}, This is the final outreach regarding...
```

**AFTER (correct):**

```
Subject: (leave empty)
Type:    Reply
Body:    {{personalized_email3}}
```

---

## Email Strategy Summary (What the AI Generates)

All three emails focus exclusively on MSI's **AI Discovery Workshop** — the entry point to AI clarity.

### Email 1 — Timeline Hook & Discovery (New Thread)

- **Opens new thread** with a quantified, discovery-focused subject (<50 chars)
- **Timeline Hook:** Replaces generic problem statements with a specific compressed timeline (e.g., "AI Roadmap: Weeks 1-4") which provides a 2.24x reply lift for CFOs.
- **Assumptive Language:** Abandons "passive" words ("Would it make sense to connect") in favor of confident progression ("It makes sense to explore...").
- **Core Value:** Introduces the 4-week AI Discovery Workshop as a risk-mitigation and value-acceleration investment.
- **Frictionless CTA:** A binary interest ask (e.g., "Worth a quick look?"). NEVER asks for a specific day of the week to avoid generating "robotic" responses.
- **Length:** STRICTLY < 80 words. (The 2026 standard for elite executive outreach).
- **Greeting:** "[Name]," (Direct, peer-to-peer).
- **Signature:** Full — Nataly Riano, Business Development, MSI Technologies Inc.

### Email 2 — The ROI Anchor (Reply, +3 days)

- **Reply in same thread** — threaded under Email 1 with auto "Re:"
- **NO re-introduction** — Gets straight to the point.
- **Numbers Hook:** Anchors interest with a specific ROI metric from a peer in their industry.
- **Focus:** Demonstrates quantifiable outcomes achieved before long-term commitment.
- **CTA:** Soft engagement, entirely avoiding specific dates/days (e.g. "Open to a brief chat about this model?").
- **Length:** < 70 words.
- **Greeting:** "[Name]," (no Hi — it's a reply)
- **Signature:** Just "Nataly"

### Email 3 — "Close the File" Breakup (Reply, +3 more days)

- **Reply in same thread** — final touch with auto "Re:"
- **Psychology:** Uses "Loss Aversion". Acknowledges the silence and formally "withdraws" the offer (i.e. "I'll go ahead and close your file").
- **Summary:** Mentions the workshop as a resource if they prioritize clear ROI in the future.
- **Close:** Wishes them a strong quarter with absolute zero pressure.
- **Length:** < 60 words.
- **Greeting:** "[Name]," (same thread)
- **Signature:** Just "Nataly Riano"

---

## Complete Data Flow

```
MSI Platform              n8n (Gemini AI)           Supabase              Apollo
┌──────────┐             ┌──────────────┐          ┌──────────┐         ┌────────┐
│ Select    │  webhook   │ Generate 3   │  save    │ Store    │  CSV    │ Import │
│ leads +   │──────────→ │ Discovery    │────────→ │ emails + │───────→ │ leads  │
│ Generate  │            │ Workshop-    │          │ subjects │         │ + add  │
│ button    │            │ focused      │          │ per lead │         │ to seq │
│           │            │ emails       │          │          │         │        │
└──────────┘             └──────────────┘          └──────────┘         └────────┘
```

| Stage                | What Happens                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **1. MSI Platform**  | Select leads → click "Generate AI Messages"                                                                     |
| **2. n8n Workflow**  | Gemini generates 3 emails + 1 subject per lead (all focused on AI Discovery Workshop)                           |
| **3. Supabase**      | Stores `personalized_message`, `personalized_followup`, `personalized_email3`, `personalized_subject1`          |
| **4. CSV Export**    | Export leads with AI fields from MSI platform                                                                   |
| **5. Apollo Import** | Import CSV → map custom fields → add to sequence                                                                |
| **6. Apollo Sends**  | Email 1 (Workshop intro) → Step 2 +3 days (Workshop proof) → Step 3 +3 more days (Workshop summary + door open) |

---

## Banned Phrases & Practices (AI enforces automatically)

If you ever manually edit emails in Apollo, avoid these:

- **Specific days of the week:** "Tuesday", "Thursday" (creates an overly automated pattern)
- **Passive asks:** "I was hoping to connect...", "If you have 15 minutes...", "Would it make sense to explore?"
- **Generic openers:** "I noticed" / "I came across"
- **Corporate pleasantries:** "I hope this finds you well"
- **Cliché follow-ups:** "reaching out" / "just following up" / "circling back" / "touch base"
- **Jargon:** "synergy" / "leverage" / "game-changer" / "innovative solutions" / "cutting-edge" / "best-in-class"

---

## Database → Apollo Field Mapping

| Supabase Column         | Purpose             |     Apollo Custom Field | Apollo Step       |
| ----------------------- | ------------------- | ----------------------: | ----------------- |
| `personalized_subject1` | Email 1 subject     | `personalized_subject1` | Step 1 Subject    |
| `personalized_message`  | Email 1 body        |  `personalized_message` | Step 1 Body       |
| `personalized_followup` | Email 2 body        | `personalized_followup` | Step 2 Body       |
| `personalized_email3`   | Email 3 body        |   `personalized_email3` | Step 3 Body       |
| `personalized_subject2` | Always empty (`""`) |              Not needed | Apollo auto "Re:" |
| `personalized_subject3` | Always empty (`""`) |              Not needed | Apollo auto "Re:" |

---

## Pre-Launch Checklist

- [ ] **Supabase:** Run SQL migration (`FIX-add-all-ai-columns.sql`)
- [ ] **n8n:** Verify workflow is active (MSI AI Message Generator) — focused on Discovery Workshop
- [ ] **MSI Platform:** Generate AI messages for a test batch (all emails will promote the Discovery Workshop)
- [ ] **MSI Platform:** Review emails in modal (check all 3 tabs) — Email 1 = Workshop intro, Email 2 = Workshop ROI proof, Email 3 = Workshop summary
- [ ] **Apollo — Account:** Keep sender as Nataly Riano
- [ ] **Apollo — Account:** DISABLE Apollo email signature (AI includes it in body)
- [ ] **Apollo — Custom Fields:** Create 4 custom fields (see Custom Fields section)
- [ ] **Apollo — Sequence Name:** `Nataly - AI Discovery Workshop Outreach` (optional, but clear)
- [ ] **Apollo — Step 1:** Subject = `{{personalized_subject1}}`, Body = `{{personalized_message}}`, Type = New thread
- [ ] **Apollo — Step 2:** Subject = empty, Body = `{{personalized_followup}}`, Type = Reply, Wait = 3 days
- [ ] **Apollo — Step 3:** Subject = empty, Body = `{{personalized_email3}}`, Type = Reply, Wait = 3 days
- [ ] **Apollo — Schedule:** Mon-Fri, 8AM-6PM local time
- [ ] **Apollo — Import:** Upload CSV, map custom fields
- [ ] **Apollo — Test:** Add 5-10 contacts, verify preview shows Discovery Workshop messaging
- [ ] **Apollo — Launch:** Activate sequence

---

## What to Expect

When a lead receives these emails, they will:

1. **Email 1**: See a timeline-based hook (e.g. "We do this in 4 weeks") and view the Discovery Workshop as a structured, low-risk way to get ROI clarity.
2. **Email 2**: Read concrete, quantified proof of ROI achieved for an industry peer, combined with a frictionless, soft engagement question.
3. **Email 3**: Receive a "loss aversion" breakup email. By professionally "closing their file," we remove all pressure, which frequently triggers a positive response from busy executives who intended to reply but forgot.

**Replies triggered by this sequence typically fall into 2 categories:**

- "Yes, let's explore AI" → Wait for them to confirm, then schedule a brief exploratory call.
- "We're not ready for AI yet, but let's talk in [timeframe]" → Add to follow-up sequence or nurture campaign

---

## Troubleshooting

| Issue                                               | Solution                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| Emails 2-3 show as separate threads                 | Step 2/3 Type must be "Reply", not "New Thread"                           |
| Subject shows `{{personalized_subject1}}` literally | Custom field not created or not mapped in Apollo Settings > Custom Fields |
| Body shows `{{personalized_message}}` literally     | Same — custom field not mapped during CSV import                          |
| Double signature on emails                          | Disable Apollo signature — AI already includes one                        |
| "Re:" not showing on Steps 2-3 preview              | Normal — Apollo adds "Re:" at actual send time                            |
| AI messages not generating                          | Check n8n workflow is active + Gemini API key valid                       |
| Emails look generic / not personalized              | Verify leads have data (industry, title, company) in Supabase             |
