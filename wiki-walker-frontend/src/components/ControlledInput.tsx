import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SetStateAction } from "react";

export type TextInputSetState = SetStateAction<
  Record<string, { value: string; error: string }>
>;

interface IControlledTextInputProps {
  name: string;
  label: string;
  state: Record<string, { value: string; error: string }>;
  setState: (state: TextInputSetState) => void;
}

export const TextInput = ({
  label,
  name,
  state,
  setState,
}: IControlledTextInputProps) => {
  const updateState = (value: string) => {
    setState((state) => ({
      ...state,
      [name]: {
        value,
        error: "",
      },
    }));
  };

  return (
    <>
      <Label>{label}</Label>
      <Input
        type="text"
        value={state[name].value}
        onChange={(e) => updateState(e.target.value)}
      />
    </>
  );
};
