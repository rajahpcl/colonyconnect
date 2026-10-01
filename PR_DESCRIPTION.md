Summary

Small fix to make controller tests reliable and ensure JwtUtil is provided when SecurityConfig is imported by test slices.

What I changed

- SecurityConfig.java
  - Added a JwtUtil @Bean using properties (app.jwt.secret and app.jwt.expiration-ms) so JwtUtil is available in @WebMvcTest slices that import SecurityConfig.
  - Marked the SecurityFilterChain @Bean with @Order(1) and injected JwtUtil into the chain.
- JwtUtil.java
  - Removed @Component so that JwtUtil is not double-defined; it's provided by SecurityConfig now.
- AuthController.java
  - getCurrentUser(...) now reads session attribute EMP_NO first (tests and legacy flows use session). Falls back to JWT cookie for stateless flows.
- Added colony-api/src/main/resources/application.yml.example
  - Example properties and a note to set a strong secret in production.
- Added colony-api/README.md with a brief config note.

Verification

- Ran `mvn test` on the colony-api module. All tests succeed.

How to push & open a PR (if you want me to push)

# create branch
git checkout -b fix/jwt-bean-session

# commit (already created locally by this script)
# push (requires your credentials)
git push -u origin fix/jwt-bean-session

# create PR using GitHub CLI (if available)
gh pr create --title "Fix: ensure JwtUtil bean available for tests; session fallback for /me" --body "See PR_DESCRIPTION.md" --base main

If you prefer, I can attempt to push and open the PR from this environment; you'll need to allow remote write or provide a token. Otherwise, push the branch with the commands above.
