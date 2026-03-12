# Apollo Email Sequence Setup Guide

Complete guide to configure the 3-step email sequence in Apollo that matches the AI-generated emails from MSI's n8n workflow.

---

## Sequence Overview

| Step | Type | Timing | Purpose | AI Field |
|------|------|--------|---------|----------|
| **Step 1** | **Automatic Email** (New Thread) | Immediately | Warm Introduction + Value Hook | `email1` / `subject1` |
| **Step 2** | **Automatic Email** (Reply) | +3 business days | Proof + Specific Value | `email2` (subject auto = Re:) |
| **Step 3** | **Automatic Email** (Reply) | +3 business days | Breakup + Door Open | `email3` (subject auto = Re:) |

**Total sequence duration:** ~6 business days  
**Auto-stop:** If the lead replies at any step, the sequence stops automatically.

---

## Step-by-Step Apollo Configuration

### 1. Create a New Sequence

1. Go to **Apollo > Engage > Sequences**
2. Click **+ New Sequence**
3. Name it: `MSI AI Outreach - [Batch Name]`
4. Set **Sequence Type**: "Email Only"

### 2. Configure Step 1 — Introduction Email (New Thread)

| Setting | Value |
|---------|-------|
| **Step Type** | Automatic Email |
| **Thread** | New Thread |
| **Wait** | Immediately (Day 1) |
| **Subject** | Use `{{personalized_subject1}}` from CSV |
| **Body** | Use `{{personalized_message}}` from CSV |
| **From** | Alex Rodriguez's mailbox |

**Template variables to map:**
```
Subject: {{personalized_subject1}}
Body:    {{personalized_message}}
```

### 3. Configure Step 2 — Proof Email (Reply in Thread)

| Setting | Value |
|---------|-------|
| **Step Type** | Automatic Email |
| **Thread** | Reply to Step 1 (same thread) |
| **Wait** | +3 business days after Step 1 |
| **Subject** | *(Leave empty — Apollo auto-generates "Re: [Step 1 Subject]")* |
| **Body** | Use `{{personalized_followup}}` from CSV |

**Template variables to map:**
```
Subject: (auto-generated as "Re: {{personalized_subject1}}")
Body:    {{personalized_followup}}
```

### 4. Configure Step 3 — Breakup Email (Reply in Thread)

| Setting | Value |
|---------|-------|
| **Step Type** | Automatic Email |
| **Thread** | Reply to Step 1 (same thread) |
| **Wait** | +3 business days after Step 2 |
| **Subject** | *(Leave empty — Apollo auto-generates "Re: [Step 1 Subject]")* |
| **Body** | Use `{{personalized_email3}}` from CSV |

**Template variables to map:**
```
Subject: (auto-generated as "Re: {{personalized_subject1}}")
Body:    {{personalized_email3}}
```

---

## Sequence Settings (Important)

### Schedule
| Setting | Recommended Value |
|---------|-------------------|
| **Send window** | Mon-Fri, 8:00 AM - 6:00 PM (lead's timezone) |
| **Timezone** | Lead's local timezone (or EST if unknown) |
| **Skip holidays** | Yes |

### Safety Settings
| Setting | Recommended Value |
|---------|-------------------|
| **Stop on reply** | ✅ Yes (critical) |
| **Stop on bounce** | ✅ Yes |
| **Stop on meeting booked** | ✅ Yes |
| **Max emails per day** | 50-100 (start low, warm up) |
| **Sending interval** | 60-120 seconds between emails |

### Email Account Settings
| Setting | Value |
|---------|-------|
| **From name** | Alex Rodriguez |
| **From email** | alex@msitechnologies.com (or configured alias) |
| **Reply-to** | Same as from |
| **Signature** | Disabled in Apollo — signature is included in AI-generated body |

> **IMPORTANT:** Disable Apollo's email signature because the AI already includes the appropriate signature in each email body:
> - Email 1: Full signature (Alex Rodriguez\nBusiness Development\nMSI Technologies Inc.)
> - Email 2: Just "Alex"
> - Email 3: Just "Alex Rodriguez"

---

## CSV Export & Import

### Column Mapping (CSV → Apollo)

When exporting leads from the MSI platform, the CSV contains these columns that map to Apollo variables:

| CSV Column | Apollo Variable | Used In |
|------------|----------------|---------|
| `first_name` | `{{first_name}}` | Lead record |
| `last_name` | `{{last_name}}` | Lead record |
| `email` | `{{email}}` | Lead record |
| `title` | `{{title}}` | Lead record |
| `company_name` | `{{company}}` | Lead record |
| `personalized_subject1` | `{{personalized_subject1}}` | Step 1 Subject |
| `personalized_message` | `{{personalized_message}}` | Step 1 Body |
| `personalized_followup` | `{{personalized_followup}}` | Step 2 Body |
| `personalized_email3` | `{{personalized_email3}}` | Step 3 Body |

> `personalized_subject2` and `personalized_subject3` are empty strings — Apollo handles "Re:" automatically for reply steps.

### Import Steps

1. Go to **Apollo > Contacts > Import**
2. Upload the CSV exported from MSI platform
3. Map columns to Apollo fields (custom fields for personalized_ columns)
4. After import, select the contacts → **Add to Sequence** → select your sequence
5. Apollo will use the custom fields as template variables in each step

---

## Email Strategy Summary

### Email 1 — Warm Introduction + Value Hook
- **Opens new thread** with a unique subject line
- Opens with something specific about THEIR company (not MSI)
- Introduces MSI broadly: 20+ years, 700+ consultants, 40+ countries
- Mentions 1-2 relevant services without deep-diving
- Soft CTA: "Would it make sense to explore this?"
- **Length:** 100-150 words
- **Greeting:** "Hi [Name],"
- **Signature:** Full (Alex Rodriguez, Business Development, MSI Technologies Inc.)

### Email 2 — Proof + Specific Value (Reply)
- **Reply in same thread** — appears threaded under Email 1
- NO re-introduction — they have context from Email 1
- Leads with concrete proof: numbers, percentages, timeframes
- Different MSI service angle than Email 1
- Direct question to invite dialogue
- **Length:** 60-90 words
- **Greeting:** "[Name]," (no Hi — it's a follow-up)
- **Signature:** Just "Alex"

### Email 3 — Breakup + Door Open (Reply)
- **Reply in same thread** — final touch in the thread
- Signals you won't keep emailing (triggers psychological response)
- Quick-scan: 2-3 bullet points of relevant MSI services
- Name-drops recognizable MSI clients
- Warm close, zero pressure
- **Length:** 50-70 words
- **Greeting:** "[Name]," (same thread)
- **Signature:** Just "Alex Rodriguez"

---

## Banned Phrases (AI enforces, verify in Apollo)

These phrases are banned from all emails. If you manually edit templates, avoid:

❌ "I noticed" / "I came across"  
❌ "I hope this finds you well"  
❌ "reaching out" / "just following up" / "circling back"  
❌ "touch base" / "synergy" / "leverage"  
❌ "game-changer" / "innovative solutions" / "cutting-edge" / "best-in-class"

---

## Database → Apollo Field Reference

| DB Column (Supabase) | Purpose | Maps to Apollo |
|-----------------------|---------|----------------|
| `personalized_message` | Email 1 body | Step 1 Body |
| `personalized_subject1` | Email 1 subject | Step 1 Subject |
| `personalized_followup` | Email 2 body | Step 2 Body |
| `personalized_subject2` | Email 2 subject (always empty) | N/A — Apollo auto "Re:" |
| `personalized_email3` | Email 3 body | Step 3 Body |
| `personalized_subject3` | Email 3 subject (always empty) | N/A — Apollo auto "Re:" |
| `ai_message_status` | Generation status | Not imported to Apollo |
| `ai_message_generated_at` | Timestamp | Not imported to Apollo |

---

## Pre-Launch Checklist

- [ ] Run SQL migration (`FIX-add-all-ai-columns.sql`) in Supabase
- [ ] Generate AI messages for leads batch in MSI platform
- [ ] Verify emails look good in the modal (check all 3 tabs)
- [ ] Export leads with AI messages to CSV
- [ ] Create Apollo sequence with 3 steps (New Thread → Reply → Reply)
- [ ] Disable Apollo signature (AI includes it in body)
- [ ] Set send window (Mon-Fri, 8-6 local time)
- [ ] Import CSV and map custom fields
- [ ] Add contacts to sequence
- [ ] Start with small batch (10-20) to verify formatting
- [ ] Monitor reply rates and adjust timing if needed

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Emails 2-3 show as separate threads | Verify Step 2 and 3 are configured as "Reply to Step 1", not "New Thread" |
| Subject shows raw variable `{{personalized_subject1}}` | Custom field not mapped — re-import CSV and check field mapping |
| Email body has `\n` literal text | Export issue — ensure CSV exports plain text with actual newlines |
| "Re:" doesn't appear on Emails 2-3 | This is normal in drafts — Apollo adds "Re:" at send time for reply steps |
| AI messages not generated | Check n8n workflow is active + Gemini API key is valid |
