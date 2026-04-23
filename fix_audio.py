import os

for dirpath, _, filenames in os.walk('.'):
    if '.git' in dirpath: continue
    for filename in filenames:
        filepath = os.path.join(dirpath, filename)
        if filepath.endswith('.py') or filepath.endswith('.pyc'): continue
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        
        changed = False
        
        # Remove Nataly and Riano from pronunciation_guide
        replacements = [
            ("{ word: 'Nataly', pronunciation: 'NAH-tah-lee' },", ""),
            ("{ word: 'Nataly', pronunciation: 'NAH-tah-lee', case_sensitive: 'true', spaced: 'true' },", ""),
            ("{ word: 'Riano', pronunciation: 'Ree-AH-no' }", ""),
            ("{ word: 'Riano', pronunciation: 'Ree-AH-no', case_sensitive: 'true', spaced: 'true' }", ""),
            ("wait_for_greeting: true,", "wait_for_greeting: false,")
        ]
        
        for old, new in replacements:
            if old in content:
                content = content.replace(old, new)
                changed = True
        
        # sometimes we might leave a trailing comma or empty line, but let's just do a simple replacement.
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {filepath}')
