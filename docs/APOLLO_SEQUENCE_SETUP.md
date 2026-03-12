# Apollo Email Sequence Setup Guide

Complete guide to configure the 3-step email sequence in Apollo that matches the AI-generated emails from MSI's n8n workflow.

---

## Sequence Overview

| Step       | Type                             | Timing           | Purpose                        | AI Field                      |
| ---------- | -------------------------------- | ---------------- | ------------------------------ | ----------------------------- |
| **Step 1** | **Automatic Email** (New Thread) | Immediately      | Warm Introduction + Value Hook | `email1` / `subject1`         |
| **Step 2** | **Automatic Email** (Reply)      | +3 business days | Proof + Specific Value         | `email2` (subject auto = Re:) |
| **Step 3** | **Automatic Email** (Reply)      | +3 business days | Breakup + Door Open            | `email3` (subject auto = Re:) |

**Total sequence duration:** ~6 business days
**Auto-stop:** If the lead replies at any step, the sequence stops automatically.

---

## BEFORE YOU START — Required Changes from Current Setup

Your current Apollo sequence has these issues that need fixing:

| What                 | Current (Wrong)                                    | Should Be                                       |
| -------------------- | -------------------------------------------------- | ----------------------------------------------- |
| **Sender**           | Nataly Riaño                                       | Nataly Riaño                                    |
| **Apollo Signature** | ON (appends "Nataly Riano, MSI Technologies Inc.") | **OFF** — AI includes signature in body         |
| **Step 1 Subject**   | `Tech Solutions for {{FIRST_NAME}}`                | `{{personalized_subject1}}`                     |
| **Step 1 Body**      | Generic template                                   | `{{personalized_message}}`                      |
| **Step 2 Subject**   | `Re: [previous email subject line]`                | _(leave empty — Apollo adds Re: automatically)_ |
| **Step 2 Body**      | Generic template                                   | `{{personalized_followup}}`                     |
| **Step 3 Subject**   | `Re: [previous email subject line]`                | _(leave empty — Apollo adds Re: automatically)_ |
| **Step 3 Body**      | Generic template                                   | `{{personalized_email3}}`                       |

> **CRITICAL:** Disable Apollo's email signature in **Settings > Email Accounts**. The AI already generates the correct signature inside each email body (full sig for Email 1, just "Nataly" for Email 2, "Nataly Riaño" for Email 3). If you leave Apollo's signature ON, there will be a DOUBLE signature.

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
| **From name**  | Nataly Riaño                                     |
| **From email** | nataly@msitechnologies.com (or configured alias) |
| **Reply-to**   | Same as from                                     |
| **Signature**  | **DISABLED** — AI includes it in the body        |

> **WHY disable signature?** The AI generates these signatures:
>
> - **Email 1:** "Nataly Riaño\nBusiness Development\nMSI Technologies Inc."
> - **Email 2:** "Nataly" (brief — it's a reply)
> - **Email 3:** "Nataly Riaño" (breakup — semi-formal)
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

### Email 1 — Warm Introduction + Value Hook

- **Opens new thread** with a personalized subject (<50 chars)
- First paragraph hooks with something specific about THEIR company
- Introduces MSI broadly: 20+ years, 700+ consultants, 40+ countries
- Mentions 1-2 relevant services without deep-diving
- Soft CTA: "Would it make sense to explore this?"
- **Length:** 100-150 words
- **Greeting:** "Hi [Name],"
- **Signature:** Full — Nataly Riaño, Business Development, MSI Technologies Inc.

### Email 2 — Proof + Specific Value (Reply, +3 days)

- **Reply in same thread** — threaded under Email 1 with auto "Re:"
- NO re-introduction — they have context from Email 1
- Leads with concrete proof: numbers, percentages, timeframes
- Different MSI service angle than Email 1
- Direct question to invite dialogue
- **Length:** 60-90 words
- **Greeting:** "[Name]," (no Hi — it's a reply)
- **Signature:** Just "Nataly"

### Email 3 — Breakup + Door Open (Reply, +3 more days)

- **Reply in same thread** — final touch with auto "Re:"
- Signals you won't keep emailing (triggers psychological reply response)
- 2-3 bullet points of relevant MSI services
- Name-drops recognizable MSI clients
- Warm close, zero pressure
- **Length:** 50-70 words
- **Greeting:** "[Name]," (same thread)
- **Signature:** Just "Nataly Riaño"

---

## Complete Data Flow

```
MSI Platform              n8n (Gemini AI)           Supabase              Apollo
┌──────────┐             ┌──────────────┐          ┌──────────┐         ┌────────┐
│ Select    │  webhook   │ Generate 3   │  save    │ Store    │  CSV    │ Import │
│ leads +   │──────────→ │ personalized │────────→ │ emails + │───────→ │ leads  │
│ Generate  │            │ emails per   │          │ subjects │         │ + add  │
│ button    │            │ lead         │          │ per lead │         │ to seq │
└──────────┘             └──────────────┘          └──────────┘         └────────┘
```

| Stage                | What Happens                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **1. MSI Platform**  | Select leads → click "Generate AI Messages"                                                            |
| **2. n8n Workflow**  | Gemini generates 3 emails + 1 subject per lead                                                         |
| **3. Supabase**      | Stores `personalized_message`, `personalized_followup`, `personalized_email3`, `personalized_subject1` |
| **4. CSV Export**    | Export leads with AI fields from MSI platform                                                          |
| **5. Apollo Import** | Import CSV → map custom fields → add to sequence                                                       |
| **6. Apollo Sends**  | Step 1 immediately, Step 2 +3 days, Step 3 +3 more days                                                |

---

## Banned Phrases (AI enforces automatically)

If you ever manually edit emails in Apollo, avoid these:

- "I noticed" / "I came across"
- "I hope this finds you well"
- "reaching out" / "just following up" / "circling back"
- "touch base" / "synergy" / "leverage"
- "game-changer" / "innovative solutions" / "cutting-edge" / "best-in-class"

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
- [ ] **n8n:** Verify workflow is active (MSI AI Message Generator)
- [ ] **MSI Platform:** Generate AI messages for a test batch
- [ ] **MSI Platform:** Review emails in modal (check all 3 tabs look good)
- [ ] **Apollo — Account:** Keep sender as Nataly Riaño
- [ ] **Apollo — Account:** DISABLE Apollo email signature
- [ ] **Apollo — Custom Fields:** Create 4 custom fields (see Custom Fields section)
- [ ] **Apollo — Sequence:** Create 3-step sequence (New Thread → Reply → Reply)
- [ ] **Apollo — Step 1:** Subject = `{{personalized_subject1}}`, Body = `{{personalized_message}}`, Type = New thread
- [ ] **Apollo — Step 2:** Subject = empty, Body = `{{personalized_followup}}`, Type = Reply, Wait = 3 days
- [ ] **Apollo — Step 3:** Subject = empty, Body = `{{personalized_email3}}`, Type = Reply, Wait = 3 days
- [ ] **Apollo — Schedule:** Mon-Fri, 8AM-6PM local time
- [ ] **Apollo — Import:** Upload CSV, map custom fields
- [ ] **Apollo — Test:** Add 5-10 contacts, verify preview looks correct
- [ ] **Apollo — Launch:** Activate sequence

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
