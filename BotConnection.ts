import {Socket} from "socket.io";
import * as SystemBot from "./SystemBot";
import { io } from "./index";
import { v4 as uuid } from 'uuid';
import { messageCache, filter } from "./Connection";
import { getBotByToken, getBot } from "./BotRegistry";

interface BotAuth {
  token: string;
  profileImage: string;
}

function isMessageValid(message: string) {
  let valid = true;

  let formatted = message.replaceAll(" " , "").toLowerCase();
  if (formatted.length < 1 || message.length > 200) {
    valid = false;
  }
  
  return valid;
}

export default class BotConnection {
  socket: Socket;
  constructor(socket: Socket) {
    (async () => {
    let muted = false;
    let banned = false;

    let lastMessage = 0;

    this.socket = socket;

    function mute(set: boolean) {
      muted = set;
      socket.emit("data", {
        loadType: "mute",
        load: {
          muted: muted
        }
      });
    }
    function error(message: string) {
      socket.emit("data", {
        loadType: "error",
        load: {
          message
        }
      });
    }

    let auth: BotAuth;
    
    try {
      auth = JSON.parse(String(this.socket.handshake.query.auth));
    } catch(e) {
      socket.disconnect();
      return
    }

    if(!auth.token) {
      error("No token given!")
      return;
    }

    const bot = await getBotByToken(auth.token);
    if(!bot) {
      error("No bot found for token: " + auth.token);
      return;
    }
      
    if(!auth.profileImage)
      auth.profileImage = "https://ripl-filestorage.szymonpl188.repl.co/default";
    
    if(banned) {
      this.socket.emit("data", {
        loadType: "ban",
        load: {}
      });
      return
    }
    
    this.socket.on("message", async (data) => {
      if(muted || banned) return this.socket.emit("data", {
        loadType: "mute",
        load: {
          muted: muted
        }
      });
      if(lastMessage + 2000 > Date.now()) return error("You can send a message once 2 seconds");
      if(typeof data !== "string") return;
      if(!isMessageValid(data)) return error("Message is invalid");
      const messageBot = await getBotByToken(auth.token);
      console.log(messageBot)
      const message: SystemBot.MessageData = {
        sender: messageBot.name,
        senderImage: auth?.profileImage,
        content: filter.clean(data),
        timestamp: Date.now(),
        bot: true
      }
      lastMessage = Date.now();
      this.socket.broadcast.emit("message", message);
      messageCache.push(message);
    });
    })();
  }
}