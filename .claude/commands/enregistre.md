Commit all current changes and push to the remote repository in one step.

Instructions:
1. Run `git status` to see all changes (staged, unstaged, untracked).
2. Run `git diff` and `git diff --cached` to understand the changes.
3. Run `git log --oneline -5` to see recent commit message style.
4. Stage all relevant files (avoid secrets like .env files).
5. Write a concise, descriptive commit message in French that summarizes the changes. End the message with:
   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
6. Commit the changes.
7. Push to the current remote branch (use `git push -u origin HEAD` if no upstream is set).
8. Report the result with the commit hash and the remote URL.

If the argument $ARGUMENTS is provided, use it as the commit message instead of generating one.
