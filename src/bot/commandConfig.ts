import { CommandConfig } from "./types";
import { tower } from "./commands";
import { towerRegister } from "./handlers/towerRegister";

export const commandConfig: CommandConfig[] = [
  {
    name: tower.name,
    command: tower,
    execute: towerRegister,
  },
];
