colony-api configuration notes

This module reads JWT and CORS configuration from application properties. Paste the example below into application.yml (or use equivalent environment properties):

- app.jwt.secret (required in production) — the HS256 secret key (must be at least 32 bytes long).
- app.jwt.expiration-ms — token validity in milliseconds (default 86400000 = 1 day).
- app.cors.allowed-origins — comma-separated origins allowed for CORS (default http://localhost:5173).

See application.yml.example for an example.
