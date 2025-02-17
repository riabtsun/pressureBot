import { Bot, session, MemorySessionStorage } from "grammy";
import { ISession, MongoDBAdapter } from "@grammyjs/storage-mongodb";
import { MongoClient } from "mongodb";
import { connectDB } from "./Providers/db";
import { registerHandler, handleRegistration } from "./Controllers/register";
import { startHandler } from "./Controllers/start";
import {
  editProfileHandler,
  handleEditProfile,
} from "./Controllers/edit_profile";
import { UserSessionData } from "./types/userSesionData";
import { MyContext } from "./types/MyContext";
import dotenv from "dotenv";
import { addRecordHandler, handleAddRecord } from "./Controllers/add_record";

const client = new MongoClient(process.env.MONGO_URI!);
const db = client.db("pacientDB");
const sessions = db.collection<ISession>("sessions");

dotenv.config();

const bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

bot.use(
  session({
    // initial: (): UserSessionData => ({ step: "WAITING_NAME" }),
    storage: new MongoDBAdapter({ collection: sessions }),
  })
);

bot.command("start", startHandler);
bot.command("register", async (ctx) => {
  await registerHandler(ctx as MyContext);
});
bot.command("edit_profile", async (ctx) => {
  await editProfileHandler(ctx as MyContext);
});
bot.command("add_record", async (ctx) => {
  await addRecordHandler(ctx as MyContext);
});
bot.on("message:text", async (ctx: MyContext) => {
  if (
    ctx.session?.step === "WAITING_NAME" ||
    ctx.session?.step === "WAITING_BIRTHDATE"
  ) {
    await handleRegistration(ctx);
  } else if (
    ctx.session?.step === "EDIT_NAME" ||
    ctx.session?.step === "EDIT_BIRTHDATE"
  ) {
    await handleEditProfile(ctx);
  } else if (
    ctx.session?.step === "WAITING_MORNING_BP" ||
    ctx.session?.step === "WAITING_MORNING_PULSE" ||
    ctx.session?.step === "WAITING_EVENING_BP" ||
    ctx.session?.step === "WAITING_EVENING_PULSE"
  ) {
    await handleAddRecord(ctx);
  }
});

connectDB().then(() => {
  bot.start();
  console.log("🤖🚀 Бот запущен!");
});
