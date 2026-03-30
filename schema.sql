CREATE DATABASE IF NOT EXISTS eventBooking;
USE eventBooking;

CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  date              DATETIME     NOT NULL,
  total_capacity    INT UNSIGNED NOT NULL CHECK (total_capacity > 0),
  remaining_tickets INT UNSIGNED NOT NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_remaining CHECK (remaining_tickets <= total_capacity)
);

CREATE TABLE IF NOT EXISTS bookings (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  event_id     INT UNSIGNED NOT NULL,
  booking_date DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  booking_code VARCHAR(36)  NOT NULL UNIQUE,
  CONSTRAINT fk_booking_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_booking_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_attendance (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id INT UNSIGNED NOT NULL UNIQUE,
  user_id    INT UNSIGNED NOT NULL,
  event_id   INT UNSIGNED NOT NULL,
  entry_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_att_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_att_event   FOREIGN KEY (event_id)   REFERENCES events(id)   ON DELETE CASCADE
);

CREATE INDEX idx_events_date      ON events(date);
CREATE INDEX idx_bookings_user    ON bookings(user_id);
CREATE INDEX idx_bookings_event   ON bookings(event_id);
CREATE INDEX idx_attendance_event ON event_attendance(event_id);

INSERT INTO users (name, email) VALUES
  ('Alice Sharma',  'alice@example.com'),
  ('Bob Verma',     'bob@example.com'),
  ('Carol Singh',   'carol@example.com');

INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES
  ('Node.js Workshop',   'Hands-on Node.js for beginners',  DATE_ADD(NOW(), INTERVAL 7  DAY), 50,  50),
  ('React Summit Delhi', 'Annual React conf in Delhi NCR',   DATE_ADD(NOW(), INTERVAL 14 DAY), 200, 200),
  ('Hackathon 2026',     '24-hour coding marathon',          DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 100);
