#!/usr/bin/env python
import re

with open(r'C:\Users\artki\borrar2\workflows\n8nmsi_cloud_n8n_m\personal\MSI AI Message Generator.workflow.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Count how many times the CRITICAL section appears
critical_count = content.count('=== CRITICAL: DISCOVERY WORKSHOP FOCUS ONLY ===')
print(f"Found {critical_count} instances of CRITICAL section")

# Keep only the first CRITICAL section and remove the duplicate
if critical_count > 1:
    # Replace multiple critical sections with just one
    pattern = r'(=== CRITICAL: DISCOVERY WORKSHOP FOCUS ONLY ===\n[^=]*=== CRITICAL: DISCOVERY WORKSHOP FOCUS ONLY ===\n[^=]*)'
    match = re.search(pattern, content)
    if match:
        # Replace the full paragraph with a single instance
        duplicate_text = match.group(0)
        # Extract just the unique parts
        single_critical = '''=== CRITICAL: DISCOVERY WORKSHOP FOCUS ONLY ===
IMPORTANT: ALL 3 emails MUST focus exclusively on the 'AI Discovery Workshop'. 
- Do NOT mention any other MSI services (Cloud, Cybersecurity, Custom Software, Talent, IT Outsourcing, etc.)
- Do NOT compare with competing services
- Every email must position the AI Discovery Workshop as THE solution
- Use the specific details above (4 weeks, 5 phases, deliverables, ROI focus) in your messaging

'''
        content = content.replace(duplicate_text, single_critical)
        print("✓ Removed duplicate CRITICAL section")
    else:
        # If pattern doesn't match, try a simpler approach
        parts = content.split('=== CRITICAL: DISCOVERY WORKSHOP FOCUS ONLY ===')
        if len(parts) > 2:
            # Reconstruct with just one critical section
            # Find where the first critical section ends (before APOLLO)
            first_critical_end = parts[1].find('=== APOLLO SEQUENCE STRUCTURE ===')
            if first_critical_end > 0:
                # Rebuild content
                content = parts[0] + '=== CRITICAL: DISCOVERY WORKSHOP FOCUS ONLY ===' + parts[1][:first_critical_end]
                # Find the remaining content after all the criticals
                remaining = ''.join(parts[2:])
                remaining = remaining[remaining.find('=== APOLLO SEQUENCE'):] if '=== APOLLO SEQUENCE' in remaining else remaining
                content = content + remaining
                print("✓ Removed duplicate CRITICAL section (simple method)")
else:
    print("No duplicates found")

with open(r'C:\Users\artki\borrar2\workflows\n8nmsi_cloud_n8n_m\personal\MSI AI Message Generator.workflow.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ File updated")
