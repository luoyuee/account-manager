export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initialize } = await import("./lib/initialize");
    await initialize();
  }
};
