-- daily_signals: Persistent cloud storage for Sentinel point-in-time sentiment signals.
-- Replaces ephemeral on-disk Parquet partitions with durable Supabase PostgreSQL.
--
-- Composite PK (ticker, date) ensures one signal per ticker per trading day.
-- Index on (ticker, published_at) enables fast point-in-time queries.

CREATE TABLE IF NOT EXISTS daily_signals (
    ticker          TEXT        NOT NULL,
    date            DATE        NOT NULL,
    published_at    TIMESTAMPTZ NOT NULL,
    sentiment_score DOUBLE PRECISION,
    confidence      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    topic_flags     JSONB       NOT NULL DEFAULT '{}'::jsonb,
    n_documents     INTEGER     NOT NULL DEFAULT 0,
    model_name      TEXT        NOT NULL DEFAULT 'vader',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (ticker, date)
);

-- Point-in-time query index: WHERE ticker = $1 AND published_at <= $2
CREATE INDEX IF NOT EXISTS idx_daily_signals_ticker_published
    ON daily_signals (ticker, published_at DESC);

-- Trigger to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_daily_signals_updated_at ON daily_signals;
CREATE TRIGGER trg_daily_signals_updated_at
    BEFORE UPDATE ON daily_signals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
