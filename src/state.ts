import { fromPromise, setup } from "xstate";

export const gameMachine = setup({
  types: {
    context: {} as {
      moves: string[];
      start: string;
      end: string;
      curLinks: string[];
    },
    events: {} as
      | { type: "start"; params: { start: string; end: string } }
      | { type: "playMove" }
      | { type: "reset" }
      | { type: "restart" },
  },
  actors: {
    VerifyTerm: fromPromise(async ({ input }) => {
      console.log("getting here", input);
      const response = await fetch(`http://localhost:8080/verify/`, {
        method: "POST",
        body: JSON.stringify(input),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resp = await response.json();
      console.log(resp);
      return resp;
    }),
    GrabLinks: fromPromise(async ({ input }) => {
      const response = await fetch(`http://localhost:8080/link/${input.term}`);
      const resp = await response.json();
      console.log(resp);
    }),
  },
  guards: {
    gameNotOver: function ({}) {
      return false;
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
    curLinks: [],
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
          target: "GameStarted",
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
      invoke: {
        input: {
          term: "string",
        },
        onDone: {
          target: "GameStarted",
        },
        onError: {
          target: "GameCantStart",
        },
        src: "VerifyTerm",
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
