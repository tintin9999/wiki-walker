import { useMachine } from "@xstate/react";
import { StartEndInput } from "./components/StartEndInput";
import { gameMachine } from "./state";

const Terms = ({
  links,
  playMove,
}: {
  links: Record<string, string>;
  playMove: (move: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      {Object.entries(links).filter(([, link]) => {
        return !link.includes('Main_Page')
      }).map(([name]) => (
        <span
          className="bg-gray-200 p-2 rounded-md"
          key={name}
        >
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
    <main className="flex min-h-screen flex-col items-center justify-center">
      <StartContainer>
        <StartEndInput
          classNames={{
            inputContainers: "flex space-x-4",
            container: "flex flex-col",
            btnContainer: "flex justify-center my-4",
          }}
          startGame={(start, end) => {
            send({ type: "start", params: { start, end } });
          }}
        />
      </StartContainer>
      <div className="mx-12">
        <Terms
          links={state.context.curLinks}
          playMove={(move: string) => {
            send({ type: "playMove", params: { move: move } });
          }}
        />
      </div>
    </main>
  );
}

export default App;
