var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  chat: () => chat,
  onMessage: () => onMessage,
  privChat: () => privChat
});
var import_index = __toModule(require("./index"));
var import_Connection = __toModule(require("./Connection"));
var import_BotRegistry = __toModule(require("./BotRegistry"));
const prefix = "!";
function chat(message) {
  const m = {
    content: message,
    sender: "Ripl",
    senderImage: "https://ripl-filestorage.szymonpl188.repl.co/logo",
    timestamp: Date.now()
  };
  import_index.io.emit("message", m);
  import_Connection.messageCache.push(m);
}
let tips = [
  "You can use `!simon-says <message>` to make me speak",
  "You can use markdown to style your messages eg.  `# hello world`",
  "You can make your own bots: [Click here to see a example](https://replit.com/@SzymonPL188/Ripl-Bot-Example)",
  "You can use `!help` to get a list of commands",
  "The [example bot](https://replit.com/@SzymonPL188/Ripl-Bot-Example#Tutorial.md) responds with *I love you* when your message has the word `love` in it",
  "You can mention people using the `@` symbol eg. `@Example`"
];
const commands = {
  "help": "Displays this",
  "simon-says <message>": "Says the message you entered",
  "tip": "Displays a random tip",
  "bot help": "Shows bot commands"
};
const botCommands = {
  "bot help": "Displays this",
  "bot": "Shows you your bot token",
  "bot rename <name>": "Renames your bot",
  "bot reset": "Resets your bot token",
  "bot info": "Shows information about your bot (name, creator, id)"
};
function privChat(message, socket) {
  const m = {
    content: message,
    sender: "Ripl",
    senderImage: "https://ripl-filestorage.szymonpl188.repl.co/logo",
    timestamp: Date.now(),
    bot: false
  };
  socket.emit("message", m);
}
async function onMessage(message, sender, auth) {
  if (!message.content.startsWith(prefix))
    return;
  let args = message.content.substring(1).split(" ");
  let command = args.shift();
  if (command === "help") {
    chat("Commands:");
    Object.keys(commands).forEach((name) => {
      chat("`!" + name + "`: " + commands[name]);
    });
  }
  if (command === "simon-says") {
    if (args.length < 1)
      return chat("Use it like this: `!simon-says <message>`");
    chat(args.join(" "));
  }
  if (command === "bot") {
    if (args.length > 0) {
      if (args[0] === "help") {
        chat("Bot Commands:");
        Object.keys(botCommands).forEach((name) => {
          chat("`!" + name + "`: " + botCommands[name]);
        });
      }
      if (args[0] === "reset") {
        const data2 = await (0, import_BotRegistry.resetBot)(auth);
        privChat("Your new token is: `" + data2.token + "`", sender);
      }
      if (args[0] === "info") {
        const data2 = await (0, import_BotRegistry.getBot)(auth);
        privChat("Bot Info:", sender);
        privChat("Name: " + data2.name, sender);
        privChat("Id: " + data2.creatorId, sender);
        privChat("Creator: " + data2.creatorName, sender);
      }
      if (args[0] === "rename") {
        if (args.length > 1) {
          args.shift();
          const data2 = await (0, import_BotRegistry.renameBot)(auth, args.join(" "));
          privChat("Changed the bots name to: `" + data2.name + "`", sender);
        } else {
          privChat("Usage: `!bot rename <name>`", sender);
        }
      }
      return;
    }
    const data = await (0, import_BotRegistry.getBot)(auth);
    privChat("Your bot token is: `" + data.token + "`", sender);
    privChat("[Click here to see a tutorial on how to make a bot](https://replit.com/@SzymonPL188/Ripl-Bot-Example)", sender);
  }
  if (command === "tip") {
    let random = Math.floor(Math.random() * tips.length);
    chat(tips[random]);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  chat,
  onMessage,
  privChat
});
//# sourceMappingURL=SystemBot.js.map
