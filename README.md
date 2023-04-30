Offline Pika Energy-Island (and likely Generac PWRcell)  data-logger and display

This application was written to make available the history information that Pika makes available through their ReView application, but without allowing the inverter to connect to the internet.  The pikaserver program needs to be run in a captive portal so that the inverter will think it is at 'samara.pika-energy.com'.  The server program then connects to a mysql database and inserts the data. The server also logs any packets it doesn't understand in a text logfile.  

A script for setting up the required tables is enclosed, but creating a user with permission to log in and insert into those tables is left to the user.
Setting up the captive portal is left to the user.  Note that the inverter caches the MAC address of the device it is talking to.  If you run the server on something like a Pi that randomizes MAC addresses, things will break after a reboot unless you specify a constant HW address.

The other half of this application needs to be placed on a webserver with CGI permissions on *.json in the folder.  

Currently the page supports only PV-Link and inverter devices.  Contact me if you require battery support or wind-turbine support.