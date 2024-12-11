import axios from "axios";
import { usePoller } from "eth-hooks";
import { useState } from "react";
import { ETHERSCAN_KEY } from "../constants";

export default function useGasPrice(targetNetwork, speed = "FastGasPrice", pollTime = 39999) {
  const [gasPrice, setGasPrice] = useState();

  const loadGasPrice = async () => {
    if (targetNetwork.hasOwnProperty("gasPrice")) {
      setGasPrice(targetNetwork.gasPrice);
    } else {
      try {
        const response = await axios.get(
          `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_KEY}`,
        );
        console.log("response gas: ", response);
        const newGasPrice = response.data.result[speed] * 1e9; // 转换为 wei
        if (newGasPrice !== gasPrice) {
          setGasPrice(newGasPrice);
        }
      } catch (error) {
        console.error("Error fetching gas price: ", error);
      }
    }
  };

  usePoller(loadGasPrice, pollTime);
  return gasPrice;
}
