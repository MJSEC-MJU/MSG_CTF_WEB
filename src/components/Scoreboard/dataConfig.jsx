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

const individualColors = ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(99, 255, 182,1)'];
const universityColors = ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 88, 116,1)'];

export const fetchLeaderboardData = (setDatasetsConfig,setLoading) => {
  const eventSource = new EventSource('https://msg.mjsec.kr/api/leaderboard/graph');

  eventSource.onopen = () => {
    console.log('SSE 연결이 열렸습니다.');
  };

  eventSource.addEventListener("update", (event) => {
    try {
      console.log('수신된 데이터:', event.data);

      const parsedData = JSON.parse(event.data); // data 부분을 따로 추출할 필요 없이 바로 파싱
      if (!Array.isArray(parsedData)) throw new Error('응답 데이터 형식이 잘못되었습니다.');
  
      console.log('파싱된 데이터:', parsedData);

      const timeLabels = [...new Set(parsedData.map(item => item.solvedTime.slice(0, 19)))].sort();
      const individualRanking = {};
      const universityTotalScores = {};

      parsedData.forEach((item) => {
        const userId = item.userId;
        const university = item.univ || 'Individual Ranking';
        const timeIndex = timeLabels.indexOf(item.solvedTime.slice(0, 19));
        
        //개인랭킹
        if (!individualRanking[userId]) {
          individualRanking[userId] = {
            id: userId,
            scores: Array(timeLabels.length).fill(0),
            color: individualColors[Object.keys(individualRanking).length % individualColors.length],
          };
        }
       // currentScore로 점수 갱신 + 누적
       if (timeIndex > 0) {
        individualRanking[userId].scores[timeIndex] = individualRanking[userId].scores[timeIndex - 1] + item.currentScore;
      } else {
        individualRanking[userId].scores[timeIndex] = individualRanking[userId].scores[timeIndex - 1]
      }

        
        //대학별 랭킹
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

      Object.values(universityTotalScores).forEach((univ) => {
        for (let i = 1; i < timeLabels.length; i++) {
          if (univ.scores[i] === 0) {
            univ.scores[i] = univ.scores[i - 1] ?? 0;
          } else {
            univ.scores[i] += univ.scores[i - 1] ?? 0;
          }
        }
      });

      const topIndividuals = Object.values(individualRanking)
        .sort((a, b) => b.scores[b.scores.length - 1] - a.scores[a.scores.length - 1])
        .slice(0, 3);

      const finalData = [
        { title: 'Individual Ranking', data: topIndividuals, labels: timeLabels },
        { title: 'University Ranking', data: Object.values(universityTotalScores), labels: timeLabels }
      ];

      setDatasetsConfig(finalData);
      setLoading(false);  // 데이터를 받은 후 로딩 상태 해제
      console.log(' 업데이트된 datasetsConfig:', finalData);
    } catch (err) {
      console.error('데이터 처리 중 오류 발생:', err.message);
    }
  });

  eventSource.onerror = (error) => {
    console.error(' SSE 오류 발생:', error);
    eventSource.close();
  };
};



