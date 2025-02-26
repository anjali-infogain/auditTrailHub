const express = require('express');
const router = express.Router();

const auditCycleRoutes = require('../controllers/auditCycleController');
const artifactRoutes = require('../controllers/artifactController');

router.use('/audit', auditCycleRoutes);
router.use('/artifacts', artifactRoutes);

module.exports = router;
