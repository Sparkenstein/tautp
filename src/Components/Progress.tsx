import { Progress } from "@mantine/core";
import { useEffect, useState } from "react";

export const Progressbar = () => {
  const [time, setTime] = useState(() => {
    let currentSeconds = Math.floor(Date.now() / 1000);
    return 30 - (currentSeconds % 30);
  });

  useEffect(() => {
    let currentSeconds = Math.floor(Date.now() / 1000);
    let time = 30 - (currentSeconds % 30);
    const interval = setInterval(() => {
      currentSeconds = Math.floor(Date.now() / 1000);
      time = 30 - (currentSeconds % 30);
      setTime(time);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Progress.Root
      size={"xl"}
      radius={0}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <Progress.Section
        color={time < 10 ? "red" : "blue"}
        value={(time / 30) * 100}
      >
        <Progress.Label>{time}</Progress.Label>
      </Progress.Section>
    </Progress.Root>
  );
};
