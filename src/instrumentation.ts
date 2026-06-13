export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapKeys } = await import("./lib/keys");
    await bootstrapKeys();
  }
}
