'use strict'

const assets = [
  {
    title: 'BCC',
  },
  {
    title: 'BCC w/ Giulia',
  },
  {
    title: 'Altro',
  }
]

module.exports = async function({ entities, logger }) {
  for (const asset of assets) {
    const newAsset = await entities.asset.save({ input: asset })

    logger.info({ newAsset }, 'Created asset')
  }
}
