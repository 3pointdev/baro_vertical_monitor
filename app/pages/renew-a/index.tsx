import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Linker from "components/linker/linker";
import MonitorItem from "components/renew-a/monitorItem";
import Timer from "components/timer/timer";
import { inject, observer } from "mobx-react";
import { NextRouter } from "next/router";
import { StyleColor } from "public/color";
import BarofactorySquare from "public/images/logo/barofactory-square";
import { MouseEvent, useEffect, useState } from "react";
import MachineDto from "src/dto/machine/machine.dto";
import MonitorListDto from "src/dto/monitor/monitorList.dto";
import VersionDto from "src/dto/monitor/version.dto";
import ViewModel from "src/viewModel/viewModel";
import styled, { css, keyframes } from "styled-components";

interface IProps {
  viewModel: ViewModel;
  router: NextRouter;
}

function Home({ router, viewModel }: IProps) {
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const [isOpenMonitorMenu, setIsOpenMonitorMenu] = useState<boolean>(false);
  const [isOpenVersionMenu, setIsOpenVersionMenu] = useState<boolean>(false);

  useEffect(() => {
    const monitor: string =
      router.query.monitor?.toString() ??
      window.localStorage.getItem("monitor");

    if (monitor) {
      viewModel.initialize(monitor);
    } else {
      viewModel.selectMonitor();
    }

    setTimeout(() => {
      location.replace(`/renew-a?monitor=${monitor}`);
    }, 1200000);

    return () => {
      viewModel.socketDisconnect();
    };
  }, []);

  const handleClickOpenMonitorList = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsOpenMonitorMenu(!isOpenMonitorMenu);
  };

  const handleClickOpenVersionList = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsOpenVersionMenu(!isOpenVersionMenu);
  };

  const handleClickOtherMonitor = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { id } = event.currentTarget.dataset;
    window.localStorage.setItem("monitor", id);
    viewModel.router.replace(`/renew-a?monitor=${id}`);
    viewModel.initialize(id);
    setIsOpenMenu(false);
  };

  const handleClickOtherVersion = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { id } = event.currentTarget.dataset;
    viewModel.router.replace(id);

    setIsOpenMenu(false);
  };

  return (
    <MonitoringContainer>
      <Header.Wrap>
        <Header.Menu icon={faBars} onClick={() => setIsOpenMenu(true)} />
        <Timer />
      </Header.Wrap>
      <Article.Wrap>
        {viewModel.machines.map((machine: MachineDto, key: number) => {
          return <MonitorItem data={machine} key={`machine_${key}`} />;
        })}
      </Article.Wrap>
      <Footer.Wrap>
        <BarofactorySquare color={StyleColor.DARK} />
        <Footer.Notice
          isLongText={viewModel.notice.length > 16}
          length={viewModel.notice.length}
        >
          <p>{viewModel.notice}</p>
        </Footer.Notice>
      </Footer.Wrap>
      <SlideMenu.Wrap className={isOpenMenu ? "is_open" : ""}>
        <SlideMenu.Head>
          <FontAwesomeIcon
            icon={faXmark}
            onClick={() => setIsOpenMenu(false)}
            style={{ cursor: "pointer" }}
          />
        </SlideMenu.Head>

        <SlideMenu.Menu>
          <Linker onClick={handleClickOpenVersionList} className="slide_menu">
            <p>버전</p>
          </Linker>
          <SlideMenu.FolderMenu
            className={isOpenVersionMenu ? "is_open" : ""}
            count={viewModel.versionList.length}
          >
            {viewModel.versionList.map((version: VersionDto) => {
              return (
                <SlideMenu.MonitorChangeLink
                  key={`monitor_list_${version.id}`}
                  onClick={handleClickOtherVersion}
                  data-id={version.url}
                >
                  <SlideMenu.MonitorName
                    className={
                      version.url === viewModel.router.pathname ? "active" : ""
                    }
                  >
                    {version.name}
                  </SlideMenu.MonitorName>
                </SlideMenu.MonitorChangeLink>
              );
            })}
          </SlideMenu.FolderMenu>
          <Linker onClick={handleClickOpenMonitorList} className="slide_menu">
            <p>모니터 목록</p>
          </Linker>
          <SlideMenu.FolderMenu
            className={isOpenMonitorMenu ? "is_open" : ""}
            count={viewModel.monitorList.length}
          >
            {viewModel.monitorList.map(
              (monitor: MonitorListDto, key: number) => {
                return (
                  <SlideMenu.MonitorChangeLink
                    key={`monitor_list_${key}`}
                    onClick={handleClickOtherMonitor}
                    data-id={monitor.name}
                  >
                    <SlideMenu.MonitorName
                      className={
                        monitor.name === viewModel.router.query.monitor
                          ? "active"
                          : ""
                      }
                    >
                      {monitor.name}
                    </SlideMenu.MonitorName>
                  </SlideMenu.MonitorChangeLink>
                );
              }
            )}
          </SlideMenu.FolderMenu>
          <div className="slide_menu" onClick={viewModel.insertLogout}>
            <p onClick={viewModel.insertLogout}>로그아웃</p>
          </div>
        </SlideMenu.Menu>
        <SlideMenu.Foot>BAROFACTORY</SlideMenu.Foot>
      </SlideMenu.Wrap>
    </MonitoringContainer>
  );
}

export default inject("viewModel")(observer(Home));

const MonitoringContainer = styled.div`
  background: ${StyleColor.BACKGROUND};
  height: 100vh;
  min-width: 460px;
`;

const Header = {
  Wrap: styled.div`
    min-width: 460px;
    display: flex;
    align-items: center;
    padding: 23px 20px;
    height: 80px;
    position: relative;
    background: ${StyleColor.BACKGROUND};
    border-bottom: 1px solid ${StyleColor.DARKBACKGROUND};
  `,

  Menu: styled(FontAwesomeIcon)`
    z-index: 2;
    font-size: 56px;
    cursor: pointer;
  `,
};

const Article = {
  Wrap: styled.ul`
    height: calc(100vh - 270px);
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  `,
};

const textScroll = keyframes`
  from{
    transform:translateX(50%);
    -moz-transform:translateX(50%);
    -webkit-transform:translateX(50%);
    -o-transform:translateX(50%);
    -ms-transform:translateX(50%);
  }
  to{
    transform:translateX(-105%);
    -moz-transform:translateX(-105%);
    -webkit-transform:translateX(-105%);
    -o-transform:translateX(-105%);
    -ms-transform:translateX(-105%);
  }
`;

const Footer = {
  Wrap: styled.div`
    height: 120px;
    width: 100%;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 32px;
    background: ${StyleColor.BACKGROUND};
    border-top: 1px solid ${StyleColor.DARKBACKGROUND};
    overflow: hidden;

    & svg {
      flex-shrink: 0;
      height: 120px;
      width: 120px;
      background: ${StyleColor.BACKGROUND};
      z-index: 99;
    }
  `,
  Notice: styled.div<{ isLongText: boolean; length: number }>`
    font-size: 3.6vh;
    font-weight: 500;
    line-height: 1;
    font-family: "pretendard", sans-serif;
    white-space: nowrap;
    color: ${StyleColor.DARK};
    overflow: hidden;

    & p {
      width: max-content;
      animation: ${({ isLongText, length }) =>
        isLongText
          ? css`
              ${textScroll} ${length * 0.2}s linear infinite
            `
          : ""};
    }
  `,
};

const SlideMenu = {
  Wrap: styled.div`
    z-index: 100;
    position: fixed;
    left: -100vw;
    top: 0px;
    background: ${StyleColor.LIGHT};
    width: 100vw;
    height: 100vh;
    transition: all 0.4s ease;
    display: flex;
    flex-direction: column;

    &.is_open {
      left: 0px;
    }
  `,
  Head: styled.div`
    width: calc(100% - 120px);
    height: 136px;
    border-bottom: 1px solid ${StyleColor.DARKBACKGROUND};
    display: flex;
    padding: 32px 60px;
    align-items: center;
    justify-content: end;

    font-size: 60px;
  `,
  Menu: styled.div`
    width: 100%;
    height: calc(100vh - 336px);
    display: flex;
    flex-direction: column;
    margin-top: 80px;
    font-size: 64px;
    font-weight: 600;

    & .slide_menu {
      width: calc(100% - 56px);
      height: 120px;
      margin-top: 32px;
      padding-left: 56px;
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover {
        background: ${StyleColor.BRIGHTEMPHASIS};
      }
    }
  `,
  Foot: styled.div`
    width: 100%;
    height: 200px;
    font-size: 48px;
    font-weight: 700;
    color: ${StyleColor.DARK}85;
    text-align: center;
  `,
  FolderMenu: styled.div<{ count: number }>`
    overflow: hidden;
    height: 0 !important;
    margin: 0 !important;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;

    &.is_open {
      height: ${({ count }) => 120 * count}px !important;
      margin: 24px 0 !important;
    }
  `,
  MonitorName: styled.p`
    font-weight: 400;
    &.active {
      color: ${StyleColor.PRIMARY};
    }
  `,
  MonitorChangeLink: styled.div`
    padding-left: 80px;
    height: 120px !important;
    margin-top: 8px;
    line-height: 112px;
    cursor: pointer;

    &:hover {
      background: ${StyleColor.BRIGHTEMPHASIS};
    }
  `,
};
