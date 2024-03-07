import { assign, fromPromise, setup } from "xstate";
import { api } from "./api";

export const gameMachine = setup({
  types: {
    context: {} as {
      moves: string[];
      start: string;
      end: string;
      curLinks: Record<string, string>;
      error: {
        message: string;
        error: "VERIFY_FAIL" | "FETCH_FAIL";
      } | null;
    },
    events: {} as
      | { type: "start"; params: { start: string; end: string } }
      | { type: "playMove"; params: { move: string } }
      | { type: "reset" }
      | { type: "restart" }
      | { type: "setLinks"; links: string[] },
  },
  actors: {
    VerifyTerm: fromPromise(async ({ input }) => {
      const { data } = await api.post<Record<string, boolean>>(
        "/verify/",
        input,
      );

      if (Object.values(data).every((val) => val)) return true;

      return Promise.reject(data);
    }),
    GrabLinks: fromPromise(async ({ input }) => {
      if (!input || !("term" in input)) return false;
      return api
        .get<Record<string, string>>(`/link/${input.term}`)
        .then((res) => res.data);
    }),
  },
  guards: {
    gameNotOver: ({ context }) => {
      console.log("happening?", context);
      return context.moves[context.moves.length - 1] !== context.end;
    },
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
    error: null,
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
          actions: ({ context }) => {
            context.error = {
              message: "Failed to verify terms woops",
              error: "VERIFY_FAIL",
            };
          },
        },
        src: "VerifyTerm",
      },
    },
    PreGameBullShitState: {
      always: [
        {
          target: "GameStarted",
          guard: {
            type: "gameNotOver",
          },
        },
        {
          target: "GameFinished",
        },
      ],
    },
    GameStarted: {
      on: {
        playMove: [
          {
            target: "Fetching",
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
          target: "PreGameBullShitState",
          actions: ({ context, event }) => {
            context.curLinks = event.output as Record<string, string>;
          },
        },
        onError: {
          target: "GameCantStart",
          actions: ({ context }) => {
            context.error = {
              message: "Failed to fetch term links woops",
              error: "FETCH_FAIL",
            };
          },
        },
        src: "GrabLinks",
      },
    },
    GameFinished: {
      entry: assign(({ context }) => {
        context.curLinks = {};
        return context;
      }),
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
