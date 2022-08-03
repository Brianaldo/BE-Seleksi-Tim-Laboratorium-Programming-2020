import { Router } from "express";
import { redisClient } from "../app";
import {
  DEFAULT_EXPIRATION,
  requestOptions,
} from "../services/convertCurrency";

const router = Router();

router.get("/currency", async (req, res) => {
  try {
    let keys = await redisClient.keys("*");

    if (keys.length != 0) {
      return res.json(keys);
    }
    console.log("Cache miss");
    let data;

    await fetch(
      "https://api.apilayer.com/exchangerates_data/latest?base=IDR",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        data = result;
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
      });

    return res.json(await redisClient.keys("*"));
  } catch (e) {
    return res.sendStatus(500);
  }
});

export { router as currency };
