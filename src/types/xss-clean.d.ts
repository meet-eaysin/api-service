declare module 'xss-clean' {
  const value: () => (req: any, res: any, next: any) => void;
  export default value;
}
