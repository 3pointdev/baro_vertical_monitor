class TimeModule {
  /**
   * ms를 입력받아 시간형태로 리턴
   * ex) 1시간 미만 21:31
   * ex) 1시간 이상 02:21:31
   */
  public msToHHMM(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms / 60000) % 60);
    const seconds = Math.floor((ms / 1000) % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  }

  public msToString(millisecond: number): string {
    const totalSeconds = Math.floor(millisecond / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = [];

    if (hours > 0) {
      formattedTime.push(`${hours}시간`);
    }

    if (minutes > 0) {
      formattedTime.push(`${minutes}분`);
    }

    if (seconds > 0 || (hours === 0 && minutes === 0)) {
      formattedTime.push(`${seconds}초`);
    }

    return formattedTime.join(" ");
  }
}

const timeInstance = new TimeModule();
export default timeInstance;
