import {Socket} from "socket.io";
import * as SystemBot from "./SystemBot";
import { io } from "./index";
import Filter from "bad-words";

export let messageCache: any[] = [];

export const filter = new Filter({ placeHolder: '@'});

export function setMessages(m: any[]) {
  messageCache = m;
}

function isMessageValid(message: string) {
  let valid = true;

  let formatted = message.replaceAll(" " , "").toLowerCase();
  if (formatted.length < 1 || message.length > 300) {
    valid = false;
  }
  
  return valid;
}

export interface ReplitUserData {
  id: number,
  name: string,
  profileImage: string,
  roles: string[],
  teams: string[],
  url: string
}

export default class Connection {
  socket: Socket;
  constructor(socket: Socket) {
    let muted = false;
    let banned = false;

    function mute(set: boolean) {
      muted = set;
      socket.emit("mute", muted);
    }

    function alert(title: string, message: string) {
      let alert = {
        title: title,
        message: message
      }
      socket.emit("alert", alert);
    }

    let lastMessage = 0;
    let fastMessageStreak = 0;
    
    this.socket = socket;

    let auth: ReplitUserData | null = null;

    try {
      auth = JSON.parse(String(this.socket.handshake.query.auth));
    } catch(e) {
      socket.disconnect();
      return
    }

    this.socket.emit("messages", messageCache.slice(-150));
    
    if(banned) {
      SystemBot.privChat("# Uh oh", socket);
      SystemBot.privChat("### Looks like you have been banned", socket);
      alert("The ban hammer has spoken", "You have been banned from ripl");
      mute(true);
    }
    
    this.socket.on("message", (data) => {
      if(muted || banned) return;
      if(typeof data !== "string") return;
      if(!isMessageValid(data)) return;
      const message: SystemBot.MessageData = {
        sender: auth?.name!,
        senderImage: auth?.profileImage!,
        content: filter.clean(data),
        timestamp: Date.now(),
        bot: false
      }
      if(Date.now() - lastMessage > 2000) {
        fastMessageStreak = 0;
      }
      if(Date.now() - lastMessage < 750) {
        fastMessageStreak ++;
      }
      if(fastMessageStreak > 5) {
        mute(true);
        alert("Woah!", "You're getting too fast. Please slow down. **You got muted for 10 seconds**");
        setTimeout(() => {
          mute(false);
        }, 10000);
      }
      lastMessage = Date.now();
      this.socket.broadcast.emit("message", message);
      messageCache.push(message);
      
      SystemBot.onMessage(message, socket, auth);

      if(messageCache.length > 200) {
        while(messageCache.length > 200) {
          messageCache.splice(0, 1);
        }
      }
    });
    // this.socket.on("image", (base64: string) => {
    //   if(muted || banned) return;
    //   console.log(base64.substring(0, 100))
    //   if(base64.startsWith("data:image/jpeg;")) {
    //     const buffer = Buffer.from(base64.substring(base64.indexOf(',') + 1));
    //     const sizeMb = (buffer.length * 0.000001);
    //     if(sizeMb > 1) {
    //       alert("Upload failed!", "The image you're sending is bigger than 1 Mb");
    //       return;
    //     }
    //     // const m = {
    //     //   content: `![Image upload](${base64})`,
    //     //   sender: auth?.name,
    //     //   senderImage: auth?.profileImage,
    //     //   timestamp: Date.now()
    //     // }
    //     // io.emit("message", m);
    //     // messageCache.push(m);
    //   }
    // });
  }
}