import { ICard } from "./Card";

export interface Theme {
  prompt: string
  cards: ICard[];
  activeDate?: Date
}
