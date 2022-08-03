import { redisClient } from "../app";

export const DEFAULT_EXPIRATION = 10368;

// const header = new Headers();
// @ts-ignore
// header.append("apikey", process.env.API_KEY);

export const requestOptions: RequestInit = {
  method: "GET",
  redirect: "follow",
  // @ts-ignore
  headers: {apikey: process.env.API_KEY},
};

export default async function convertCurrency(
  amount: number,
  currency: string
) {
  return amount / (await getOrSetCache(currency));
}

function getOrSetCache(key: string): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const value = await redisClient.get(key);

    if (value) return resolve(parseFloat(value));

    console.log("Cache miss");

    let data;

    await fetch(
      "https://api.apilayer.com/exchangerates_data/latest?base=IDR",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        data = result;
      })
      .catch((error) => console.log("error", error));

    Object.fromEntries(
      // @ts-ignore
      Object.entries(data.rates).map(
        // @ts-ignore
        async ([k, v]: [string, number], i: number) => {
          // @ts-ignore
          await redisClient.setEx(k, DEFAULT_EXPIRATION, v.toString());
        }
      )
    );

    // @ts-ignore
    return resolve(data.rates[key]);
  });
}
