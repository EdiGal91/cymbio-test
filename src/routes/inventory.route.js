const router = require('express').Router()
const inventoryController = require('../controller/inventory.controller')

router.get('/inventory', inventoryController.inventory)
router.get('/:storeName/inventory', inventoryController.storeInventory)

module.exports = router
