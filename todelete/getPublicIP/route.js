import { NextResponse } from "next/server";

export async function GET() {
  let ip = "";
  try {
    const res = await fetch("https://ifconfig.me/ip");
    const text = await res.text();
    ip = text.trim();
    console.log("ip=", ip);
    return new Response(ip, { status: 200 });
    // return <div>Your PublicIP: {ip}</div>;
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch text" },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   const res = await fetch("https://ifconfig.me/ip")
//     .then((res) => res.text())
//     .catch((error) => {
//       console.error("Error fetching data:", error);
//       //   return NextResponse.json(
//       //     { error: "Failed to fetch IP" },
//       //     { status: 500 }
//       //   );
//     });
//   console.log("res=", res);
//   //   NextResponse.json({ res: res }, { status: 200 });
//   //   return res;
//   let ip = { ip: res };
//   //   return Response.json(ip);
//   return new Response("Hello, Next.js! `res`", {
//     status: 200,
//   });
// }
