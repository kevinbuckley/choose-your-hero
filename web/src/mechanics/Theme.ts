import { ICard } from "./Card";

export interface Theme {
  prompt: string
  modifier: string
  cards: ICard[];
}
