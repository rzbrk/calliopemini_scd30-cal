function checkTimeout () {
    if (control.millis() >= startTime + runMaxSeconds * 1000) {
        runProgram = false
        basic.showIcon(IconNames.Yes)
        serial.writeLine("@END@")
    }
}
control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_A, EventBusValue.MICROBIT_BUTTON_EVT_CLICK, function () {
    scd30_calibrate = true
})
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    SERIAL_RECEIVED = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    if ("@START@" == SERIAL_RECEIVED.substr(0, 7) && !(runProgram)) {
        serial.writeLine("@START@")
        basic.clearScreen()
        runProgram = true
        startTime = control.millis()
    }
})
let now = 0
let SERIAL_RECEIVED = ""
let runProgram = false
let startTime = 0
let scd30_calibrate = false
let runMaxSeconds = 0
// runMaxSeconds is the maximum time in seconds the program is allowed to run.
runMaxSeconds = 60
scd30_calibrate = false
let samplingRateSeconds = 5
let firstLoop = true
basic.showIcon(IconNames.Asleep)
basic.forever(function () {
    if (runProgram) {
        now = control.millis()
        // Output sensor version and initial calibration value only at the beginning (first loop)
        if (firstLoop == true) {
            firstLoop = false
            serial.writeLine("SCD30 sensor version: " + SCD30.getVersion())
            serial.writeLine("CO2 calibration value: " + SCD30.getCalibration() + " ppm")
            serial.writeLine("")
            control.waitMicros(1000)
        }
        if (scd30_calibrate == true) {
            scd30_calibrate = false
            serial.writeLine("Perform calibration . . .")
            SCD30.setCalibration400ppm()
            serial.writeLine("CO2 calibration value: " + SCD30.getCalibration() + " ppm")
            serial.writeLine("")
        } else {
            serial.writeLine("CO2: " + SCD30.readCO2() + " ppm")
            serial.writeLine("Temperature: " + SCD30.readTemperature() + " degrees")
            serial.writeLine("Humidity: " + SCD30.readHumidity() + " percent")
            serial.writeLine("")
        }
        led.toggle(2, 2)
        while (control.millis() - now < samplingRateSeconds * 1000) {
        	
        }
        checkTimeout()
    }
})
