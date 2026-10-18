import { c } from './shared/code.js'

export default {
  slug: 'git',
  title: 'Git',
  tech: 'Git',
  category: 'devops',
  minutes: 16,
  lang: 'bash',
  description: 'Day-to-day Git: commits, branches, checkout, rebasing step by step, syncing with remotes, undoing mistakes and stashing work.',
  sections: [
    {
      id: 'setup',
      title: 'Setup',
      group: 'Setup',
      items: [
        {
          title: 'Install Git',
          code: c`
            # macOS
            xcode-select --install      # or: brew install git

            # Linux (Ubuntu / Debian)
            sudo apt install -y git

            # Windows (PowerShell)
            winget install -e --id Git.Git      # includes Git Bash

            git --version
            `,
        },
        {
          title: 'Line endings (important on mixed teams)',
          code: c`
            # Windows
            git config --global core.autocrlf true

            # macOS / Linux
            git config --global core.autocrlf input
            `,
          note: 'Stops whole files showing as changed because of CRLF vs LF. Enforce it for everyone in the repo with a .gitattributes file:',
          then: [
            {
              label: '.gitattributes',
              lang: 'text',
              code: c`
                * text=auto eol=lf
                `,
            },
          ],
        },
        {
          title: 'Identity',
          code: c`
            git config --global user.name "Your Name"
            git config --global user.email you@example.com
            `,
          note: 'Written into every commit you make.',
        },
        {
          title: 'Default branch name',
          code: 'git config --global init.defaultBranch main',
        },
        {
          title: 'Start or copy a repo',
          code: c`
            git init
            git clone https://github.com/org/repo.git
            `,
        },
        {
          title: 'Useful aliases',
          code: c`
            git config --global alias.st status
            git config --global alias.lg "log --oneline --graph --decorate"
            `,
        },
        {
          title: 'SSH key for GitHub / GitLab',
          code: c`
            # all OS (macOS / Linux terminal, Windows PowerShell or Git Bash)
            ssh-keygen -t ed25519 -C "you@example.com"

            # copy the public key
            pbcopy < ~/.ssh/id_ed25519.pub                       # macOS
            cat ~/.ssh/id_ed25519.pub                            # Linux (copy from the output)
            Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard   # Windows PowerShell

            # paste it in GitHub → Settings → SSH and GPG keys, then test:
            ssh -T git@github.com
            `,
        },
      ],
    },
    {
      id: 'daily',
      title: 'Everyday commands',
      group: 'Everyday',
      items: [
        {
          title: 'See what changed',
          code: c`
            git status
            git diff          # unstaged
            git diff --staged # staged
            `,
        },
        {
          title: 'Stage and commit',
          code: c`
            git add file.php
            git add -p        # pick hunks interactively
            git commit -m "Add invoice export"
            `,
        },
        {
          title: 'Fix the last commit',
          code: c`
            git commit --amend            # edit message / add staged files
            git commit --amend --no-edit  # keep message
            `,
          note: 'Only amend commits you have not pushed yet.',
        },
        {
          title: 'History',
          code: c`
            git log --oneline -20
            git log -p path/to/file
            git blame path/to/file
            `,
        },
      ],
    },
    {
      id: 'branches',
      title: 'Branches',
      group: 'Branching',
      items: [
        {
          title: 'Create and switch',
          code: c`
            git switch -c feature/payments
            git switch main
            `,
        },
        {
          title: 'List and delete',
          code: c`
            git branch -a
            git branch -d feature/old     # safe
            git branch -D feature/old     # force
            `,
        },
        {
          title: 'Merge a branch',
          code: c`
            git switch main
            git merge feature/payments
            git merge --no-ff feature/payments  # always create a merge commit
            `,
        },
        {
          title: 'Merge vs rebase',
          lang: 'text',
          code: c`
            merge   → keeps both histories, adds a merge commit (safe on shared branches)
            rebase  → replays your commits on top of another branch (linear history)

            Rule of thumb: rebase your own local/feature branch,
            merge into shared branches like main.
            `,
          note: 'Full step-by-step rebase guide in the "Rebase" section below.',
        },
      ],
    },
    {
      id: 'checkout',
      title: 'Checkout',
      group: 'Branching',
      items: [
        {
          title: 'Switch to an existing branch',
          code: c`
            git checkout main
            git checkout feature/payments
            `,
          note: 'checkout still works everywhere. The modern equivalent:',
          then: [
            {
              label: 'Modern equivalent',
              lang: 'bash',
              code: c`
                git switch <branch>
                `,
            },
          ],
        },
        {
          title: 'Create a branch and switch to it',
          code: c`
            git checkout -b feature/refunds            # from current HEAD
            git checkout -b hotfix/login origin/main   # from a specific starting point
            `,
          then: [
            {
              label: 'Modern equivalent',
              lang: 'bash',
              code: c`
                git switch -c feature/refunds
                git switch -c hotfix/login origin/main
                `,
            },
          ],
        },
        {
          title: 'Check out a teammate\'s remote branch',
          code: c`
            git fetch origin
            git checkout feature/invoices        # auto-creates a local tracking branch
            # or explicitly:
            git checkout -b feature/invoices --track origin/feature/invoices
            `,
          note: 'The short form works when exactly one remote has a branch with that name.',
        },
        {
          title: 'Jump back to the previous branch',
          code: 'git checkout -',
        },
        {
          title: 'Discard changes to a file',
          code: c`
            git checkout -- app/Models/User.php
            git checkout -- .                    # every file (careful!)
            `,
          note: 'Uncommitted changes are lost for good.',
          then: [
            {
              label: 'Modern equivalent',
              lang: 'bash',
              code: c`
                git restore app/Models/User.php
                git restore .
                `,
            },
          ],
        },
        {
          title: 'Grab a file from another branch or commit',
          code: c`
            git checkout main -- config/app.php
            git checkout a1b2c3d -- routes/web.php
            `,
          note: 'Overwrites the file in your working tree and stages it.',
          then: [
            {
              label: 'Modern equivalent',
              lang: 'bash',
              code: c`
                git restore --source=main --staged --worktree config/app.php
                `,
            },
          ],
        },
        {
          title: 'Inspect an old commit (detached HEAD)',
          code: c`
            git checkout a1b2c3d     # or a tag: git checkout v1.4.0
            # look around, run tests...
            git checkout -b fix-from-old-version   # keep work done here
            git checkout main                      # or just go back
            `,
          note: '"Detached HEAD" means you are not on a branch — commits made here are easy to lose unless you create a branch.',
        },
        {
          title: 'Check out a pull request locally (GitHub)',
          code: c`
            git fetch origin pull/123/head:pr-123
            git checkout pr-123
            # or with the GitHub CLI:
            gh pr checkout 123
            `,
        },
        {
          title: 'checkout vs switch vs restore',
          lang: 'text',
          code: c`
            git checkout <branch>     →  git switch <branch>
            git checkout -b <new>     →  git switch -c <new>
            git checkout -- <file>    →  git restore <file>
            git checkout <sha> -- f   →  git restore --source=<sha> f
            `,
          note: 'switch/restore split checkout\'s two jobs (changing branches, restoring files) into safer commands.',
        },
      ],
    },
    {
      id: 'rebase',
      title: 'Rebase step by step',
      group: 'Branching',
      items: [
        {
          title: '1. Make sure your work is committed',
          code: c`
            git status
            git add -A && git commit -m "WIP: refunds"   # or: git stash -u
            `,
          note: 'Rebase needs a clean working tree.',
        },
        {
          title: '2. Update main from the remote',
          code: 'git fetch origin',
          note: 'You will rebase onto origin/main, so there is no need to switch branches and pull.',
        },
        {
          title: '3. Rebase your branch onto main',
          code: c`
            git switch feature/payments
            git rebase origin/main
            `,
          note: 'Git sets your commits aside, moves the branch to the tip of main, then replays your commits one by one.',
        },
        {
          title: '4. If there is a conflict',
          code: c`
            git status                    # shows the conflicted files
            # edit the files, remove <<<<<<< ======= >>>>>>> markers
            git add path/to/fixed-file.php
            git rebase --continue         # moves on to the next commit
            `,
          note: 'You may resolve conflicts several times — once per commit that touches the same lines. Do not run git commit; --continue does it.',
        },
        {
          title: 'Escape hatches',
          code: c`
            git rebase --abort    # cancel, back to exactly where you started
            git rebase --skip     # drop the commit currently being replayed
            `,
        },
        {
          title: '5. Run the tests, then push',
          code: 'git push --force-with-lease origin feature/payments',
          note: 'History was rewritten, so a normal push is rejected. --force-with-lease refuses if someone else pushed in the meantime.',
        },
        {
          title: 'Interactive rebase: clean up before a PR',
          code: c`
            git rebase -i origin/main      # every commit not yet in main
            git rebase -i HEAD~5           # or: the last 5 commits
            `,
          note: 'Opens an editor listing your commits, oldest first. Change the word in front of each line, save and close.',
        },
        {
          title: 'Interactive rebase commands',
          lang: 'text',
          code: c`
            pick   a1b2c3d Add refund model      # keep as-is
            reword b2c3d4e Add refund controler   # keep, edit the message
            squash c3d4e5f Fix tests              # fold into previous, combine messages
            fixup  d4e5f6a typo                   # fold into previous, discard message
            edit   e5f6a7b Add refund email       # stop here so you can amend it
            drop   f6a7b8c Debug logging          # delete the commit

            # Reorder lines to reorder commits.
            `,
        },
        {
          title: 'Split or change a commit with "edit"',
          code: c`
            # rebase stops at the commit marked "edit"
            git reset HEAD~1               # undo the commit, keep changes
            git add app/Models/Refund.php && git commit -m "Add refund model"
            git add app/Http && git commit -m "Add refund controller"
            git rebase --continue
            `,
        },
        {
          title: 'Autosquash fix-up commits',
          code: c`
            git commit --fixup=a1b2c3d     # marks a fix for commit a1b2c3d
            git rebase -i --autosquash origin/main

            # make it the default:
            git config --global rebase.autoSquash true
            `,
        },
        {
          title: 'Pull with rebase instead of merge',
          code: c`
            git pull --rebase

            # make it the default:
            git config --global pull.rebase true
            git config --global rebase.autoStash true   # stash/unstash dirty files automatically
            `,
        },
        {
          title: 'Move a branch to a different base (--onto)',
          code: c`
            # feature-b was branched from feature-a, but should sit on main:
            git rebase --onto main feature-a feature-b
            `,
          note: 'Takes the commits in feature-b that are not in feature-a and replays them onto main.',
        },
        {
          title: 'Remember conflict resolutions',
          code: 'git config --global rerere.enabled true',
          note: 'Git records how you solved a conflict and reapplies it automatically next time.',
        },
        {
          title: 'Undo a rebase that went wrong',
          code: c`
            git reflog                     # find the entry before "rebase (start)"
            git reset --hard HEAD@{5}      # use the number from reflog
            # or right after a rebase:
            git reset --hard ORIG_HEAD
            `,
        },
        {
          title: 'The golden rule',
          note: 'Never rebase commits that other people have already based work on (e.g. main or a shared branch). Rebase only your own branches, then share them.',
        },
      ],
    },
    {
      id: 'remotes',
      title: 'Remotes',
      group: 'Sharing',
      items: [
        {
          title: 'Inspect remotes',
          code: c`
            git remote -v
            git remote add upstream https://github.com/org/repo.git
            `,
        },
        {
          title: 'Fetch, pull, push',
          code: c`
            git fetch --prune
            git pull --rebase
            git push -u origin feature/payments
            `,
        },
        {
          title: 'Safer force push',
          code: 'git push --force-with-lease',
          note: 'Refuses to overwrite commits on the remote that you have not seen.',
        },
      ],
    },
    {
      id: 'undo',
      title: 'Undoing things',
      group: 'Fixing & saving work',
      items: [
        {
          title: 'Discard file changes',
          code: c`
            git restore file.php            # working tree
            git restore --staged file.php   # unstage
            `,
        },
        {
          title: 'Move HEAD back',
          code: c`
            git reset --soft HEAD~1   # keep changes staged
            git reset --mixed HEAD~1  # keep changes unstaged
            git reset --hard HEAD~1   # throw changes away
            `,
        },
        {
          title: 'Revert a pushed commit',
          code: 'git revert <commit-sha>',
          note: 'Adds a new commit that undoes the old one — safe on shared branches.',
        },
        {
          title: 'Find lost commits',
          code: c`
            git reflog
            git switch -c rescue <sha-from-reflog>
            `,
        },
      ],
    },
    {
      id: 'stash',
      title: 'Stash & cherry-pick',
      group: 'Fixing & saving work',
      items: [
        {
          title: 'Stash work in progress',
          code: c`
            git stash push -m "wip: refunds"
            git stash list
            git stash pop
            `,
        },
        {
          title: 'Include untracked files',
          code: 'git stash push -u',
        },
        {
          title: 'Copy a single commit',
          code: 'git cherry-pick <commit-sha>',
        },
        {
          title: 'Tag a release',
          code: c`
            git tag -a v1.4.0 -m "Release 1.4.0"
            git push origin --tags
            `,
        },
      ],
    },
  ],
}
