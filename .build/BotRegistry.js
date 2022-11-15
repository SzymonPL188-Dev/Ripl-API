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
  getBot: () => getBot,
  getBotByToken: () => getBotByToken,
  renameBot: () => renameBot,
  resetBot: () => resetBot
});
var import_index = __toModule(require("./index"));
var import_uuid = __toModule(require("uuid"));
async function getBot(user) {
  let rsp = await import_index.db.get(`bot-${user.id}`);
  if (rsp) {
    return JSON.parse(rsp);
  } else {
    let botToken = (0, import_uuid.v4)() + "-" + (0, import_uuid.v4)();
    let data = {
      name: `${user.name}'s bot`,
      creatorId: user.id,
      creatorName: user.name,
      token: botToken
    };
    await import_index.db.set(`bot-${user.id}`, JSON.stringify(data));
    await import_index.db.set(`bot-token-${botToken}`, `bot-${user.id}`);
    return data;
  }
}
async function getBotByToken(token) {
  let bot = await import_index.db.get(`bot-token-${token}`);
  if (bot) {
    let fin = await import_index.db.get(bot);
    fin = JSON.parse(fin);
    return fin;
  } else {
    return null;
  }
}
async function resetBot(user) {
  let botToken = (0, import_uuid.v4)() + "-" + (0, import_uuid.v4)();
  let data = await getBot(user);
  await import_index.db.delete(`bot-token-${data.token}`);
  data.token = botToken;
  await import_index.db.set(`bot-token-${botToken}`, `bot-${user.id}`);
  await import_index.db.set(`bot-${user.id}`, JSON.stringify(data));
  return data;
}
async function renameBot(user, name) {
  let botData = await getBot(user);
  botData.name = name;
  await import_index.db.set(`bot-${user.id}`, JSON.stringify(botData));
  return botData;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getBot,
  getBotByToken,
  renameBot,
  resetBot
});
//# sourceMappingURL=BotRegistry.js.map
