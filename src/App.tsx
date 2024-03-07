import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import { gameMachine } from "./state";

interface ITopInputAndVerifyButtonProps {
  setStart: (state: string) => void;
  setEnd: (state: string) => void;
  end: string;
  start: string;
  updateGameState: {
    startGame: () => void;
    endGame: () => void;
  };
}

function TopInputAndVerifyButton(props: ITopInputAndVerifyButtonProps) {
  const { start, end, setStart, setEnd, updateGameState } = props;

  return (
    <div>
      <div>
        <div>
          <label>Start</label>
          <input
            type="text"
            value={start}
            onChange={(evt) => setStart(evt.target.value)}
          />
        </div>
        <div>
          <label>End</label>
          <input
            type="text"
            value={end}
            onChange={(evt) => setEnd(evt.target.value)}
          />
        </div>
      </div>
      <div>
        <button onClick={() => updateGameState.startGame()}>Start</button>
      </div>
    </div>
  );
}

interface IGameProps {
  start: string;
  end: string;
  gameState: TGameState;
}

interface IUpdatableLink {
  text: string;
  onClick: (text: string) => void;
}

function UpdatableLink(props: IUpdatableLink) {
  return (
    <span
      onClick={() => props.onClick(props.text)}
      style={{ cursor: "pointer" }}
    >
      {decodeURIComponent(props.text)}
    </span>
  );
}

function useDebounce<T>(state: T, delay = 300) {
  const [debouncedState, setDebouncedState] = useState(state);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedState(state);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [state, delay]);

  return debouncedState;
}

function getTermFromLink(link: string) {
  return link.replace("/wiki/", "");
}

function formatLinks(linkByName: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(linkByName).map(([name, link]) => {
      return [name, decodeURIComponent(link)];
    }),
  );
}

function Game(props: IGameProps) {
  const [current, setCurrent] = useState(props.start);
  const [links, setLinks] = useState<{
    term: string;
    data: Record<string, string>;
  }>({
    term: props.start,
    data: {},
  });
  const debouncedCurrent = useDebounce(current);

  useEffect(() => {
    setCurrent(props.start);
  }, [props.start]);

  useEffect(() => {
    if (debouncedCurrent === "" || props.gameState !== "started") return;

    const getLinks = async () => {
      const data = await (
        await fetch(`http://localhost:8080/link/${debouncedCurrent}`, {
          method: "POST",
        })
      ).json();
      setLinks({
        data: formatLinks(data),
        term: debouncedCurrent,
      });
    };

    getLinks().catch(() => console.error("error"));
  }, [debouncedCurrent]);

  const debouncedHasCaughtUp = debouncedCurrent === current;
  const linksArrived = links.term === current;

  return (
    <>
      <div>
        {debouncedCurrent}
        <RenderIf
          isTrue={
            (!debouncedHasCaughtUp || !linksArrived) && debouncedCurrent !== ""
          }
        >
          <div>Loading...</div>
        </RenderIf>
      </div>
      <RenderIf isTrue={debouncedHasCaughtUp && linksArrived}>
        {Object.entries(links.data).map(([text, link]) => (
          <div key={link + ":" + text}>
            {text} -{" "}
            <UpdatableLink
              text={link}
              onClick={() => setCurrent(getTermFromLink(link))}
            />
          </div>
        ))}
      </RenderIf>
    </>
  );
}

const RenderIf = ({
  isTrue,
  children,
}: {
  isTrue: unknown;
  children: React.ReactNode;
}) => {
  return isTrue ? children : null;
};

const StartEndInput = ({
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

const Debugger = ({ state }: { state: unknown }) => {
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
};

function App() {
  const [state, send] = useMachine(gameMachine);

  return (
    <div>
      <StartEndInput
        startGame={(start, end) => {
          send({ type: "start", params: { start, end } });
        }}
      />
      <Debugger state={state} />
    </div>
  );
}

export default App;
