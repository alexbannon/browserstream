CREATE INDEX title_ts_index ON title USING gin(to_tsvector('simple', title_name));
