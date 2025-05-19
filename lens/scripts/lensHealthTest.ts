import fetch from "node-fetch";

const main = async () => {
  const res = await fetch("https://api.testnet.lens.xyz/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: "{ health }",
    }),
  });

  const text = await res.text();
  console.log("Raw Response:");
  console.log(text);
};

main();
