#!/usr/bin/env python3
import re
import sys

def remove_console_logs(content):
    """
    Remove all console.log, console.warn, console.error, console.info, console.debug statements
    while preserving code structure and indentation.
    """
    
    # Pattern to match console statements with their complete blocks
    # This handles multi-line console statements with objects
    console_pattern = r'''
        (\s*)                           # Capture leading whitespace (group 1)
        console\.(?:log|warn|error|info|debug)\s*  # console method
        \(                              # Opening parenthesis
        (?:                             # Non-capturing group for content
            [^()]*                      # Match non-parentheses
            (?:                         # Non-capturing group for nested parens
                \([^()]*\)              # Match balanced parentheses
                [^()]*                  # Match more non-parentheses
            )*                          # Zero or more nested groups
        )                               # End content group
        \)                              # Closing parenthesis
        \s*;?                           # Optional semicolon and whitespace
    '''
    
    # Remove console statements (single line and multi-line)
    content = re.sub(console_pattern, '', content, flags=re.VERBOSE | re.MULTILINE)
    
    # Handle more complex multi-line console statements with nested objects/arrays
    # This pattern handles console statements that span multiple lines with complex objects
    complex_console_pattern = r'''
        (\s*)                           # Leading whitespace
        console\.(?:log|warn|error|info|debug)\s*\(  # console method with opening paren
        (?:[^;])*?                      # Non-greedy match until we find the closing
        \)\s*;?                         # Closing paren with optional semicolon
    '''
    
    # Apply the complex pattern multiple times to catch nested cases
    prev_content = ""
    while prev_content != content:
        prev_content = content
        content = re.sub(complex_console_pattern, '', content, flags=re.VERBOSE | re.MULTILINE | re.DOTALL)
    
    # Clean up any remaining empty lines that were left by removed console statements
    # But preserve intentional empty lines in the code structure
    lines = content.split('\n')
    cleaned_lines = []
    prev_was_empty = False
    
    for line in lines:
        stripped = line.strip()
        
        # If line is empty or only whitespace
        if not stripped:
            # Only add empty line if previous wasn't empty (avoid multiple consecutive empty lines)
            if not prev_was_empty:
                cleaned_lines.append(line)
                prev_was_empty = True
        else:
            cleaned_lines.append(line)
            prev_was_empty = False
    
    return '\n'.join(cleaned_lines)

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 remove_console_logs.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove console logs
        cleaned_content = remove_console_logs(content)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        
        print(f"Successfully removed console logging statements from {file_path}")
        
    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
