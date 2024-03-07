import { useMachine } from "@xstate/react";
import { StartEndInput } from "./components/StartEndInput";
import { gameMachine } from "./state";

const Debugger = ({ state }: { state: unknown }) => {
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
};

const Terms = ({
  links,
  playMove,
}: {
  links: Record<string, string>;
  playMove: (move: string) => void;
}) => {
  return (
    <div>
      {Object.entries(links)
        .slice(0, 10)
        .map(([name]) => (
          <span>
            <button onClick={() => playMove(name)}>{name}</button>
          </span>
        ))}
    </div>
  );
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
      <Terms
        links={state.context.curLinks}
        playMove={(move: string) => {
          send({ type: "playMove", params: { move: move } });
        }}
      />
      <Debugger state={state} />
    </div>
  );
}

export default App;
