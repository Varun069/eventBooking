require('dotenv').config();
const express   = require('express');
const YAML      = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const path      = require('path');

const starkBoard  = require('./routes/events');
const rogersFiles = require('./routes/bookings');
const agentFiles  = require('./routes/users');

const stark = express();
const PORT  = process.env.PORT || 3000;

stark.use(express.json());

const wandaSpec = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));
stark.use('/api-docs', swaggerUi.serve, swaggerUi.setup(wandaSpec));

stark.use('/events',   starkBoard);
stark.use('/bookings', rogersFiles);
stark.use('/users',    agentFiles);

stark.get('/health', (_req, res) => res.json({ status: 'ok' }));

stark.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

stark.use((fury, _req, res, _next) => {
  console.error('Unhandled error:', fury);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

stark.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI → http://localhost:${PORT}/api-docs`);
});

module.exports = stark;
