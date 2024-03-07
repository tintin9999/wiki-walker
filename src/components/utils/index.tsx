export const RenderIf = ({
  isTrue,
  children,
}: {
  isTrue: unknown;
  children: React.ReactNode;
}) => {
  return isTrue ? children : null;
};
