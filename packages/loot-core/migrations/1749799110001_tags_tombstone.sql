BEGIN TRANSACTION;

ALTER TABLE tags ADD COLUMN tombstone integer DEFAULT 0;

COMMIT;
