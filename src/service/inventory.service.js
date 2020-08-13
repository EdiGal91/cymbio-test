const redis = require("redis")
const axios = require('axios')
const { promisify } = require("util");
const { REDIS_SERVER } = process.env

const client = redis.createClient({ host: REDIS_SERVER });
client.on("connect", function () {
    console.log("Connected to Redis");
});

const getAsync = promisify(client.get).bind(client);
const { SECONDS_TO_CACHE = 10 } = process.env

const STORE_URLS = process.env.stores
    .split(';')
    .reduce(
        (acc, store) => ({ ...acc, [store]: process.env[store] }),
        {}
    )

const URLS = process.env.stores.split(';').map(store => process.env[store])

exports.getInventory = async function () {
    const _cached = await getAsync('variants')
    const cached = JSON.parse(_cached)
    if (cached) return cached

    const [variants, ...rest] = await Promise.all(URLS.map(getProducts))
    rest.forEach(r => r.forEach(variant2 => {
        const variant1 = variants.find(({ sku }) => variant2.sku == sku)
        if (variant1) {
            variant1.amount += variant2.amount
        } else {
            variants.push({ sku: variant2.sku, amount: variant2.amount })
        }
    }))

    client.set('variants', JSON.stringify(variants))
    client.expire('variants', SECONDS_TO_CACHE)
    return variants
}

exports.getStoreInventory = async function (store) {
    const url = STORE_URLS[store]
    if (!url) return null

    const _cached = await getAsync(store)
    const cached = JSON.parse(_cached)
    if (cached) return cached

    const result = await getProducts(url)
    
    client.set(store, JSON.stringify(result))
    client.expire(store, SECONDS_TO_CACHE)
    
    return result
}

async function getProducts(url) {
    const { data: { products } } = await axios.get(url)
    const result = products.reduce((arr, product) => {
        const r = product.variants.map(variant => {
            return { sku: variant.sku, amount: variant.inventory_quantity }
        })
        return arr.concat(r)
    }, [])
    return result
}
