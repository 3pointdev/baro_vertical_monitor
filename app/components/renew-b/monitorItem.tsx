import machineStatusInstance from "modules/machineStatus.module";
import timeInstance from "modules/time.module";
import { StyleColor } from "public/color";
import { useEffect, useRef, useState } from "react";
import { MachineColorType, MachineTextType } from "src/config/constants";
import MachineDto from "src/dto/machine/machine.dto";
import styled, { keyframes } from "styled-components";

interface IProps {
  data: MachineDto;
}

export default function MonitorItem({ data }: IProps) {
  const [executionText, setExecutionText] = useState<MachineTextType>(
    MachineTextType.MODIFY
  );
  const [executionColor, setExecutionColor] = useState<string>("");
  const [realTime, setRealTime] = useState<number>(data.remainTime);
  const realTimeRef = useRef<number>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(1000);
  const elapsedRef = useRef<number>(null);
  const [intervalId, setIntervalId] = useState<any>();

  /**
   * execution이 active일때 타이머 작동함수
   */
  useEffect(() => {
    realTimeRef.current = data.remainTime;
    elapsedRef.current = 0;
    setRealTime(data.remainTime);
    setElapsedTime(0);

    clearInterval(intervalId);
    setIntervalId(null);

    if (executionText === MachineTextType.ACTIVE) {
      const interval = setInterval(() => {
        realTimeRef.current = realTimeRef.current - 1000;
        setRealTime(realTimeRef.current);
      }, 1000);
      setIntervalId(interval);
    } else if (executionText === MachineTextType.SUCCESS) {
      const interval = setInterval(() => {
        elapsedRef.current = elapsedRef.current + 1000;
        setElapsedTime(elapsedRef.current);
      }, 1000);
      setIntervalId(interval);
    }
  }, [executionText]);

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
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (executionText === MachineTextType.OFF) {
    return (
      <Container className="power_off">
        <MachineNumber>{data.machineNo}</MachineNumber>
        <OffSign>전원꺼짐</OffSign>
      </Container>
    );
  }

  if (executionText === MachineTextType.SUCCESS) {
    if (elapsedTime > 60000) {
      return (
        <SuccessSign className="success">
          <span>{`${data.machineNo}번 ${data.mid} 홍길동님`}</span>
          <span>{`${data.partCount}번째 가공완료 후`}</span>
          <div>
            <span className="warnning_highlight">{`${timeInstance.msToString(
              elapsedTime
            )} 경과`}</span>
            <span>되었습니다.</span>
          </div>
        </SuccessSign>
      );
    } else {
      return (
        <SuccessSign className="success">
          <span>{`${data.machineNo}번 ${data.mid} 홍길동님`}</span>
          <div>
            <span className="blue_highlight">{data.partCount}</span>
            <span>번째</span>
            <span className="blue_highlight">가공완료</span>
            <span>되었습니다.</span>
          </div>
        </SuccessSign>
      );
    }
  }

  return (
    <Container className="monitoring_item">
      <MachineStatusWrap backgroundColor={executionColor}>
        <MachineNumber>{data.machineNo}</MachineNumber>
        <Counter>{`${data.partCount} / ${data.planCount}`}</Counter>
        <Worker>홍길동</Worker>
        <ProductionInfomation textlength={data.program?.length}>
          <p className="program">{data.program}</p>
          <p className="machine_name">{data.mid}</p>
        </ProductionInfomation>
      </MachineStatusWrap>
      <RealTimeWrap>
        <SingleETA>
          {executionText === MachineTextType.ACTIVE ? (
            <p>{timeInstance.msToHHMM(realTime > 0 ? realTime : 0)}</p>
          ) : (
            <p>{executionText}</p>
          )}
        </SingleETA>
        <TotalETA>
          {data.partCount > data.planCount
            ? "초과 생산 중"
            : data.partCount > 1
            ? timeInstance.msToString(data.doneTime)
            : "계산 대기 중"}
        </TotalETA>
      </RealTimeWrap>
    </Container>
  );
}

const slideAnimation = keyframes`
  0% {
    transform: translateX(102%);
  }
  100% {
    transform: translateX(-102%);
  }
`;

const Container = styled.li`
  position: relative;
  width: 100%;
  height: calc(25% - 12px);
  display: flex;

  &.power_off {
    background: ${MachineColorType.GRAY};
  }
`;

const MachineStatusWrap = styled.div<{ backgroundColor: string }>`
  width: calc(60% - 32px);
  background: ${({ backgroundColor }) => backgroundColor};
  padding: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;

  & p {
    color: ${StyleColor.LIGHT};
  }
`;

const MachineNumber = styled.p`
  width: 8vw;
  height: 8vw;
  border-radius: 50%;
  background: ${MachineColorType.GRAY};
  display: flex;
  align-items: center;
  justify-content: center;

  color: ${StyleColor.LIGHT};
  font-size: 6vw;
  line-height: 6vw;
  font-weight: 700;
`;

const Counter = styled.p`
  position: absolute;
  right: 16px;
  top: 16px;
  font-size: 5.6vw;
  font-weight: 700;
`;

const Worker = styled.p`
  color: ${StyleColor.LIGHT};
  font-size: 6cap;
  font-weight: 600;
`;

const ProductionInfomation = styled.div<{ textlength: number }>`
  display: flex;
  flex-direction: column;
  justify-content: end;
  gap: 8px;
  min-height: 127px;
  overflow: hidden;
  white-space: nowrap;

  & p {
    width: 100%;
    color: ${StyleColor.LIGHT};
    font-size: 4.6vw;
    font-weight: 600;
  }

  & .program {
    width: max-content;
    animation: ${({ textlength }) =>
        textlength > 20 ? slideAnimation : "none"}
      8s linear infinite;
  }
`;

const RealTimeWrap = styled.div`
  flex-shrink: 0;
  width: calc(40% - 32px);
  background: ${StyleColor.LIGHT};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
`;

const SingleETA = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${StyleColor.DARK};
  font-size: 10vw;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
`;

const TotalETA = styled.div`
  flex-shrink: 0;
  width: 100%;
  text-align: end;
  color: ${StyleColor.DARKEMPHASIS};
  font-size: 4.4vw;
  font-weight: 600;
`;

const OffSign = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${StyleColor.LIGHT};
  font-size: 12vw;
  font-weight: 600;
`;

const SuccessSign = styled.div`
  position: relative;
  width: 100%;
  height: calc(25% - 12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #fbcf00;

  font-size: 6vw;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  & > div {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  & span.blue_highlight {
    font-size: 8vw;
    font-weight: 700;
    color: #0000ff;
  }

  & span.warnning_highlight {
    font-size: 8vw;
    font-weight: 700;
    color: #ff0000;
  }
`;
