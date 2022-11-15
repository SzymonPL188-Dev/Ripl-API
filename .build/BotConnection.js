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
  default: () => BotConnection
});
var import_Connection = __toModule(require("./Connection"));
var import_BotRegistry = __toModule(require("./BotRegistry"));
function isMessageValid(message) {
  let valid = true;
  let formatted = message.replaceAll(" ", "").toLowerCase();
  if (formatted.length < 1 || message.length > 200) {
    valid = false;
  }
  return valid;
}
class BotConnection {
  socket;
  constructor(socket) {
    (async () => {
      let muted = false;
      let banned = false;
      let lastMessage = 0;
      this.socket = socket;
      function mute(set) {
        muted = set;
        socket.emit("data", {
          loadType: "mute",
          load: {
            muted
          }
        });
      }
      function error(message) {
        socket.emit("data", {
          loadType: "error",
          load: {
            message
          }
        });
      }
      let auth;
      try {
        auth = JSON.parse(String(this.socket.handshake.query.auth));
      } catch (e) {
        socket.disconnect();
        return;
      }
      if (!auth.token) {
        error("No token given!");
        return;
      }
      const bot = await (0, import_BotRegistry.getBotByToken)(auth.token);
      if (!bot) {
        error("No bot found for token: " + auth.token);
        return;
      }
      if (!auth.profileImage)
        auth.profileImage = "https://ripl-filestorage.szymonpl188.repl.co/default";
      if (banned) {
        this.socket.emit("data", {
          loadType: "ban",
          load: {}
        });
        return;
      }
      this.socket.on("message", async (data) => {
        if (muted || banned)
          return this.socket.emit("data", {
            loadType: "mute",
            load: {
              muted
            }
          });
        if (lastMessage + 2e3 > Date.now())
          return error("You can send a message once 2 seconds");
        if (typeof data !== "string")
          return;
        if (!isMessageValid(data))
          return error("Message is invalid");
        const messageBot = await (0, import_BotRegistry.getBotByToken)(auth.token);
        console.log(messageBot);
        const message = {
          sender: messageBot.name,
          senderImage: auth == null ? void 0 : auth.profileImage,
          content: import_Connection.filter.clean(data),
          timestamp: Date.now(),
          bot: true
        };
        lastMessage = Date.now();
        this.socket.broadcast.emit("message", message);
        import_Connection.messageCache.push(message);
      });
    })();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=BotConnection.js.map
