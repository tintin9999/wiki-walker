import { assign, fromPromise, setup } from "xstate";
import { api } from "./api";

export const gameMachine = setup({
  types: {
    context: {} as {
      moves: string[];
      start: string;
      end: string;
      curLinks: Record<string, string>;
    },
    events: {} as
      | { type: "start"; params: { start: string; end: string } }
      | { type: "playMove"; params: { move: string } }
      | { type: "reset" }
      | { type: "restart" }
      | { type: "setLinks"; links: string[] },
  },
  actors: {
    VerifyTerm: fromPromise(({ input }) => api.post("/verify/", input)),
    GrabLinks: fromPromise(async ({ input }) => {
      if (!input || !("term" in input)) return false;
      return api
        .get<Record<string, string>>(`/link/${input.term}`)
        .then((res) => res.data);
    }),
  },
  guards: {
    gameNotOver: ({ context }) =>
      context.moves[context.moves.length - 1] !== context.end,
  },
  schemas: {
    events: {
      Start: {
        type: "object",
        properties: {},
      },
      playMove: {
        type: "object",
        properties: {},
      },
      Restart: {
        type: "object",
        properties: {},
      },
      reset: {
        type: "object",
        properties: {},
      },
      restart: {
        type: "object",
        properties: {},
      },
    },
    context: {
      move: {
        type: "array",
        description: "array of moves",
      },
    },
  },
}).createMachine({
  context: {
    moves: [],
    start: "",
    end: "",
    curLinks: {},
  },
  id: "Game",
  initial: "InitialState",
  states: {
    InitialState: {
      on: {
        start: {
          target: "Verifying",
          actions: ({ context, event }) => {
            context.start = event.params.start;
            context.end = event.params.end;
          },
        },
      },
    },
    Verifying: {
      invoke: {
        input: ({ context }) => ({ terms: [context.start, context.end] }),
        onDone: {
          target: "Fetching",
        },
        onError: {
          target: "GameCantStart",
        },
        src: "VerifyTerm",
      },
    },
    GameStarted: {
      on: {
        playMove: [
          {
            target: "Fetching",
            guard: {
              type: "gameNotOver",
            },
          },
          {
            target: "GameFinished",
          },
        ],
      },
    },
    GameCantStart: {
      on: {
        restart: {
          target: "InitialState",
        },
      },
    },
    Fetching: {
      entry: assign(({ context, event }) => {
        context.moves.push(
          event.type === "playMove" ? event.params.move : context.start,
        );
        return context;
      }),
      invoke: {
        input: ({ context }) => ({
          term: context.moves[context.moves.length - 1] ?? context.start,
        }),
        onDone: {
          target: "GameStarted",
          actions: ({ context, event }) => {
            context.curLinks = event.output as Record<string, string>;
          },
        },
        onError: {
          target: "GameCantStart",
        },
        src: "GrabLinks",
      },
    },
    GameFinished: {
      on: {
        reset: {
          target: "InitialState",
        },
        restart: {
          target: "GameStarted",
        },
      },
    },
  },
});
