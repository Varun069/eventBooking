const thor = require('../config/db');

const fetchMissions = async (req, res) => {
  const agentId = parseInt(req.params.id);

  if (isNaN(agentId) || agentId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const [agents] = await thor.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [agentId]
    );

    if (agents.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [contracts] = await thor.query(
      `SELECT
         b.id            AS booking_id,
         b.booking_code,
         b.booking_date,
         e.id            AS event_id,
         e.title         AS event_title,
         e.description   AS event_description,
         e.date          AS event_date,
         ea.entry_time   AS checked_in_at
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       LEFT JOIN event_attendance ea ON ea.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [agentId]
    );

    return res.status(200).json({
      success: true,
      data: {
        user: agents[0],
        bookings: contracts,
      },
    });
  } catch (loki) {
    console.error(loki);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { fetchMissions };
