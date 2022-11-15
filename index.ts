import { Server, Socket } from "socket.io";
import Connection, { messageCache, setMessages } from "./Connection";
import BotConnection from "./BotConnection";
import Database from "@replit/database";

export const db = new Database();

export const io = new Server({
  cors: {
    origin: "*"
  }
});

setInterval(() => {
  let data = JSON.stringify(messageCache);
  db.set("messages", data);
}, 30000);

(async () => {
  let messages = await db.get("messages");
  if(messages) {
    let parsed = JSON.parse(messages);
    setMessages(parsed);
  }
})();

let activeBots: Record<string, BotConnection> = {}

io.on("connection", (socket: Socket) => {
  let botConnection = false;
  
  const origin = socket.handshake.headers.origin;
  if(!origin) {
    botConnection = true;
  } else {
    if(!origin!.includes(process.env['ORIGIN']!)) {
      botConnection = true;
    }
  }

  if(botConnection) {
    let ip: string = socket.handshake.headers.ip as string;
    if(activeBots[ip]) {
      socket.emit("data", {
        loadType: "error",
        load: {
          message: "Bot already connected"
        }
      })
      return;  
    }
    
    activeBots[ip] = new BotConnection(socket);

    socket.on("disconnect", () => {
      delete activeBots[ip];
    });
    
    return;
  }
  const connection = new Connection(socket);
});

io.listen(3000);