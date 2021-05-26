export type Maybe<A> = A | undefined;

export type Redraw = () => void;

export type NumberPair = [number, number];

export type MouchEvent = Event & Partial<MouseEvent & TouchEvent>;

export type UserMove = (uciS: string, fen: string) => Promise<string>;
