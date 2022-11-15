import { Hook, Main, Trigger } from "./core";

const initTrigger = () => {
  Trigger.resetTriggers();
  Trigger.setTriggers();
};

// @ts-expect-error
global.initTrigger = initTrigger;
// @ts-expect-error
global.main = Main.fetch;
// @ts-expect-error
global.onOpen = Hook.onOpen;
// @ts-expect-error
global.registerMenu = Hook.registerMenu;
// @ts-expect-error
global.doGet = Hook.doGet;
// @ts-expect-error
global.savePropertiesFromForm = Hook.savePropertiesFromForm;
// @ts-expect-error
global.resetTriggers = Trigger.resetTriggers;
