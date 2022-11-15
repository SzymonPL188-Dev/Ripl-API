import { ReplitUserData } from "./Connection";
import { db } from "./index";
import { v4 as uuid } from 'uuid';

interface BotData {
  name: string;
  creatorId: number;
  creatorName: string;
  token: string;
}

export async function getBot(user: ReplitUserData) {
  let rsp = await db.get(`bot-${user.id}`);
  if(rsp) {
    return JSON.parse(rsp);
  } else {
    let botToken = uuid() + "-" + uuid();

    let data: BotData = {
      name: `${user.name}'s bot`,
      creatorId: user.id,
      creatorName: user.name,
      token: botToken
    };

    await db.set(`bot-${user.id}`, JSON.stringify(data));
    await db.set(`bot-token-${botToken}`, `bot-${user.id}`);
    return data;
  }
}

export async function getBotByToken(token: string) {
  let bot = await db.get(`bot-token-${token}`);
  if(bot) {
    let fin = await db.get(bot);
    fin = JSON.parse(fin);
    return fin;
  } else {
    return null;
  }
}

export async function resetBot(user: ReplitUserData) {
  let botToken = uuid() + "-" + uuid();
  let data = await getBot(user);
  await db.delete(`bot-token-${data.token}`)
  data.token = botToken;
  await db.set(`bot-token-${botToken}`, `bot-${user.id}`);
  await db.set(`bot-${user.id}`, JSON.stringify(data));
  return data;
}

export async function renameBot(user: ReplitUserData, name: string) {
  let botData = await getBot(user);
  botData.name = name;
  await db.set(`bot-${user.id}`, JSON.stringify(botData));
  return botData;
}