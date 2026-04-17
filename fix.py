import sys
wf_path = r'workflows\n8nmsi_cloud_n8n_m\personal\MSI AI Message Generator.workflow.ts'
with open(wf_path, 'r', encoding='utf-8') as f:
    text = f.read()
start = text.find('if (false) {')
end = text.find('promptLines.push(\'6. SUBJECT LINE')
if start != -1 and end != -1:
    text = text[:start] + text[end:]
    with open(wf_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print('Removed dead code!')
