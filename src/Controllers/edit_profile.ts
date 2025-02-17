import { User } from "../Models/User";
import { MyContext } from "../types/MyContext";
import { isValidDate } from "../utils/validateDate";

export const editProfileHandler = async (ctx: MyContext) => {
  // Проверяем, есть ли уже сессия
  if (!ctx.session) {
    ctx.session = {}; // Инициализация сессии, если её нет
  }

  const user = await User.findOne({ telegramId: ctx.from!.id });

  if (!user) {
    await ctx.reply("❌ Ви не зареєстровані. Використайте команду /register.");
    return;
  }

  // Логирование текущей сессии
  console.log("Starting edit profile process");
  console.log(`Current session before update: ${JSON.stringify(ctx.session)}`);

  // Проверяем, если шаг не установлен, начинаем с редактирования имени
  if (!ctx.session.step) {
    ctx.session.step = "EDIT_NAME"; // Начинаем с редактирования имени
  }

  // Инициализируем userData в сессии
  ctx.session.userData = ctx.session.userData || {};

  // Сообщение с текущим именем пользователя
  await ctx.reply(`✏ Введіть нові ПІБ (поточні: ${user.fullName}):`);

  // Логируем изменения сессии после старта процесса
  console.log(`Session after step update: ${JSON.stringify(ctx.session)}`);
};

export const handleEditProfile = async (ctx: MyContext) => {
  const user = await User.findOne({ telegramId: ctx.from!.id });

  if (!user) {
    await ctx.reply("❌ Ви не зареєстровані.");
    return;
  }

  const messageText = ctx.message?.text?.trim();

  if (!messageText) {
    await ctx.reply("❌ Повідомлення не містить тексту. Спробуйте ще раз.");
    return;
  }

  if (ctx.session.step === "EDIT_NAME") {
    // Обновляем имя пользователя
    user.fullName = messageText;
    await user.updateOne(
      { telegramId: ctx.from!.id },
      { $set: { fullName: messageText } }
    );
    await user.save(); // Сохраняем изменения

    // Переход к следующему шагу
    ctx.session.step = "EDIT_BIRTHDATE";
    await ctx.reply(
      `📅 Тепер введіть нову дату народження (поточна: ${user.birthDate}):`
    );

    // Логируем изменения сессии
    console.log(`Session after name update: ${JSON.stringify(ctx.session)}`);
  } else if (ctx.session.step === "EDIT_BIRTHDATE") {
    if (!isValidDate(messageText)) {
      await ctx.reply(
        "❌ Невірний формат або дата не існує. Використовуйте формат дд.мм.гггг."
      );
      return;
    }
    // Обновляем дату рождения
    user.birthDate = messageText;
    await user.updateOne(
      { telegramId: ctx.from!.id },
      { $set: { birthDate: messageText } }
    );
    user.save();
    await ctx.reply(`✅ Дані оновлено!`);
    ctx.session.step = null; // Очистка шага
    ctx.session.userData = {}; // Очистка userData

    // Логируем завершение процесса
    console.log(
      `Session after birthdate update: ${JSON.stringify(ctx.session)}`
    );
  }
};
