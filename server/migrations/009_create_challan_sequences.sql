CREATE TABLE IF NOT EXISTS challan_sequences (
  year          INTEGER NOT NULL,
  last_sequence INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (year)
);
