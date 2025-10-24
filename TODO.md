# TODO List: Git Repository Cleanup

**Project Goal:** Perform a comprehensive Git repository cleanup, including merging, pushing, and removing unused branches, to maintain a clean and efficient codebase.

## Phase 1: Repository Analysis (Agent Action)

*   [agent][git] **Step 1.1: Get Current Branch Status**
    *   Run `git status`.

*   [agent][git] **Step 1.2: List All Local Branches**
    *   Run `git branch --list`.

*   [agent][git] **Step 1.3: List All Remote Branches**
    *   Run `git branch -r`.

*   [agent][git] **Step 1.4: Identify Merged Local Branches**
    *   Run `git branch --merged` (for branches merged into current HEAD).
    *   Run `git branch --merged main` (assuming `main` is the primary development branch).

*   [agent][git] **Step 1.5: Identify Stale Remote Tracking Branches**
    *   Run `git remote prune origin --dry-run`.

## Phase 2: Proposed Cleanup Actions (Agent to User)

*   [agent][user] **Step 2.1: Present Current Status and Proposed Merges**
    *   Summarize `git status` output.
    *   Ask the user if the current branch should be merged into `main`/`master` or if there's a specific target branch.

*   [agent][user] **Step 2.2: Propose Local Branches for Deletion**
    *   Present the list of merged local branches identified in Step 1.4 and ask for user confirmation before deletion.
    *   Ask the user if there are any other local branches they wish to delete.

*   [agent][user] **Step 2.3: Propose Remote Branches for Deletion**
    *   Present the list of stale remote tracking branches from Step 1.5 and ask for user confirmation.
    *   Ask the user if there are any other remote branches they wish to delete.

## Phase 3: Execution of Cleanup (Agent Action with User Confirmation)

*   [agent][git] **Step 3.1: Handle Uncommitted Changes (if any)**
    *   If `git status` shows uncommitted changes, prompt the user to commit or stash them.

*   [agent][git] **Step 3.2: Merge Current Branch (if approved)**
    *   If the user approved merging the current branch:
        *   Checkout the target branch (e.g., `main`).
        *   Merge the current branch: `git merge <current-branch-name>`.
        *   Resolve any merge conflicts (will require user intervention if conflicts arise).

*   [agent][git] **Step 3.3: Push Merged Changes to Remote**
    *   Run `git push origin <target-branch-name>`.

*   [agent][git] **Step 3.4: Delete Local Branches (after user confirmation)**
    *   For each approved local branch, run `git branch -d <branch-name>` (or `git branch -D <branch-name>` for unmerged branches, with explicit user confirmation).

*   [agent][git] **Step 3.5: Delete Remote Branches (after user confirmation)**
    *   For each approved remote branch, run `git push origin --delete <branch-name>`.

*   [agent][git] **Step 3.6: Prune Stale Remote Tracking Branches**
    *   Run `git remote prune origin`.

## Phase 4: Final Verification (Agent Action)

*   [agent][git] **Step 4.1: Verify Repository State**
    *   Run `git status`, `git branch --list`, `git branch -r`.

*   [agent][report] **Step 4.2: Report Completion**
    *   Summarize the actions taken and the final state of the repository.
