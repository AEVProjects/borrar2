# Error Log and Troubleshooting Guide

## Overview
This file documents common errors encountered during the platform's development and use, particularly concerning Supabase, N8N workflows, and UI interactions.

### 1. Missing Columns on New Table Creation (Supabase)
When a custom leads table is created from an old baseline SQL schema, it lacks columns like batch_id or personalized_followup. Solution: Run ALTER TABLE commands to add missing columns before running N8N workflows or upload scripts.

### 2. Tilde Encoding Issues in N8N Workflows
Special characters like ñ (e.g. Nataly Riano) cause encoding failures downstream in N8N or CSV export. Solution: Replace them in the codebase with ASCII like Nataly Riano in both prompt ts generator and update-ai scripts.

### 3. Batches Navigation
Batches are NOT top level buttons but dropdown dynamic filters inside a table view. If a new main button is requested, one must create a separate Database Table entirely, update index.html to point to it via data-table, and clone upload-apollo-leads-batch.js to point to it.