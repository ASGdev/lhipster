# LoRa Hipster #

LHipster is an end-to-end project generating programs for LoRa uses.

## Idea of the project ##

The aim of this PoC is to implement the best practices of data transmission in the constrained LoRaWAN network. For that, we developed a simple program which, from user rules,  and connected sensors, generate an Arduino program which can be compiled and loaded in the SODAQ board. For the user-side, a graphical interface developed with Angular is proposed to the end user. The data transferred to and from the remote are transmitted with MQTT to connect the userside.

Also, we tried to add a node location interface. For that, we used a channel model from Semtech and used the RSSI of the signal received by at least three gateways to compute the node location using free-space path loss model triangulation. That was a rapid experimentation, and we concluded that using only this solution is not very accurate, and the model used to simple.

## Architecture ##

![Alt text](docs/assets/lhipster-architecture.png?raw=true "Architecture")


### DATA MODEL ###

The part of the project that is between the client and his needs, and the generator that transform the json into C code
Currently working, although you might want to change it accordingly to match better your needs.

### GREETER ###

The script (Perl) that gather the information from the user, and then generate the json that will be used by the Lora Hipster compiler.
Currently, the script works fine and generate a usable json.

### FRONTEND / application ###

The frontend of the application is to be generated according to the user actions (actuators) and the sensors.
It provides for now a simple interface, just for demo. It parses a CayenneLPP payload.

To receive data form TTN in realtime, the web application is connected to the application backend through webscoket.

### BACKEND / application ###

The application backend is bascially a NodeJS program which translate the MQTT flow (from and to TTN) to websocket (to and from the user application). It also provides the node location feature according to the gateways data from the TTN message.

### BACKEND / compiler ###

The compiler generates an Arduino program according to many user-defined parameters such as :
- LoRa transmission parameters (keys, SF, plan)
- actuators and sensors : how the program should behave according to sensors status or received commands.
It proposes some mecanisms to generate an optimized transmission of data through the LoRa network such as indexing, tresholding...

## Status ##

The project was developed in collaboration with Loris GENTILLON.

The project is going to be maintained here in my spare time.

## Support / functionality / priority development ##
Please contact me.
