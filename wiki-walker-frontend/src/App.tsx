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
      {Object.entries(links).map(([name]) => (
        <span key={name}>
          <button onClick={() => playMove(name)}>{name}</button>
        </span>
      ))}
    </div>
  );
};

const StartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

function App() {
  const [state, send] = useMachine(gameMachine);

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <StartContainer>
        <StartEndInput
          classNames={{
            inputContainers: "flex space-x-4",
          }}
          startGame={(start, end) => {
            send({ type: "start", params: { start, end } });
          }}
        />
      </StartContainer>
      <div>
        <Terms
          links={state.context.curLinks}
          playMove={(move: string) => {
            send({ type: "playMove", params: { move: move } });
          }}
        />
        <Debugger state={state} />
      </div>
    </main>
  );
}

export default App;
