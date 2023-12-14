import dayjs from "dayjs";
import machineStatusInstance from "modules/machineStatus.module";
import timeInstance from "modules/time.module";
import { StyleColor } from "public/color";
import { useEffect, useRef, useState } from "react";
import { MachineExecutionType, MachineTextType } from "src/config/constants";
import MachineDto from "src/dto/machine/machine.dto";
import styled from "styled-components";

interface IProps {
  data: MachineDto;
}

export default function MonitorItem({ data }: IProps) {
  const [executionText, setExecutionText] = useState<MachineTextType>(
    MachineTextType.MODIFY
  );
  const [executionColor, setExecutionColor] = useState<string>("");
  const onCoverStatus: MachineTextType[] = [
    MachineTextType.OFF,
    MachineTextType.MODIFY,
  ];
  const [realTime, setRealTime] = useState<number>(data.remainTime);
  const realTimeRef = useRef<number>(null);
  const [realTimeInterval, setRealTimeInterval] = useState<any>();
  const [isOnCover, setIsOnCover] = useState(false);
  const [endTime, setEndTime] = useState<string>("-");

  /**
   * execution이 active일때 타이머 작동함수
   */
  useEffect(() => {
    realTimeRef.current = data.remainTime;
    if (data.execution === MachineExecutionType.ACTIVE) {
      const interval = setInterval(() => {
        realTimeRef.current = realTimeRef.current - 1000;
        setRealTime(realTimeRef.current);
      }, 1000);
      setRealTimeInterval(interval);
    } else {
      clearInterval(realTimeInterval);
      setRealTimeInterval(null);
    }
  }, [data.execution]);

  /**
   * 머신상태에 따라 텍스트, 색상 변경함수
   */
  useEffect(() => {
    setExecutionText(
      machineStatusInstance.ToTextStatus(
        data.execution,
        data.mode,
        data.pause,
        data.isReceiveMessage,
        data.isReceivePartCount,
        data.isChangePalette
      )
    );
    setExecutionColor(
      machineStatusInstance.ToColorStatus(
        data.execution,
        data.mode,
        data.pause,
        data.isReceiveMessage
      )
    );
  }, [
    data.execution,
    data.mode,
    data.pause,
    data.isReceiveMessage,
    data.isReceivePartCount,
    data.isChangePalette,
  ]);

  useEffect(() => {
    setIsOnCover(onCoverStatus.includes(executionText));
  }, [executionText]);

  useEffect(() => {
    const time =
      data.partCount > 5
        ? dayjs(data.prdctEnd).format("MM/DD HH:mm")
        : "계산 대기 중";
    if (time) {
      setEndTime(time);
    } else {
      setEndTime("-");
    }
  }, [data.prdctEnd]);

  useEffect(() => {
    return () => {
      clearInterval(realTimeInterval);
    };
  }, []);

  return (
    <Container className="monitoring_item">
      <Header.Wrap>
        <Header.Left>{data.worker}</Header.Left>
        <Header.Right>
          <Header.Count>
            {executionText !== MachineTextType.OFF &&
              `${data.partCount} / ${data.planCount}`}
          </Header.Count>
          <Header.Lot>
            {executionText !== MachineTextType.OFF && data.program}
          </Header.Lot>
        </Header.Right>
      </Header.Wrap>
      <RealTimeInfo.Wrap>
        <RealTimeInfo.TrafficLights color={executionColor} />
        <RealTimeInfo.Number>{data.machineNo}</RealTimeInfo.Number>
        <RealTimeInfo.CycleTime
          className={
            realTime <= 0 &&
            data.execution === MachineExecutionType.ACTIVE &&
            !data.pause
              ? "zero"
              : ""
          }
        >
          {executionText === MachineTextType.ACTIVE
            ? timeInstance.msToHHMM(realTime > 0 ? realTime : 0)
            : isOnCover
            ? ""
            : executionText}
        </RealTimeInfo.CycleTime>
      </RealTimeInfo.Wrap>
      <Footer.Wrap>
        <Footer.Progress progress={(data.partCount / data.planCount) * 100} />
        <Footer.Mid>{data.mid}</Footer.Mid>
        <Footer.EndTime>{!isOnCover && endTime}</Footer.EndTime>
      </Footer.Wrap>
      {isOnCover && <StopCover>{executionText}</StopCover>}
    </Container>
  );
}

const Container = styled.li`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 16px;
  overflow: hidden;
  background: ${StyleColor.LIGHT};

  & > * {
    flex-shrink: 0;
  }
`;

const StopCover = styled.div`
  z-index: 2;
  position: absolute;
  top: 0px;
  left: 0px;
  background: ${StyleColor.DARKBACKGROUND}9;
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  color: ${StyleColor.LIGHT};
  font-size: 9vh;
  font-family: "pretendard", monospace;
  font-weight: 700;
`;
const Header = {
  Wrap: styled.div`
    z-index: 1;
    display: flex;
    height: 28%;
    align-items: start;
    justify-content: space-between;
    padding: 8px 16px;
  `,
  Left: styled.p`
    font-size: 4vh;
    font-weight: 600;
    line-height: 4vh;
    color: ${StyleColor.LIGHT};
    position: relative;
  `,
  Right: styled.div`
    display: flex;
    flex-direction: column;
  `,
  Count: styled.p`
    font-size: 2.8vh;
    line-height: 1;
    color: ${StyleColor.DARKBACKGROUND}9;
    font-weight: 600;
    text-align: end;
  `,
  Lot: styled.p`
    flex-shrink: 0;
    width: 100%;
    font-size: 2.8vh;
    line-height: 1;
    color: ${StyleColor.DARK};
    font-weight: 600;
    white-space: nowrap;
    text-align: end;
  `,
};

const RealTimeInfo = {
  Wrap: styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    position: relative;
  `,
  TrafficLights: styled.div<{ color: string }>`
    position: absolute;
    left: -16vw;
    top: -24vw;
    width: 50vw;
    height: 50vw;
    background: ${({ color }) => color};
    border-radius: 50%;
  `,
  Number: styled.p`
    font-size: 7.2vh;
    font-weight: 600;
    line-height: 6.2vh;
    color: ${StyleColor.LIGHT};
    position: relative;
  `,
  CycleTime: styled.p`
    z-index: 1;
    font-size: 7.2vh;
    font-weight: 900;
    line-height: 6.2vh;
    width: 100%;
    text-align: right;
    font-variant-numeric: tabular-nums;

    &.zero {
      color: ${StyleColor.WARNNING};
    }
  `,
};

const Footer = {
  Wrap: styled.div`
    z-index: 1;
    height: 25%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${StyleColor.BORDER};
    padding: 0 16px;
    position: relative;

    @media screen and (max-height: 1070px) {
      display: none !important;
    }
  `,
  Progress: styled.div<{ progress: number }>`
    z-index: 1;
    position: absolute;
    left: 0px;
    top: 0px;
    height: 100%;
    background: ${StyleColor.DISABLE};
    width: ${({ progress }) => progress}%;
  `,
  Mid: styled.p`
    z-index: 1;
    font-size: 54px;
    color: ${StyleColor.DARK}90;
    font-weight: 600;
    line-height: 72px;
    max-width: 64%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  EndTime: styled.p`
    max-width: 350px;
    z-index: 1;
    font-size: 58px;
    color: ${StyleColor.DARK}90;
    font-weight: 600;
    line-height: 72px;
    font-variant-numeric: tabular-nums;
  `,
};
