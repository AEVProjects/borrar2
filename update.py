import os
import re

new_key = 'org_9e948565692e5786dd47964efb1a16ca93f427a08aa5234d723493b6880acff2f75e03d59fb171228f5e69'
old_key = 'org_aae0e1f07f1f504b5f39fe9953ecc82eda35d2da72650564a340a49b4a80d996540eef9ac5b57109ba6f69'

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
        if old_key in content:
            content = content.replace(old_key, new_key)
            changed = True
            
        old_phone_str = "BLAND_PHONE_NUMBER_ID = '07e907b3-68ee-4177-bcb1-3f8e990a245e'"
        new_phone_str = "BLAND_PHONE_NUMBER_ID = ''"
        if old_phone_str in content:
            content = content.replace(old_phone_str, new_phone_str)
            changed = True

        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {filepath}')
