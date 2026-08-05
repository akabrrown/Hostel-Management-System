import os
import re

directories = ['src/app/admin', 'src/app/student', 'src/app/porter']
pattern_use_selector = re.compile(r'const {\s*user\s*}\s*=\s*useSelector\(\(state:\s*RootState\)\s*=>\s*state\.auth\)')
pattern_use_selector_2 = re.compile(r'const {\s*user,\s*loading\s*}\s*=\s*useSelector\(\(state:\s*RootState\)\s*=>\s*state\.auth\)')

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False

    # Replace useSelector
    if pattern_use_selector.search(content):
        content = pattern_use_selector.sub('const { user, profileFetched } = useSelector((state: RootState) => state.auth)', content)
        changed = True
    elif pattern_use_selector_2.search(content):
        content = pattern_use_selector_2.sub('const { user, loading, profileFetched } = useSelector((state: RootState) => state.auth)', content)
        changed = True

    # Replace role checks
    for role in ['admin', 'student', 'porter']:
        pattern_check = r'if \(!user \|\| user\.role !== \'' + role + r'\'\) \{'
        replacement_check = f"if (profileFetched && (!user || user.role !== '{role}')) {{"
        
        if re.search(pattern_check, content):
            content = re.sub(pattern_check, replacement_check, content)
            changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched: {filepath}")

for root_dir in directories:
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.tsx'):
                patch_file(os.path.join(dirpath, filename))
