export function defineVariables<T>() {
  return <C extends T>(value: C) => value;
}
