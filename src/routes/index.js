const router = require('express').Router()
const inventoryRoutes = require('./inventory.route')

router.use(inventoryRoutes)

module.exports = router
