const { getInventory, getStoreInventory } = require('../service/inventory.service')

exports.inventory = async function (req, res) {
    const result = await getInventory()
    res.json(result)
}

exports.storeInventory = async function (req, res) {
    const { storeName } = req.params
    const result = await getStoreInventory(storeName)
    if (!result) return res.sendStatus(400)
    res.json(result)
}
