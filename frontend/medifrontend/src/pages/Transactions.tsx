import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import abi from "../abi/MediChain.json";

const contractAddress = "0x4f22aea0b3706dE2d8FC2E8D18C988181ebFAAdC";
const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/kuCYTXz3No2igP5GtwZMy";
const API_KEY = "FAJXKCR16N2YZDFK78HQNJQUMIPKPRH5EH"

const Transactions = () => {
  const [txData, setTxData] = useState([]);

  useEffect(() => {
async function fetchTx() {
  try {
    const res = await fetch(

  `https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`
); 

    const data = await res.json();

    console.log("etherscan data:", data);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const iface = new ethers.Interface(abi.abi);

    const formatted = data.result.map((tx: any) => {
  let method = "Transfer";

  try {
    const decoded = iface.parseTransaction({
      data: tx.input,
    });
    method = decoded.name;
  } catch {}

  return {
    hash: tx.hash,
    method,
    block: tx.blockNumber,
    from: tx.from,
    to: tx.to,
    time: new Date(Number(tx.timeStamp) * 1000).toLocaleString(),
    gas: ethers.formatEther(
      BigInt(tx.gasUsed) * BigInt(tx.gasPrice)
    ),
  };
});

    setTxData(formatted);
  } catch (err) {
    console.error(err);
  }
}

    fetchTx();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Contract Activity (RPC)</CardTitle>
        </CardHeader>

        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tx Hash</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Gas</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {txData.map((tx) => (
                <TableRow key={tx.hash}>
                  <TableCell className="font-mono text-xs text-blue-500">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tx.hash.slice(0, 12)}...
                    </a>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{formatMethod(tx.method)}</Badge>
                  </TableCell>

                  <TableCell>{tx.block}</TableCell>

                  <TableCell className="font-mono text-xs">
                    {short(tx.from)}
                  </TableCell>

                  <TableCell className="font-mono text-xs">
                    {short(tx.to)}
                  </TableCell>

                  <TableCell className="text-xs">{tx.time}</TableCell>

                  <TableCell className="text-xs">{tx.gas} ETH</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// helpers
function short(addr: string) {
  if (!addr) return "-";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatMethod(method: string) {
  const map: any = {
    registerMedicine: "Register Medicine",
    updateShipment: "Shipment Update",
    confirmReceipt: "Delivery",
  };

  return map[method] || method;
}

export default Transactions;
