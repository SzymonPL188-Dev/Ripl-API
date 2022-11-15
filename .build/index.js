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
  db: () => db,
  io: () => io
});
var import_socket = __toModule(require("socket.io"));
var import_Connection = __toModule(require("./Connection"));
var import_BotConnection = __toModule(require("./BotConnection"));
var import_database = __toModule(require("@replit/database"));
const db = new import_database.default();
const io = new import_socket.Server({
  cors: {
    origin: "*"
  }
});
setInterval(() => {
  let data = JSON.stringify(import_Connection.messageCache);
  db.set("messages", data);
}, 3e4);
(async () => {
  let messages = await db.get("messages");
  if (messages) {
    let parsed = JSON.parse(messages);
    (0, import_Connection.setMessages)(parsed);
  }
})();
let activeBots = {};
io.on("connection", (socket) => {
  let botConnection = false;
  const origin = socket.handshake.headers.origin;
  if (!origin) {
    botConnection = true;
  } else {
    if (!origin.includes(process.env["ORIGIN"])) {
      botConnection = true;
    }
  }
  if (botConnection) {
    let ip = socket.handshake.headers.ip;
    if (activeBots[ip]) {
      socket.emit("data", {
        loadType: "error",
        load: {
          message: "Bot already connected"
        }
      });
      return;
    }
    activeBots[ip] = new import_BotConnection.default(socket);
    socket.on("disconnect", () => {
      delete activeBots[ip];
    });
    return;
  }
  const connection = new import_Connection.default(socket);
});
io.listen(3e3);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  db,
  io
});
//# sourceMappingURL=index.js.map
