# Security Specification - AniMax

## Data Invariants
1. A photo document must have a valid `url`, `title`, and `createdAt`.
2. Only the specific admin account (`ovinjomadder@gmail.com`) can create or delete documents in the `photos` collection.
3. Public users (unauthenticated or non-admin) have read-only access to all photos.
4. The `createdAt` field must be equal to `request.time` on creation.
5. `id` fields must be valid strings.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Unauthorized Create**: An unauthenticated user tries to add a `photo` document. -> DENIED
2. **Identity Spoofing**: A logged-in user who is NOT the admin tries to add a `photo`. -> DENIED
3. **Malicious Delete**: A public user tries to delete a photo by ID. -> DENIED
4. **Shadow Update**: Attempting to add a field like `isFeatured` that isn't in the schema. -> DENIED
5. **Timestamp Forge**: Trying to set `createdAt` to a past date manually. -> DENIED
6. **ID Poisoning**: Using a 2MB string as a document ID. -> DENIED
7. **Type Mismatch**: Sending a number for the `title` field. -> DENIED
8. **Size Attack**: Sending a 2MB string for the `title`. -> DENIED
9. **Blanket Read Breach**: (N/A search/list is public by design but should be restricted if requested).
10. **Terminal State Break**: (N/A no status field currently).
11. **Update Hijack**: Attempting to change the `url` of an existing photo. -> DENIED (Photos are immutable once uploaded by design in this app).
12. **Orphan Write**: Writing to a subcollection that doesn't exist. -> DENIED
