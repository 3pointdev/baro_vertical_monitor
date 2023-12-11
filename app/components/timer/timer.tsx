import dayjs, { Dayjs } from "dayjs";
import { StyleColor } from "public/color";
import { useEffect, useState } from "react";
import styled from "styled-components";

export default function Timer() {
  const [time, setTime] = useState<Dayjs>(null);

  const getTime = () => {
    return dayjs();
  };

  useEffect(() => {
    setTime(getTime());
    const interval = setInterval(() => {
      setTime(getTime());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <TimeWrap>
      <Date>{dayjs(time).format("YYYY.MM.DD")}</Date>
      <Time>{dayjs(time).format("HH:mm:ss")}</Time>
    </TimeWrap>
  );
}

const TimeWrap = styled.div`
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  gap: 24px;
`;

const Date = styled.span`
  flex-shrink: 0;
  font-weight: 600;
  max-width: fit-content;
  color: ${StyleColor.DARK}95;
  font-size: 3.4vh;
  font-weight: 400;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

const Time = styled.span`
  flex-shrink: 0;
  font-weight: 600;
  min-width: fit-content;
  color: ${StyleColor.DARK}95;
  font-size: 3.4vh;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  text-align: start;
`;
