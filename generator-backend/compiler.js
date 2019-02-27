const fs = require('fs');
const mustache = require('mustache');
const colors = require('colors');

console.log("lHipster compiler started".green);

let template = fs.readFileSync('ttn-program-template.ino', 'utf8');
let programDef = JSON.parse(fs.readFileSync('test_program.json', 'utf8'));

let output = {
	header: "",
	loop: "",
	setup: "",
	handler: "",
	loop_delay_seconds: "",
	behavior_code: "",
	payload_preparation: ""
}

/* PROCESS */
processMeta();
processHeader();
processSetup();
processBehaviors();
processLoop();
prepareMessage();
cleanProgram();

saveProgram();


/* FUNCTIONS */
function processMeta(){
	console.log("Name : " + programDef.properties.name);
	console.log("Author : " + programDef.properties.name);
}

function processHeader(){
	console.log("Now checking header".inverse);

	if(programDef.properties.lora.provider !== "ttn"){
	    console.error("Error : ".red + "Only " + "TTN".bold + " as provider is compatible for now"); 
	    process.exit(1);
	}

	console.log("\t + checking lora settings");

	// check and apply LoRA properties
	Object.entries(programDef.properties.lora).forEach(
	    ([key, value]) => {
			switch (key) {
			  case 'serial':
			    output.header += "#define loraSerial " + value + " \n";
			    break;
			  case 'plan':
			    if(key.region === "eu"){
				output.header += "#define freqPlan TTN_FP_EU868" + " \n";
			    } else {
				output.header += "#define freqPlan TTN_FP_EU868" + " \n";
			    }
			    break;
			  default:
			    //console.log("WARNING : ".yellow + " option not recognized");
		}
		
	    }
	);

	let _temp = "";
	switch (programDef.properties.lora.joinType) {
			case 'otaa':
			    _temp = "";  
			    if(programDef.properties.lora.appEui !== ""){
				_temp += '#define appEui "' + programDef.properties.lora.appEui + '" \n';
			    } else {
				throwError(" property " + "appEui".bold + " is mandatory to join by OTAA");
			    }

			    if(programDef.properties.lora.appKey !== ""){
				_temp += '#define appKey "' + programDef.properties.lora.appKey + '" \n';
			    } else {
				throwError(" property " + "appKey".bold + " is mandatory to join by OTAA");
			    }
			    output.header += _temp;
			    break;
			  case 'abp':
			    _temp = "";
			    if(programDef.properties.lora.appSKey !== ""){
				_temp += '#define appSKey "' + programDef.properties.lora.appSKey + '" \n';
			    } else {
				throwError(" property " + "appSKey".bold + " is mandatory to join by ABP");
			    }
			    if(programDef.properties.lora.netSKey !== ""){
				_temp += '#define netSKey "' + programDef.properties.lora.netSKey + '" \n';
			    }
			    if(programDef.properties.lora.devAddr !== ""){
				_temp += '#define devAddr "' + programDef.properties.lora.devAddr + '" \n';
			    }
			    output.header += _temp;
			    break;
			  default:
			    throwError(" no protocol defined for joining the LoRaWAN network");	
	}



	console.log("\t + checking debug settings");

	// check and apply debug
	if(programDef.properties.debug.enabled){
	    if(programDef.properties.debug.output !== ""){
	    	output.header += "#define debugSerial " + programDef.properties.debug.output + " \n";
	     } else {
		console.log("\t No debug output selected");
	     }
        } else {
	    console.log("\t No debug selected");
	}

	// check others definitions in program (e.g. sensors)
	/*programDef.sensors.forEach(function(sensor) {
	  if(sensor.defined && sensor.defined.defined){
		if(sensor.defined.name !== ""){
			output.header += "#define " + sensor.defined.name + " " + sensor.pin + ";\n";
		}
	  }
	});*/

	// write ttn constructor
	output.header += "TheThingsNetwork ttn(loraSerial, debugSerial, freqPlan);" + "\n";

}

function processSetup(){
    output.setup += "loraSerial.begin(57600);" + " \n";
  
    if(programDef.properties.debug.enabled){
	    if(programDef.properties.debug.output !== ""){
	    	output.setup += "debugSerial.begin(9600);" + " \n";
	    }
    }

    // connect
    if(programDef.properties.lora.joinType === "abp"){
	output.setup += "ttn.personalize(devAddr, netSKey, appSKey);" + " \n";
    } else {
	output.setup += "ttn.join(appEui, appKey);" + " \n";
    }

    // analog pin setup
    /*programDef.sensors.forEach(function(sensor) {
	  if(sensor.pin !== "" && sensor.type === "digital"){
		//output.header += "pinMode(" + + ", INPUT);\n";
	  } else {
	    throwError("digital sensor is not defined correctly (pin or type missing)");
	  }
    });*/
}

function processLoop(){	
    // set delay
	let d = programDef.properties.loop_delay_seconds * 1000;
    output.loop_delay_seconds = "delay(" + d + ");";
}

function processBehaviors(){
	programDef.behaviors.forEach(function(behavior) {
		switch (behavior.type){
			case 'uplink':
				var _temp = {};
				_temp.header = "";
				_temp.loop = "";
				_temp.payload = "";

				switch (behavior.transform.type) {
						case 'index_between':
							// init var 
							_temp.header += "int _" + behavior.name + "_raw = 0;\n";
							_temp.header += "int _" + behavior.name + "_computed = 0;\n";

							// write transform function
							_temp.loop += '_' + behavior.name + '_raw = analogRead('+ behavior.pin +');';
					

							// apply
							output.header += _temp.header + "\n";
							output.loop += _temp.loop + "\n";
							break;
						  case 'treshold':
							_temp.header += "int _" + behavior.name + "_raw=0;\n";
							_temp.header += "bool _" + behavior.name + "_computed=false;\n";

							// write transform function
							_temp.loop += '_' + behavior.name + '_raw = analogRead('+ behavior.pin +');\n';
							_temp.loop += '_' + behavior.name + '_computed = (_' + behavior.name + '_raw > ' + behavior.transform.value + ');\n';
							_temp.loop += '_payload_length += sizeof(_' + behavior.name + '_computed);\n';

							// apply
							output.header += _temp.header + "\n";
							output.loop += _temp.loop + "\n";
							break;
						  default:
							throwError(" one behavior is defined badly");	
				}
				break;

			case 'downlink':
				var _temp = "";
				_temp += "if (payload[0] == " + behavior.value + "){\n";
				behavior.behavior.forEach(function(b){
					switch(b.type){
						case 'digital':
							_temp += "digitalWrite(" + b.pin + "," + b.value + ");\n";
							break;
						case 'analog':
							break;
						default:
							throwError(" behavior not properly defined");
					}
				});
				_temp += "}\n";
				output.handler += _temp;
				break;

			default:
				throwError(" uncategorized behavior");
		}

		
    });
}


function saveProgram(){
    mustache.parse(template);
    var rendered = mustache.render(template, {header: output.header, setup: output.setup, loop: output.loop, loop_delay_seconds: output.loop_delay_seconds, payload_preparation: output.payload_preparation, message_handler: output.handler});

    console.log("Program output".inverse);
    console.log(rendered);

    fs.writeFileSync('ttn-program-output-test.ino', rendered);
}

function prepareMessage(){
	programDef.behaviors.forEach(function(behavior) {
		if(behavior.type === "uplink"){

			let _temp = "";

			switch (behavior.transform.type) {
					case 'index_between':
						// it sends an int 
						_temp += 'data[_FILL_COUNTER] = highByte(_' + behavior.name + '_computed);\n';
						_temp += '_FILL_COUNTER++;\n';
						_temp += 'data[_FILL_COUNTER] = lowByte(_' + behavior.name + '_computed);\n';
						_temp += '_FILL_COUNTER++;\n';

						output.payload_preparation += _temp;
						break;
					  case 'treshold':
						// it sends a boolean
						_temp += 'data[_FILL_COUNTER] = _' + behavior.name + '_computed;\n';
						_temp += '_FILL_COUNTER++;\n';

						output.payload_preparation += _temp;
						break;
					  default:
						throwError(" one behavior is defined badly");	
			}
		}
    });

}

function cleanProgram(){
}

function throwError(message){
    console.error("ERROR : ".red + message); 
    process.exit(1);
}
