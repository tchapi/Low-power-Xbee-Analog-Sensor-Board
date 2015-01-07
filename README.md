# Low-power Xbee Analog Sensor Board
A sleep-enabled, low power analog sensor board based on the ATTiny85 µC and Digi Xbee S2

**Mostly based on the work of exsertus (https://github.com/exsertus/Arduino/tree/master/XBeeATTinySensor)**

### Xbee modules AT commands
Some commands have to be issued beforehand (but once):
	
 - Coordinator : 
	 * Firmware : Coordinator API
	 * Set the PAN Id to a unique identifier, eg 1AAA
	 * Set API Enable : 2
	 * Set SP = 0xAF0 (cyclic sleep period for the base)
	   and 	Set SN = 0xFFFF (cyclic sleep numbers for the base)
	    => time it retains the children addresses = SP * SN * 10ms = 21 days approx.		
 - End-Device :
	 * Firmware : End-device AT
	 * Set PAN ID to same id than coordinator
	 * Set SM to 1 (Sleep mode : Pin mode)