import { useState } from "react";
import { RenderIf } from "./utils";
import { TextInput } from "./ControlledInput";
import { Button } from "./ui/button";

export const StartEndInput = ({
  startGame,
  classNames,
}: {
  startGame: (start: string, end: string) => void;
  classNames?: {
    container?: string;
    inputContainers?: string;
    startContainer?: string;
    endContainer?: string;
    btnContainer?: string;
  };
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
    <div className={classNames?.container}>
      <div className={classNames?.inputContainers}>
        <div className={classNames?.startContainer}>
          <TextInput
            name="start"
            state={state}
            label="Start Term"
            setState={setState as any}
          />
          <RenderIf isTrue={state.start.error}>
            <div>{state.start.error}</div>
          </RenderIf>
        </div>
        <div className={classNames?.endContainer}>
          <TextInput
            name="end"
            state={state}
            label="End Term"
            setState={setState as any}
          />
          <RenderIf isTrue={state.end.error}>
            <div>{state.end.error}</div>
          </RenderIf>
        </div>
      </div>
      <div className={classNames?.btnContainer}>
        <Button
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
        </Button>
      </div>
    </div>
  );
};
