import { NextResponse } from "next/server";

export async function GET() {
try{ 
  const res = await fetch("https://ifconfig.me/ip")
  const data = await res.text();
  return NextResponse.json({ ip: data.trim() });
} catch((error) => {
      console.error("Error fetching data:", error);
      return NextResponse.json({ error: "Failed to fetch IP" }, { status: 500 });
    }
}




  useEffect(() => {
    const fetchIP = async () => {
      try {
        const res = await fetch("https://ifconfig.me/ip");
        const data = await res.text();
        setIp(data.trim());
      } catch (error) {
        console.error("Error fetching IP:", error);
      }
    };
    fetchIP();
  }, []); // Empty dependency array ensures this runs only once on component mount
