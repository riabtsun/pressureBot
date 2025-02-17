import { User } from "../Models/User";
import { MyContext } from "../types/MyContext";
import { isValidDate } from "../utils/validateDate";

export const registerHandler = async (ctx: MyContext) => {
  const existingUser = await User.findOne({ telegramId: ctx.from!.id });

  if (existingUser) {
    await ctx.reply("❌ Ви вже зареєстровані.");
    return;
  }

  // Начинаем процесс регистрации
  ctx.session.step = "WAITING_NAME";
  ctx.session.userData = {}; // Инициализируем userData в сессии
  await ctx.reply("✏ Введіть ваше ПІБ:");
};

export const handleRegistration = async (ctx: MyContext) => {
  if (!ctx.session.step) return;

  const telegramId = ctx.from!.id;
  const messageText = ctx.message?.text;

  if (!messageText) {
    await ctx.reply("❌ Повідомлення не містить тексту. Спробуйте ще раз.");
    return;
  }

  if (ctx.session.step === "WAITING_NAME") {
    // Сохраняем имя в сессии
    ctx.session.userData!.fullName = messageText;
    ctx.session.step = "WAITING_BIRTHDATE";
    await ctx.reply("📅 Тепер введіть вашу дату народження (дд.мм.гггг):");
  } else if (ctx.session.step === "WAITING_BIRTHDATE") {
    if (!isValidDate(messageText)) {
      await ctx.reply(
        "❌ Невірний формат або дата не існує. Використовуйте формат дд.мм.гггг."
      );
      return;
    }
    // Сохраняем дату рождения в сессии
    ctx.session.userData!.birthDate = messageText;
    const { fullName, birthDate } = ctx.session.userData!;

    // Проверяем, существует ли пользователь с таким telegramId
    const existingUser = await User.findOne({ telegramId });
    if (existingUser) {
      await ctx.reply("❌ Ви вже зареєстровані.");
      return;
    }

    // Создаем нового пользователя
    await User.create({
      telegramId,
      fullName,
      birthDate,
      records: [],
    });

    await ctx.reply(
      `✅ Реєстрація завершена!\n👤 ПІБ: ${fullName}\n📅 Дата народження: ${birthDate}`
    );

    // Очистка сессии
    ctx.session.step = null;
    ctx.session.userData = {};
  }
};
