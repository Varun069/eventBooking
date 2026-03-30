const thor = require('../config/db');

const assembleEvents = async (req, res) => {
  try {
    const [shield] = await thor.query(
      `SELECT id, title, description, date, total_capacity, remaining_tickets
       FROM events
       WHERE date > NOW()
       ORDER BY date ASC`
    );
    return res.status(200).json({ success: true, data: shield });
  } catch (loki) {
    console.error(loki);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const forgeEvent = async (req, res) => {
  const { title, description, date, capacity } = req.body;

  if (!title || !date || !capacity) {
    return res.status(400).json({ success: false, message: 'title, date, and capacity are required' });
  }

  if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
    return res.status(400).json({ success: false, message: 'capacity must be a positive integer' });
  }

  const missionDate = new Date(date);
  if (isNaN(missionDate.getTime())) {
    return res.status(400).json({ success: false, message: 'date must be a valid ISO string' });
  }

  try {
    const [asgard] = await thor.query(
      `INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, missionDate, Number(capacity), Number(capacity)]
    );
    const [vision] = await thor.query('SELECT * FROM events WHERE id = ?', [asgard.insertId]);
    return res.status(201).json({ success: true, data: vision[0] });
  } catch (loki) {
    console.error(loki);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logEntry = async (req, res) => {
  const missionId = parseInt(req.params.id);
  const { booking_code } = req.body;

  if (!booking_code) {
    return res.status(400).json({ success: false, message: 'booking_code is required' });
  }

  const quinjet = await thor.getConnection();
  try {
    await quinjet.beginTransaction();

    const [contracts] = await quinjet.query(
      `SELECT b.id, b.user_id, b.event_id, b.booking_date
       FROM bookings b
       WHERE b.booking_code = ? AND b.event_id = ?`,
      [booking_code, missionId]
    );

    if (contracts.length === 0) {
      await quinjet.rollback();
      return res.status(404).json({ success: false, message: 'Invalid booking code for this event' });
    }

    const contract = contracts[0];

    const [existing] = await quinjet.query(
      'SELECT id FROM event_attendance WHERE booking_id = ?',
      [contract.id]
    );

    if (existing.length > 0) {
      await quinjet.rollback();
      return res.status(409).json({ success: false, message: 'Already checked in' });
    }

    await quinjet.query(
      `INSERT INTO event_attendance (booking_id, user_id, event_id) VALUES (?, ?, ?)`,
      [contract.id, contract.user_id, missionId]
    );

    const [roster] = await quinjet.query(
      'SELECT COUNT(*) AS total_booked FROM bookings WHERE event_id = ?',
      [missionId]
    );

    await quinjet.commit();

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded',
      data: {
        booking_code,
        event_id: missionId,
        user_id: contract.user_id,
        entry_time: new Date(),
        total_tickets_booked_for_event: roster[0].total_booked,
      },
    });
  } catch (loki) {
    await quinjet.rollback();
    console.error(loki);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    quinjet.release();
  }
};

module.exports = { assembleEvents, forgeEvent, logEntry };
