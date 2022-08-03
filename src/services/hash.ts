import { createHash } from "crypto";

export default function hash(password: string): string {
  // @ts-ignore
  return createHash(process.env.PW_HASH_TYPE)
    .update(password, "utf-8")
    .digest("hex");
}
