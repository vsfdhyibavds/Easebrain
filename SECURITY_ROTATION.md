# Secret Rotation Runbook

Use this when a local `.env`, API response, JWT, or other sensitive value may
have been exposed.

## Rotate Immediately

1. Revoke the exposed SendGrid key in the SendGrid dashboard.
2. Create a new SendGrid Mail Send API key with the minimum permissions needed.
3. Generate new Flask and JWT secrets:

```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(48))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(48))"
```

4. Update Render backend environment variables:
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`
   - `SENDGRID_API_KEY`
   - `SENDER_EMAIL`, if the sender identity also changed

5. Update your local `backend-ease-brain/.env` with the new values.
6. Redeploy or restart the backend after changing Render secrets.

Rotating `JWT_SECRET_KEY` invalidates existing access tokens. Users will need to
sign in again.

## Clean Git History If Already Pushed

The current working tree ignores local `.env` files and response dumps, but if a
secret-bearing file was already pushed, removing it in a new commit is not
enough. Coordinate with collaborators, then run from the repository root:

```bash
backend-ease-brain/scripts/remove_secrets.sh
git push --force origin main
```

After a history rewrite, collaborators should re-clone or carefully reset their
local branches to the rewritten remote history.

## Before Committing

Run these checks from the repository root:

```bash
git status --short
git ls-files backend-ease-brain/.env frontend-ease-brain/.env
git ls-files '*response*.txt' '*headers*.txt'
```

The `.env` command should print nothing. The response/header command should also
print nothing unless the file is a deliberate sanitized fixture.
