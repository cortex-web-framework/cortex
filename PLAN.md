# Plan for Git Repository Cleanup

**Project Goal:** Perform a comprehensive Git repository cleanup, including merging, pushing, and removing unused branches, to maintain a clean and efficient codebase.

## Phase 1: Repository Analysis (Agent Action)

### Step 1.1: Get Current Branch Status
*   **Objective:** Determine the current active branch and its status (e.g., clean, uncommitted changes).
*   **Action (Agent):** Run `git status` to get an overview of the current working directory.

### Step 1.2: List All Local Branches
*   **Objective:** Get a comprehensive list of all local branches.
*   **Action (Agent):** Run `git branch --list` to list all local branches.

### Step 1.3: List All Remote Branches
*   **Objective:** Get a comprehensive list of all remote branches.
*   **Action (Agent):** Run `git branch -r` to list all remote branches.

### Step 1.4: Identify Merged Local Branches
*   **Objective:** Find local branches that have already been merged into the current branch (or `main`/`master`).
*   **Action (Agent):** Run `git branch --merged` to list branches merged into the current HEAD. For branches merged into `main`/`master`, run `git branch --merged main` (or `master`).

### Step 1.5: Identify Stale Remote Tracking Branches
*   **Objective:** Find remote tracking branches that no longer exist on the remote.
*   **Action (Agent):** Run `git remote prune origin --dry-run` to see what would be pruned.

## Phase 2: Proposed Cleanup Actions (Agent to User)

### Step 2.1: Present Current Status and Proposed Merges
*   **Objective:** Inform the user about the current branch, any uncommitted changes, and propose merging the current branch (if it's a feature branch) into the main development branch.
*   **Action (Agent):** Summarize `git status` output. Ask the user if the current branch should be merged into `main`/`master` or if there's a specific target branch.

### Step 2.2: Propose Local Branches for Deletion
*   **Objective:** Suggest local branches that can be safely deleted based on merge status.
*   **Action (Agent):** Present the list of merged local branches identified in Step 1.4 and ask for user confirmation before deletion. Also, ask the user if there are any other local branches they wish to delete.

### Step 2.3: Propose Remote Branches for Deletion
*   **Objective:** Suggest remote branches that can be safely deleted (e.g., stale branches, or branches corresponding to local branches the user wants to delete).
*   **Action (Agent):** Present the list of stale remote tracking branches from Step 1.5 and ask for user confirmation. Also, ask the user if there are any other remote branches they wish to delete.

## Phase 3: Execution of Cleanup (Agent Action with User Confirmation)

### Step 3.1: Handle Uncommitted Changes (if any)
*   **Objective:** Ensure no work is lost before proceeding with merges or deletions.
*   **Action (Agent):** If `git status` shows uncommitted changes, prompt the user to commit or stash them.

### Step 3.2: Merge Current Branch (if approved)
*   **Objective:** Integrate the current branch's changes into the main development branch.
*   **Action (Agent):** If the user approved merging the current branch:
    1.  Checkout the target branch (e.g., `main`).
    2.  Merge the current branch: `git merge <current-branch-name>`.
    3.  Resolve any merge conflicts (will require user intervention if conflicts arise).

### Step 3.3: Push Merged Changes to Remote
*   **Objective:** Synchronize the main development branch with the remote repository.
*   **Action (Agent):** Run `git push origin <target-branch-name>`.

### Step 3.4: Delete Local Branches (after user confirmation)
*   **Objective:** Remove local branches that are no longer needed.
*   **Action (Agent):** For each approved local branch, run `git branch -d <branch-name>` (or `git branch -D <branch-name>` for unmerged branches, with explicit user confirmation).

### Step 3.5: Delete Remote Branches (after user confirmation)
*   **Objective:** Remove remote branches that are no longer needed.
*   **Action (Agent):** For each approved remote branch, run `git push origin --delete <branch-name>`.

### Step 3.6: Prune Stale Remote Tracking Branches
*   **Objective:** Clean up local references to remote branches that no longer exist.
*   **Action (Agent):** Run `git remote prune origin`.

## Phase 4: Final Verification (Agent Action)

### Step 4.1: Verify Repository State
*   **Objective:** Confirm that the repository is clean and the desired branches have been merged/deleted.
*   **Action (Agent):** Run `git status`, `git branch --list`, `git branch -r` to verify the cleanup.

### Step 4.2: Report Completion
*   **Objective:** Inform the user that the Git cleanup is complete.
*   **Action (Agent):** Summarize the actions taken and the final state of the repository.
