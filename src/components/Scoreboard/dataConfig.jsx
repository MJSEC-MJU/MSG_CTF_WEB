export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { color: '#FFFFFF', font: { size: 14 } },
    },
  },
  scales: {
    x: {
      ticks: { color: '#FFFFFF', font: { size: 12 } },
      grid: { color: 'rgba(255, 255, 255, 0.2)' },
    },
    y: {
      ticks: { color: '#FFFFFF', font: { size: 12 } },
      grid: { color: 'rgba(255, 255, 255, 0.2)' },
    },
  },
};

const individualColors = [
  'rgba(54, 162, 235, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(99, 255, 182, 1)'
];
const universityColors = [
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(255, 88, 116, 1)'
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
    eventSource = new EventSource('https://msg.mjsec.kr/api/leaderboard/graph');

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
        const universityTotalScores = {};

        parsedData.forEach((item) => {
          const userId = item.userId;
          const university = item.univ || 'Individual Ranking';
          const timeLabel = item.solvedTime.slice(0, 19);
          const timeIndex = timeLabels.indexOf(timeLabel);

          // 개인 랭킹 처리
          if (!individualRanking[userId]) {
            individualRanking[userId] = {
              id: userId,
              scores: Array(timeLabels.length).fill(0),
              color: individualColors[Object.keys(individualRanking).length % individualColors.length],
              lastSubmissionTime: timeLabel, // 최초 제출 시간 기록
            };
          } else {
            // 기존 기록과 비교하여 더 늦은 제출시간(최종 제출 시간)을 저장
            if (timeLabel > individualRanking[userId].lastSubmissionTime) {
              individualRanking[userId].lastSubmissionTime = timeLabel;
            }
          }
          individualRanking[userId].scores[timeIndex] += item.currentScore;

          // 대학별 랭킹 처리
          if (university !== 'Individual Ranking') {
            if (!universityTotalScores[university]) {
              universityTotalScores[university] = {
                id: university,
                scores: Array(timeLabels.length).fill(0),
                color: universityColors[Object.keys(universityTotalScores).length % universityColors.length],
              };
            }
            universityTotalScores[university].scores[timeIndex] += item.currentScore;
          }
        });

        // 개인별 누적 합산
        Object.values(individualRanking).forEach((user) => {
          for (let i = 1; i < timeLabels.length; i++) {
            if (user.scores[i] === 0) {
              user.scores[i] = user.scores[i - 1] ?? 0;
            } else {
              user.scores[i] += user.scores[i - 1] ?? 0;
            }
          }
        });
        // 대학별 누적 합산
        Object.values(universityTotalScores).forEach((univ) => {
          for (let i = 1; i < timeLabels.length; i++) {
            if (univ.scores[i] === 0) {
              univ.scores[i] = univ.scores[i - 1] ?? 0;
            } else {
              univ.scores[i] += univ.scores[i - 1] ?? 0;
            }
          }
        });

        // 개인 랭킹 정렬: 점수가 높은 순으로 정렬하고, 동일한 경우 마지막 제출 시간이 빠른 순으로 정렬
        const topIndividuals = Object.values(individualRanking)
          .sort((a, b) => {
            const scoreDiff = b.scores[b.scores.length - 1] - a.scores[a.scores.length - 1];
            if (scoreDiff !== 0) return scoreDiff;
            // 점수가 동일하면 마지막 제출 시간이 빠른 사용자가 우선순위를 가짐
            if (a.lastSubmissionTime < b.lastSubmissionTime) return -1;
            if (a.lastSubmissionTime > b.lastSubmissionTime) return 1;
            return 0;
          })
          .slice(0, 3);

        // 상위 3명에게 개별 색상 재지정
        topIndividuals.forEach((user, index) => {
          user.color = individualColors[index]; // 0, 1, 2 순으로 배정
        });

        const finalData = [
          { title: 'Individual Ranking', data: topIndividuals, labels: timeLabels },
          { title: 'University Ranking', data: Object.values(universityTotalScores), labels: timeLabels }
        ];

        setDatasetsConfig(finalData);
        setLoading(false);
        console.log('업데이트된 datasetsConfig:', finalData);
      } catch (err) {
        console.error('데이터 처리 중 오류 발생:', err.message);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE 오류 발생:', error);
      eventSource.close();
    };
  };

  // 최초 SSE 연결
  connectSSE();

  // 1시간마다 재연결
  reconnectInterval = setInterval(connectSSE, 60 * 60 * 1000);
};
