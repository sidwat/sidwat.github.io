# The editor's GitHub token: create, rotate, revoke

For: the site owner. Last checked: 2026-10-17 against GitHub's "Managing your personal access tokens" docs and Sveltia CMS's GitHub backend docs.

The blog editor at `/admin/` signs in with a **fine-grained personal access token** (PAT). It's a password that GitHub issues for one purpose. Ours can only read and write the files of this one repository, and it expires.

**Rules**

- The token is a real secret. Never put it in a file, a commit, an issue, an email, a chat (including AI assistants), a screenshot or a note app without a password. The only place it goes is the editor's sign-in box.
- The editor saves it in your browser's storage for `sidwat.github.io`. Anything that runs on that site could read it, which is why the site loads no third-party scripts except the editor itself (pinned and checked) and why posts can't contain HTML.
- If a token is ever pushed to a public GitHub repository, GitHub revokes it automatically. That is a safety net, not a plan.

---

## 1. Create a token (first time, about 5 minutes)

1. Make sure you're signed in to GitHub as **sidwat**.
2. Open this link. It fills in the name, description, a 90-day expiry and the one permission:
   <https://github.com/settings/personal-access-tokens/new?name=Blog+editor+%28sidwat.github.io%29&description=Sveltia+CMS+at+sidwat.github.io%2Fadmin%2F.+Contents+only.&target_name=sidwat&expires_in=90&contents=write>

   Or click your avatar → **Settings** → **Developer settings** (bottom of the left sidebar) → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**, and fill in the form yourself.
3. Check each part of the form:

   | Field | Set to |
   |---|---|
   | Token name | `Blog editor (sidwat.github.io)` |
   | Expiration | **90 days** or less. Never "No expiration" |
   | Resource owner | `sidwat` |
   | Repository access | **Only select repositories** → choose **sidwat/sidwat.github.io**. *The link cannot pre-select this. You must do it by hand.* Never "All repositories" |
   | Permissions → Repository permissions | **Contents: Read and write**. Leave everything else at *No access*. *Metadata: Read-only* is added automatically and is fine |

   Do **not** add *Pull requests* unless an engineer has switched the editor to the review workflow (that is only needed if `master` gets branch protection).

4. Click **Generate token**. GitHub shows the token **once**. Copy it.
5. Go straight to <https://sidwat.github.io/admin/>, click **Sign In Using Access Token**, paste it, and click **Sign In**. Then clear your clipboard, for example by copying some other text. You don't need to keep the token anywhere else: when it expires you just make a new one.
6. **Calendar reminder:** add an event about 80 days from today: "Renew blog editor token (docs/runbooks/token-rotation.md §2)". GitHub's docs don't promise an expiry email, so don't rely on one.

**[SCREENSHOT PLACEHOLDER: GitHub's "New fine-grained personal access token" form, filled in as above.]** It is one long page: name and description at the top, then *Expiration*, *Resource owner*, *Repository access* with the three choices (Public repositories / All repositories / Only select repositories), and *Permissions* with a "+ Add permissions" list where *Contents* is set to *Read and write*.

Classic tokens also work (they need the broad `repo` scope), but they reach every repository you own. Don't use one.

## 2. Rotate (renew) the token, every 90 days or sooner

1. Create a new token exactly as in §1.
2. In the editor: avatar (top right) → **Sign Out**, then sign in again with the new token.
3. Delete the old token: <https://github.com/settings/personal-access-tokens> → click the old token → **Delete** (or **Delete** next to it in the list).
4. Sign in on any other browser you use, with the new token.
5. Move the calendar reminder forward.

If the old token already expired, the editor will fail to sign in or to save, with an authentication or permission error. Just do steps 1 and 2.

## 3. Check that a token is set up correctly

On <https://github.com/settings/personal-access-tokens>, click the token. It should show:

- **Repository access:** 1 repository, `sidwat/sidwat.github.io`
- **Permissions:** Contents read and write, Metadata read
- **Expires:** a date at most 90 days after you created it

## 4. If the token may have leaked

For example: you pasted it somewhere public, a device was lost, or you see commits you didn't make.

1. **Revoke it now:** <https://github.com/settings/personal-access-tokens> → the token → **Delete**. It stops working at once.
2. **Look for unexpected changes:** open <https://github.com/sidwat/sidwat.github.io/commits/master>. Every editor commit starts with `Blog:`. Look for commits you didn't make, especially any that touch files outside `content/blog/` and `public/images/blog/`. A token with Contents access can change any file in the repository, including the site's code. The one exception is the workflow files in `.github/workflows/`: GitHub requires a separate *Workflows* permission for those, and this token doesn't have it.
3. If you find one, open the commit and use **Revert**, or ask an engineer to revert it. The site redeploys after the revert. Tell the Tech Lead in any case.
4. Create a new token (§1) and sign in again.
5. Sign out of the editor on any shared computer you used.

Commits made through the editor are attributed to your GitHub account, so an attacker's commits would look like yours. Check what changed, not who made the commit.

## 5. Why a token and not "Sign in with GitHub"

A normal "Sign in with GitHub" button needs a small server to complete the login, and this site has none (it is static files on GitHub Pages). The editor is set to offer token sign-in only. The editor's makers plan a serverless GitHub login (PKCE) when GitHub supports it; once that ships, the token step can go away. If someone else ever needs to write posts, a sign-in server becomes worth it. That is stage L0.5 in the login roadmap (`docs/03-integrations-spec.md` §6).

## If this doesn't work

- **"Only select repositories" doesn't list sidwat.github.io:** check that *Resource owner* is `sidwat`.
- **Sign-in says the token is invalid:** it was copied with a missing character or a trailing space, or it has expired. Create a new one.
- **Signed in, but Save fails with "Resource not accessible by personal access token" or a 403:** the token lacks *Contents: Read and write*, or it is limited to a different repository. Check it as in §3, then create a new one.
- **Save fails after an engineer turned on branch protection for `master`:** the editor must be switched to its review workflow and the token needs *Pull requests: Read and write* (see `docs/runbooks/cms-reference.md` §4).
- Still stuck: open an issue in the repository describing the error message. **Never include the token.**
