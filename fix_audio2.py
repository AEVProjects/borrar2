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
        replacements = [
            ("wait_for_greeting: !isWebCall,", "wait_for_greeting: false,"),
            ("{ word: 'Nataly', pronunciation: 'NAH-tah-lee' }", ""),
            ("{ word: 'Nataly', pronunciation: 'NAH-tah-lee', case_sensitive: 'true', spaced: 'true' }", ""),
            ("{ word: 'Riano', pronunciation: 'Ree-AH-no' },", ""),
            ("{ word: 'Riano', pronunciation: 'Ree-AH-no', case_sensitive: 'true', spaced: 'true' },", ""),
        ]
        
        for old, new in replacements:
            if old in content:
                content = content.replace(old, new)
                changed = True
                
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {filepath}')
