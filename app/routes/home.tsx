import { useState } from "react";
import Login from "./Login";

export default function Home() {
  const [name, setName] = useState("Hola Mundo")

  return <Login />
}