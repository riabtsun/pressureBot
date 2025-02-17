import { Context, SessionFlavor } from "grammy";
import { UserSessionData } from "./userSesionData";

export type MyContext = Context & SessionFlavor<UserSessionData>;
