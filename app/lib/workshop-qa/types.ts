export type QaRoomId = "debate-painel-1" | "debate-painel-2";

export type QaQuestionStatus = "pending" | "approved" | "answered" | "hidden";

export type QaQuestion = {
  id: string;
  room: QaRoomId;
  text: string;
  author: string;
  status: QaQuestionStatus;
  createdAt: number;
};
