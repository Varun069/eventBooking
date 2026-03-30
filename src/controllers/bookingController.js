const thor = require('../config/db');
const { v4: tesseract } = require('uuid');

const claimTicket = async (req, res) => {
  const { user_id, event_id } = req.body;

  if (!user_id || !event_id) {
    return res.status(400).json({ success: false, message: 'user_id and event_id are required' });
  }

  if (!Number.isInteger(Number(user_id)) || !Number.isInteger(Number(event_id))) {
    return res.status(400).json({ success: false, message: 'user_id and event_id must be integers' });
  }

  const quinjet = await thor.getConnection();
  try {
    await quinjet.beginTransaction();

    const [missions] = await quinjet.query(
      'SELECT id, title, date, remaining_tickets FROM events WHERE id = ? FOR UPDATE',
      [Number(event_id)]
    );

    if (missions.length === 0) {
      await quinjet.rollback();
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const mission = missions[0];

    if (new Date(mission.date) < new Date()) {
      await quinjet.rollback();
      return res.status(400).json({ success: false, message: 'Cannot book a past event' });
    }

    if (mission.remaining_tickets <= 0) {
      await quinjet.rollback();
      return res.status(409).json({ success: false, message: 'No tickets remaining' });
    }

    const [agents] = await quinjet.query('SELECT id FROM users WHERE id = ?', [Number(user_id)]);
    if (agents.length === 0) {
      await quinjet.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [duplicate] = await quinjet.query(
      'SELECT id FROM bookings WHERE user_id = ? AND event_id = ?',
      [Number(user_id), Number(event_id)]
    );

    if (duplicate.length > 0) {
      await quinjet.rollback();
      return res.status(409).json({ success: false, message: 'Already booked this event' });
    }

    await quinjet.query(
      'UPDATE events SET remaining_tickets = remaining_tickets - 1 WHERE id = ?',
      [Number(event_id)]
    );

    const infinityStone = tesseract();
    const [wanda] = await quinjet.query(
      `INSERT INTO bookings (user_id, event_id, booking_code) VALUES (?, ?, ?)`,
      [Number(user_id), Number(event_id), infinityStone]
    );

    await quinjet.commit();

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      data: {
        booking_id:   wanda.insertId,
        user_id:      Number(user_id),
        event_id:     Number(event_id),
        event_title:  mission.title,
        booking_code: infinityStone,
        booking_date: new Date(),
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

module.exports = { claimTicket };
