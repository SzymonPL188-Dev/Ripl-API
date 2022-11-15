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
  default: () => Connection,
  filter: () => filter,
  messageCache: () => messageCache,
  setMessages: () => setMessages
});
var SystemBot = __toModule(require("./SystemBot"));
var import_bad_words = __toModule(require("bad-words"));
let messageCache = [];
const filter = new import_bad_words.default({ placeHolder: "@" });
function setMessages(m) {
  messageCache = m;
}
function isMessageValid(message) {
  let valid = true;
  let formatted = message.replaceAll(" ", "").toLowerCase();
  if (formatted.length < 1 || message.length > 300) {
    valid = false;
  }
  return valid;
}
class Connection {
  socket;
  constructor(socket) {
    let muted = false;
    let banned = false;
    function mute(set) {
      muted = set;
      socket.emit("mute", muted);
    }
    function alert(title, message) {
      let alert2 = {
        title,
        message
      };
      socket.emit("alert", alert2);
    }
    let lastMessage = 0;
    let fastMessageStreak = 0;
    this.socket = socket;
    let auth = null;
    try {
      auth = JSON.parse(String(this.socket.handshake.query.auth));
    } catch (e) {
      socket.disconnect();
      return;
    }
    this.socket.emit("messages", messageCache.slice(-150));
    if (banned) {
      SystemBot.privChat("# Uh oh", socket);
      SystemBot.privChat("### Looks like you have been banned", socket);
      alert("The ban hammer has spoken", "You have been banned from ripl");
      mute(true);
    }
    this.socket.on("message", (data) => {
      if (muted || banned)
        return;
      if (typeof data !== "string")
        return;
      if (!isMessageValid(data))
        return;
      const message = {
        sender: auth == null ? void 0 : auth.name,
        senderImage: auth == null ? void 0 : auth.profileImage,
        content: filter.clean(data),
        timestamp: Date.now(),
        bot: false
      };
      if (Date.now() - lastMessage > 2e3) {
        fastMessageStreak = 0;
      }
      if (Date.now() - lastMessage < 750) {
        fastMessageStreak++;
      }
      if (fastMessageStreak > 5) {
        mute(true);
        alert("Woah!", "You're getting too fast. Please slow down. **You got muted for 10 seconds**");
        setTimeout(() => {
          mute(false);
        }, 1e4);
      }
      lastMessage = Date.now();
      this.socket.broadcast.emit("message", message);
      messageCache.push(message);
      SystemBot.onMessage(message, socket, auth);
      if (messageCache.length > 200) {
        while (messageCache.length > 200) {
          messageCache.splice(0, 1);
        }
      }
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  filter,
  messageCache,
  setMessages
});
//# sourceMappingURL=Connection.js.map
