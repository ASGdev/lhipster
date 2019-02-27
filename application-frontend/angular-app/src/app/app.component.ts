import { Component } from '@angular/core';
//import { data, application } from 'ttn';
import * as io from 'socket.io-client';

const TTN_APP_ID = "XXXX";
const TTN_ACCESS_KEY = "XXXX"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  test_data = "salut " + TTN_APP_ID;
  last_received_payload: String = "";

  socket: SocketIOClient.Socket;

  mymap;

  constructor(){
    this.socket = io.connect('http://localhost:8088');
  }

  ngAfterViewInit(){
    console.log("Started !");

    this.socket.emit('event1', {
      msg: 'Client to server, can you hear me server?'
    });

    this.socket.on('message-received', (msg: String) => {
      console.log(msg);
      this.last_received_payload = msg;
    });
    
  }
}
