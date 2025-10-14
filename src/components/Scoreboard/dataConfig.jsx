    const colors = [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
      "rgba(199, 199, 199, 1)",
      "rgba(83, 102, 255, 1)",
      "rgba(255, 99, 255, 1)",
      "rgba(99, 255, 132, 1)",
      "rgba(54, 99, 235, 1)",
      "rgba(192, 75, 192, 1)",
      "rgba(255, 206, 100, 1)",
      "rgba(153, 50, 255, 1)",
      "rgba(255, 159, 200, 1)",
      "rgba(199, 50, 199, 1)",
      "rgba(83, 200, 255, 1)",
      "rgba(255, 50, 255, 1)",
      "rgba(99, 255, 200, 1)",
      "rgba(54, 150, 235, 1)",
    ];

export const fetchLeaderboardData = (setDatasetsConfig, setLoading) => {
  let eventSource;
  let reconnectInterval;

  const connectSSE = () => {
    // 기존 연결 종료 (이미 연결되어 있다면)
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    // 새 SSE 연결 생성
    eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/api/leaderboard/graph`);

    eventSource.onopen = () => {
      console.log('SSE 연결이 열렸습니다.');
    };

    eventSource.addEventListener("update", (event) => {
      try {
        console.log('수신된 데이터:', event.data);
        const parsedData = JSON.parse(event.data);
        if (!Array.isArray(parsedData)) throw new Error('응답 데이터 형식이 잘못되었습니다.');

        console.log('파싱된 데이터:', parsedData);

        const timeLabels = [...new Set(parsedData.map(item => item.solvedTime.slice(0, 19)))].sort();
        const individualRanking = {};

        parsedData.forEach((item) => {
          const userId = item.loginId;
          const timeLabel = item.solvedTime.slice(0, 19);
          const timeIndex = timeLabels.indexOf(timeLabel);

          // 개인 랭킹 처리
          if (!individualRanking[userId]) {
            individualRanking[userId] = {
              id: userId,
              scores: Array(timeLabels.length).fill(0),
              // color: colors[Object.keys(individualRanking).length % colors.length],
              lastSubmissionTime: timeLabel, // 최초 제출 시간 기록
            };
          } else {
            // 기존 기록과 비교하여 더 늦은 제출시간(최종 제출 시간)을 저장
            if (timeLabel > individualRanking[userId].lastSubmissionTime) {
              individualRanking[userId].lastSubmissionTime = timeLabel;
            }
          }
          individualRanking[userId].scores[timeIndex] += item.currentScore;
        });

        // 팀별 누적 합산
        // Object.values(individualRanking).forEach((user) => {
        //   for (let i = 1; i < timeLabels.length; i++) {
        //     if (user.scores[i] === 0) {
        //       user.scores[i] = user.scores[i - 1] ?? 0;
        //     } else {
        //       user.scores[i] += user.scores[i - 1] ?? 0;
        //     }
        //   }
        // });

        // 시작 지점에 따른 그래프 처리
        // 팀별 누적 합산
        Object.values(individualRanking).forEach((user) => {
          let firstSolved = false;
          for (let i = 0; i < timeLabels.length; i++) {
            if (user.scores[i] === 0 && !firstSolved) {
              user.scores[i] = null; // 아직 문제를 안 푼 상태는 null로 표시
            } else {
              firstSolved = true;
              if (i > 0 && user.scores[i] !== null) {
                // 이전까지의 누적 합산
                user.scores[i] += user.scores[i - 1] ?? 0;
              }
            }
          }
        });


        // 개인 랭킹 정렬: 점수가 높은 순으로 정렬하고, 동일한 경우 마지막 제출 시간이 빠른 순으로 정렬
        const sortIndividuals = Object.values(individualRanking)
          .sort((a, b) => {
            const scoreDiff = b.scores[b.scores.length - 1] - a.scores[a.scores.length - 1];
            if (scoreDiff !== 0) return scoreDiff;
            // 점수가 동일하면 마지막 제출 시간이 빠른 사용자가 우선순위를 가짐
            if (a.lastSubmissionTime < b.lastSubmissionTime) return -1;
            if (a.lastSubmissionTime > b.lastSubmissionTime) return 1;
            return 0;
          })
          // .slice(0, 3);

        sortIndividuals.forEach((user, index) => {
          user.color = colors[index%colors.length]; 
        });

        const chartDatasets = sortIndividuals.map((user, index) => ({
          id: user.id,
          color: colors[index % colors.length],
          scores: timeLabels.map((t, i) => ({
            time: t,
            value: user.scores[i] ?? 0,
          })),
        }));

        const finalData = [
          { title: 'Individual Ranking', data: chartDatasets },
        ];

        setDatasetsConfig(finalData);
        setLoading(false);
        console.log('업데이트된 datasetsConfig:', finalData);
      } catch (err) {
        console.error('데이터 처리 중 오류 발생:', err.message);
      }
    });

    eventSource.onerror = (error) => {
      //console.error('SSE 오류 발생:', error);
      eventSource.close();
    };
  };

  // 최초 SSE 연결
  connectSSE();

  // 1시간마다 재연결
  reconnectInterval = setInterval(connectSSE, 60 * 60 * 1000);
};

// ✅ 수정: time.parser를 ISO 문자열 형식으로 지정
export const options = {
  responsive: true,
  plugins: {
    legend: { position: "top", labels: { color: "#ffffff" } },
    title: { display: true, text: "Score Progression", color: "#ffffff" },
  },
  scales: {
    x: {
      type: "time",
      time: {
        parser: "YYYY-MM-DDTHH:mm:ss", // ✅ 수정
        unit: "minute", // ✅ hour → minute로 변경 (더 세밀한 시간 표시)
        displayFormats: { minute: "HH:mm" },
      },
      ticks: { color: "#ffffff" },
      grid: { color: "rgba(255,255,255,0.2)" },
    },
    y: {
      ticks: { color: "#ffffff" },
      grid: { color: "rgba(255,255,255,0.2)" },
    },
  },
};