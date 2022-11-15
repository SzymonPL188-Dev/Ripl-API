import { io, db } from "./index";
import { messageCache, ReplitUserData } from "./Connection";
import { Socket } from "socket.io";
import { getBot, resetBot, renameBot } from "./BotRegistry";

const prefix = "!";

export interface MessageData {
  content: string;
  sender: string;
  senderImage: string;
  timestamp: number;
  bot: boolean;
}

export function chat(message: string) {
  const m = {
    content: message,
    sender: "Ripl",
    senderImage: "https://ripl-filestorage.szymonpl188.repl.co/logo",
    timestamp: Date.now()
  }
  io.emit("message", m);
  messageCache.push(m);
}

let tips = [
  "You can use `!simon-says <message>` to make me speak",
  "You can use markdown to style your messages eg.  `# hello world`",
  "You can make your own bots: [Click here to see a example](https://replit.com/@SzymonPL188/Ripl-Bot-Example)",
  "You can use `!help` to get a list of commands",
  "The [example bot](https://replit.com/@SzymonPL188/Ripl-Bot-Example#Tutorial.md) responds with *I love you* when your message has the word `love` in it",
  "You can mention people using the `@` symbol eg. `@Example`"
]

const commands = {
  "help": "Displays this",
  "simon-says <message>": "Says the message you entered",
  "tip": "Displays a random tip",
  "bot help": "Shows bot commands"
}

const botCommands = {
  "bot help": "Displays this",
  "bot": "Shows you your bot token",
  "bot rename <name>": "Renames your bot",
  "bot reset": "Resets your bot token",
  "bot info": "Shows information about your bot (name, creator, id)",
}

export function privChat(message: string, socket: Socket) {
  const m = {
    content: message,
    sender: "Ripl",
    senderImage: "https://ripl-filestorage.szymonpl188.repl.co/logo",
    timestamp: Date.now(),
    bot: false
  }
  socket.emit("message", m);
}

export async function onMessage(message: MessageData, sender: Socket, auth: ReplitUserData) {
  if(!message.content.startsWith(prefix)) return;
  let args = message.content.substring(1).split(" ");
  let command = args.shift();

  if(command === "help") {
    chat("Commands:");
    Object.keys(commands).forEach(name => {
      chat("`!" + name + "`: " + commands[name]);
    });
  }
  
  if(command === "simon-says") {
    if(args.length < 1) return chat("Use it like this: `!simon-says <message>`");
    chat(args.join(" "))
  }

  if(command === "bot") {
    if(args.length > 0) {
      if(args[0] === "help") {
        chat("Bot Commands:");
        Object.keys(botCommands).forEach(name => {
          chat("`!" + name + "`: " + botCommands[name]);
        });
      }
      if(args[0] === "reset") {
        const data = await resetBot(auth);
        privChat("Your new token is: `" + data.token + "`", sender);
      }
      if(args[0] === "info") {
        const data = await getBot(auth);
        privChat("Bot Info:", sender);
        privChat("Name: " + data.name, sender);
        privChat("Id: " + data.creatorId, sender);
        privChat("Creator: " + data.creatorName, sender);
      }
      if(args[0] === "rename") {
        if(args.length > 1) {
          args.shift();
          const data = await renameBot(auth, args.join(" "));
          privChat("Changed the bots name to: `" + data.name + "`", sender);
        } else {
          privChat("Usage: `!bot rename <name>`", sender);
        }
      }
      return;
    }
    
    const data = await getBot(auth);

    privChat("Your bot token is: `" + data.token + "`", sender);
    privChat("[Click here to see a tutorial on how to make a bot](https://replit.com/@SzymonPL188/Ripl-Bot-Example)", sender);
  }

  if(command === "tip") {
    let random = Math.floor(Math.random() * tips.length);
    chat(tips[random]);
  }
}