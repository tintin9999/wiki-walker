import { useState } from "react";
import { RenderIf } from "./utils";

export const StartEndInput = ({
  startGame,
}: {
  startGame: (start: string, end: string) => void;
}) => {
  const [state, setState] = useState({
    start: {
      value: "",
      error: "",
    },
    end: {
      value: "",
      error: "",
    },
  });

  const updateState = (key: "start" | "end", value: string) => {
    setState((state) => ({
      ...state,
      [key]: {
        value,
        error: "",
      },
    }));
  };

  const setError = (key: "start" | "end", error: string) => {
    setState((state) => ({
      ...state,
      [key]: {
        ...state[key],
        error,
      },
    }));
  };

  return (
    <div>
      <div>
        <div>
          <label>Start Term</label>
          <input
            type="text"
            value={state.start.value}
            onChange={(e) => updateState("start", e.target.value)}
          />
          <RenderIf isTrue={state.start.error}>
            <div>{state.start.error}</div>
          </RenderIf>
        </div>
        <div>
          <label>End Term</label>
          <input
            type="text"
            value={state.end.value}
            onChange={(e) => updateState("end", e.target.value)}
          />
          <RenderIf isTrue={state.end.error}>
            <div>{state.end.error}</div>
          </RenderIf>
        </div>
      </div>
      <div>
        <button
          onClick={() => {
            let hasError = false;
            if (!state.start.value) {
              setError("start", "Start term is required");
              hasError = true;
            }

            if (!state.end.value) {
              setError("end", "End term is required");
              hasError = true;
            }

            if (hasError) return;

            startGame(state.start.value, state.end.value);
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};
