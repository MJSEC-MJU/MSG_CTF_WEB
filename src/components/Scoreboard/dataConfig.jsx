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

// 최대 3명까지 색상을 다르게 설정
const individualColors = ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(99, 255, 182,1)'];
const universityColors = ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 88, 116,1)'];

//SSE함수
export let datasetsConfig = [];
export const fetchLeaderboardData = (setDatasetsConfig) => {
  const eventSource = new EventSource('https://msg.mjsec.kr/api/leaderboard/stream');

  eventSource.onopen = () => {
    console.log('✅ SSE 연결이 열렸습니다.');
  };

  eventSource.onmessage = (event) => {
    try {
      console.log('📩 수신된 데이터:', event.data);
      const parsedData = JSON.parse(event.data);

      if (!Array.isArray(parsedData)) {
        throw new Error('응답 데이터 형식이 잘못되었습니다.');
      }

      // 개인 및 대학별 랭킹 데이터 저장
      const individualRanking = [];
      const universityRanking = {}; // 대학별 개별 점수 저장
      const universityTotalScores = {}; // 대학별 총 점수 저장

      let individualColorIndex = 0;
      const universityColorIndices = {};

      parsedData.forEach((item) => {
        const university = item.univ || 'Individual Ranking';
        let color;

        // **1. 개인 랭킹 처리 (대학이 있어도 포함)**
        color = individualColors[individualColorIndex % individualColors.length];
        individualColorIndex++;

        individualRanking.push({
          id: item.userid,
          scores: [item.totalPoint],
          color,
          lastSolvedTime: item.lastSolvedTime,
        });

        // **2. 대학별 랭킹 처리 (대학이 있는 경우)**
        if (university !== 'Individual Ranking') {
          if (!universityColorIndices[university]) {
            universityColorIndices[university] = 0;
          }
          const universityColor = universityColors[universityColorIndices[university] % universityColors.length];
          universityColorIndices[university]++;

          // 개별 사용자 점수 저장
          if (!universityRanking[university]) {
            universityRanking[university] = [];
          }
          universityRanking[university].push({
            id: item.userid,
            scores: [item.totalPoint],
            color: universityColor,
            lastSolvedTime: item.lastSolvedTime,
          });

          // **대학별 총 점수 합산**
          if (!universityTotalScores[university]) {
            universityTotalScores[university] = 0;
          }
          universityTotalScores[university] += item.totalPoint;
        }
      });

      // **3. 점수 기준 내림차순 정렬 + 동점자는 시간순 정렬**
      individualRanking.sort((a, b) => {
        if (b.scores[0] !== a.scores[0]) {
          return b.scores[0] - a.scores[0]; // 점수 높은 순
        }
        return new Date(a.lastSolvedTime) - new Date(b.lastSolvedTime); // 동점이면 먼저 푼 순
      });

      // **4. 상위 3명만 선택**
      const topIndividuals = individualRanking.slice(0, 3);

      // **5. 대학별 점수를 하나의 표로 합산**
      const universityRankingData = Object.keys(universityTotalScores).map((univ) => ({
        id: univ,
        scores: [universityTotalScores[univ]],
        color: universityColors[Object.keys(universityTotalScores).indexOf(univ) % universityColors.length],
      }));

      // **6. 최종 데이터 생성**
      datasetsConfig = [
        { title: 'Individual Ranking', data: topIndividuals }, // 상위 3명만 반영
        { title: 'University Ranking', data: universityRankingData },
      ];

      console.log('✅ 업데이트된 datasetsConfig:', datasetsConfig);
      setDatasetsConfig(datasetsConfig);
    } catch (err) {
      console.error('❌ 데이터 처리 중 오류 발생:', err.message);
    }
  };

  eventSource.onerror = (error) => {
    console.error('🚨 SSE 오류 발생:', error);
    eventSource.close();
  };
};