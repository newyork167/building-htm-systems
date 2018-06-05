let utils = require('../../../lib/utils')
let html = require('./cycleRollup.tmpl.html')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let params = {
            values: 7,
            range: 9,
            buckets: 20,
            size: 300,
            color: '#333',
        }

        let encoderDisplay = new CyclicEncoderDisplay('rollup', params)
        encoderDisplay.render()
        encoderDisplay.jsds.set('value', 0)
        encoderDisplay.loop()

        function update() {
            encoderDisplay.jsds.set('values', encoderDisplay.encoder.values)
            encoderDisplay.jsds.set('buckets', encoderDisplay.encoder.buckets)
            encoderDisplay.jsds.set('range', encoderDisplay.encoder.range)
        }

        update()

    })

}
