CREATE TABLE provider_title (
  title_id int NOT NULL,
  provider_id int NOT NULL,
  CONSTRAINT pk_title_provider PRIMARY KEY (
    title_id,
    provider_id
  ),
  FOREIGN KEY (title_id) REFERENCES title (title_id),
  FOREIGN KEY (provider_id) REFERENCES provider (provider_id)
);
