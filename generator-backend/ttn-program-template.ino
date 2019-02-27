#include <TheThingsNetwork.h>
{{{header}}}

int internal_counter;
int _payload_length = 0;

int _JOIN_STATUS = 0;

void setup()
{
    {{{setup}}}
	
	ttn.showStatus();

	internal_counter = 0;
}



void loop()
{
	debugSerial.println("-- LOOP");
	
	{{{loop}}}

	
	// execute Tx
	sendMessage();
	// reset counter
	

	{{{loop_delay_seconds}}}
}


void messageReceived(const uint8_t *payload, size_t size, port_t port)
{
	debugSerial.println("-- Message received");	
	debugSerial.println(payload[0]);
	
	{{{message_handler}}}
}

// prepare and send LoRa message
void sendMessage(){
	debugSerial.println(_payload_length);
	int _FILL_COUNTER = 0;
	byte data[_payload_length];
	
	{{{payload_preparation}}}

	debugSerial.println("Sending following payload");
  	for(int i =0; i < _payload_length; i++)  debugSerial.print(data[i]);
  	debugSerial.println();
    
 	ttn.sendBytes(data, _payload_length);
}

void showStatus(){
	showStatus();
}

{{user_defined_fns}}

