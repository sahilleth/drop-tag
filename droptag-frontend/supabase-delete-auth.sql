-- Run this in Supabase SQL Editor to enable delete-by-author-or-room-creator.
-- Adds created_by / uploaded_by columns and RPCs that enforce who can delete.
-- Note: Rows created before these columns existed will have null created_by/uploaded_by;
-- only the room creator can delete those (if the room has created_by set).

-- 1. Schema: add creator columns (nullable for existing rows)
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS created_by text;

ALTER TABLE texts
  ADD COLUMN IF NOT EXISTS created_by text;

ALTER TABLE files
  ADD COLUMN IF NOT EXISTS uploaded_by text;

-- 2. RPC: delete text only if current client is author or room creator
CREATE OR REPLACE FUNCTION delete_text_if_allowed(p_text_id uuid, p_client_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM texts t
  WHERE t.id = p_text_id
    AND (
      t.created_by = p_client_id
      OR EXISTS (
        SELECT 1 FROM rooms r
        WHERE r.id = t.room_id AND r.created_by = p_client_id
      )
    );
END;
$$;

-- 3. RPC: delete file only if current client is uploader or room creator
CREATE OR REPLACE FUNCTION delete_file_if_allowed(p_file_id uuid, p_client_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM files f
  WHERE f.id = p_file_id
    AND (
      f.uploaded_by = p_client_id
      OR EXISTS (
        SELECT 1 FROM rooms r
        WHERE r.id = f.room_id AND r.created_by = p_client_id
      )
    );
END;
$$;

-- Grant execute to anon/authenticated so the app can call the RPCs
GRANT EXECUTE ON FUNCTION delete_text_if_allowed(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION delete_text_if_allowed(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_file_if_allowed(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION delete_file_if_allowed(uuid, text) TO authenticated;
